"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowUpDown, Loader2, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { EditTransaction, DeleteTransaction } from "./transaction-actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Transaction, TransactionFilters } from "./transaction-dashboard"
import { BASE_URL } from "@/app/constants/endpoints"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TransactionTableProps {
  filters: TransactionFilters
}

interface PaginatedResponse {
  data: Transaction[]
  nextCursor: number | null
  previousCursor: number | null 
  total: number
}

export const buildQueryString = (cursor?: string, filters?: TransactionFilters): string => {
  const params = new URLSearchParams();

  if (cursor) params.append('cursor', cursor);
  if (filters?.payee) params.append('payee', filters.payee);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
  if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
  if (filters?.dateFrom) params.append('dateFrom', new Date(filters.dateFrom)?.toISOString());
  if (filters?.dateTo) params.append('dateTo', new Date(filters.dateTo)?.toISOString());

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

const fetchTransactions = async (cursor?: string, filters?: TransactionFilters): Promise<PaginatedResponse> => {
  const queryString = buildQueryString(cursor, filters);
  const url = `${BASE_URL}/transaction${queryString}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  const responseData = await response.json();

  if (!response.ok || responseData.error) {
    throw new Error(responseData.error.errorMessage || 'Failed to fetch transactions');
  }

  const transactions: Transaction[] = responseData!.data?.transactions;

  return {
    data: transactions,
    nextCursor: responseData?.data?.nextCursor,
    previousCursor: responseData?.data?.previousCursor,
    total: responseData?.data?.totalResult,
  }
}

export function TransactionTable({ filters }: TransactionTableProps) {
  const [cursor, setCursor] = useState<string>()
  const [sorting, setSorting] = useState<SortingState>([])
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions", cursor, filters],
    queryFn: () => fetchTransactions(cursor, filters),
  })


  useEffect(() => {
    if(error) {
      toast.error(error.message + " Need to sign up to view dashboard")
      // router.push("/")
    }
  }, [error])

  const columns: ColumnDef<Transaction>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium text-slate-900">#{row.getValue("id")}</div>,
      },
      {
        accessorKey: "payee",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Payee
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-slate-900 max-w-[200px] truncate">{row.getValue("payee")}</div>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = Number.parseFloat(row.getValue("amount"))
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)

          return <div className="font-semibold text-slate-900">{formatted}</div>
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const category = row.getValue("category") as string
          return (
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
              {category}
            </Badge>
          )
        },
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("date"))
          return <div className="text-slate-600">{format(date, "MMM dd, yyyy")}</div>
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const transaction = row.original

          return (
            <div className="flex items-center justify-end">
              {/* For desktop */}
              <div className="hidden md:flex space-x-1">
                <EditTransaction transaction={transaction} onSuccess={() => refetch()} />
                <DeleteTransaction transactionId={transaction.id} onSuccess={() => refetch()} />
              </div>

              {/* For mobile */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => document.getElementById(`edit-transaction-${transaction.id}`)?.click()}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => document.getElementById(`delete-transaction-${transaction.id}`)?.click()}
                      className="text-red-600 focus:text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  id={`edit-transaction-${transaction.id}`}
                  onClick={() => document.getElementById(`edit-transaction-trigger-${transaction.id}`)?.click()}
                  className="hidden"
                />
                <button
                  id={`delete-transaction-${transaction.id}`}
                  onClick={() => document.getElementById(`delete-transaction-trigger-${transaction.id}`)?.click()}
                  className="hidden"
                />
                <div className="hidden">
                  <EditTransaction transaction={transaction} onSuccess={() => refetch()} />
                  <DeleteTransaction transactionId={transaction.id} onSuccess={() => refetch()} />
                </div>
              </div>
            </div>
          )
        },
      },
    ],
    [refetch],
  )

  const table = useReactTable({
    data: data?.data || [],
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-red-600">
        Error loading transactions. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-slate-200">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-slate-700 font-semibold">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      <span className="ml-2 text-slate-600">Loading transactions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="text-slate-500">No transactions found.</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
         Showing {data?.data?.length} of {data?.total} transactions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(String(data?.previousCursor))}
            disabled={!data?.previousCursor || isLoading}
            className="border-slate-300 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(String(data?.nextCursor))}
            disabled={!data?.nextCursor || isLoading}
            className="border-slate-300 hover:bg-slate-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}

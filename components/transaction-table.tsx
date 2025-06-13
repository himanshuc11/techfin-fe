"use client"

import { useState, useMemo } from "react"
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

interface TransactionTableProps {
  filters: TransactionFilters
}

interface PaginatedResponse {
  data: Transaction[]
  nextCursor?: string
  hasMore: boolean
  total: number
}

// Mock API function - replace with actual API call
const fetchTransactions = async (cursor?: string, filters?: TransactionFilters): Promise<PaginatedResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data
  const allData: Transaction[] = [
    {
      id: 1,
      payee: "Update kr vapids maine",
      amount: "1000.00",
      category: "World",
      date: "2025-06-12",
    },
    {
      id: 4,
      payee: "Himanshu",
      amount: "245.51",
      category: "World",
      date: "2025-06-12",
    },
    {
      id: 5,
      payee: "Amazon Purchase",
      amount: "89.99",
      category: "Shopping",
      date: "2025-06-11",
    },
    {
      id: 6,
      payee: "Starbucks Coffee",
      amount: "12.50",
      category: "Food",
      date: "2025-06-10",
    },
    {
      id: 7,
      payee: "Uber Ride",
      amount: "25.75",
      category: "Transport",
      date: "2025-06-09",
    },
  ]

  // Apply filters
  let filteredData = allData

  if (filters?.payee) {
    filteredData = filteredData.filter((item) => item.payee.toLowerCase().includes(filters.payee!.toLowerCase()))
  }

  if (filters?.minAmount) {
    filteredData = filteredData.filter((item) => Number.parseFloat(item.amount) >= filters.minAmount!)
  }

  if (filters?.maxAmount) {
    filteredData = filteredData.filter((item) => Number.parseFloat(item.amount) <= filters.maxAmount!)
  }

  if (filters?.category) {
    filteredData = filteredData.filter((item) => item.category === filters.category)
  }

  if (filters?.dateFrom) {
    filteredData = filteredData.filter((item) => item.date >= filters.dateFrom!)
  }

  if (filters?.dateTo) {
    filteredData = filteredData.filter((item) => item.date <= filters.dateTo!)
  }

  // Simulate cursor-based pagination
  const pageSize = 10
  const startIndex = cursor ? Number.parseInt(cursor) : 0
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  return {
    data: paginatedData,
    nextCursor: endIndex < filteredData.length ? endIndex.toString() : undefined,
    hasMore: endIndex < filteredData.length,
    total: filteredData.length,
  }
}

export function TransactionTable({ filters }: TransactionTableProps) {
  const [cursor, setCursor] = useState<string>()
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions", cursor, filters],
    queryFn: () => fetchTransactions(cursor, filters),
    keepPreviousData: true,
  })

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
          {data?.total ? `Showing ${data.data.length} of ${data.total} transactions` : ""}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(undefined)}
            disabled={!cursor || isLoading}
            className="border-slate-300 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(data?.nextCursor)}
            disabled={!data?.hasMore || isLoading}
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

"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TransactionForm } from "./transaction-form"
import type { Transaction } from "./transaction-dashboard"
import { BASE_URL } from "@/app/constants/endpoints"

const addTransaction = async (data: Omit<Transaction, "id">): Promise<Transaction> => {
  const url = `${BASE_URL}/transaction/add`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const responseData = await response.json();

  if (!response.ok || responseData.error) {
    throw new Error(responseData.error.errorMessage || 'Failed to fetch transactions');
  }


  return {
    ...responseData.data
  }
}

const updateTransaction = async (data: Transaction): Promise<Transaction> => {
  const url = `${BASE_URL}/transaction/update`

  const payload = { ...data, transactionId: data.id } as Partial<Transaction>
  delete payload["id"]

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const responseData = await response.json();

  if (!response.ok || responseData.error) {
    throw new Error(responseData.error.errorMessage || 'Failed to fetch transactions');
  }


  return {
    ...responseData.data
  }
}

const deleteTransaction = async (id: number): Promise<void> => {
  const url = `${BASE_URL}/transaction/delete`

  const payload = { transactionId: id } as Partial<Transaction>

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const responseData = await response.json();

  if (!response.ok || responseData.error) {
    throw new Error(responseData.error.errorMessage || 'Failed to fetch transactions');
  }


  return {
    ...responseData.data,
  }
}

interface AddTransactionProps {
  onSuccess?: () => void
}

export function AddTransactionButton({ onSuccess }: AddTransactionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      setIsOpen(false)
      if (onSuccess) onSuccess()
    },
  })

  const handleSubmit = (data: any) => {
    mutation.mutate({
      payee: data.payee,
      amount: data.amount,
      category: data.category,
      date: data.date.toISOString(),
    })
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-slate-900 hover:bg-slate-800">
        <PlusCircle className="h-4 w-4 mr-2" />
        New Transaction
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Enter the details for the new transaction.</DialogDescription>
          </DialogHeader>
          <TransactionForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
        </DialogContent>
      </Dialog>
    </>
  )
}

interface EditTransactionProps {
  transaction: Transaction
  onSuccess?: () => void
}

export function EditTransaction({ transaction, onSuccess }: EditTransactionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      setIsOpen(false)
      if (onSuccess) onSuccess()
    },
  })

  const handleSubmit = (data: any) => {
    mutation.mutate({
      id: transaction.id,
      payee: data.payee,
      amount: data.amount,
      category: data.category,
      date: data.date.toISOString(),
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 px-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
      >
        Edit
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-xs">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the transaction details.</DialogDescription>
          </DialogHeader>
          <TransactionForm transaction={transaction} onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
        </DialogContent>
      </Dialog>
    </>
  )
}

interface DeleteTransactionProps {
  transactionId: number
  onSuccess?: () => void
}

export function DeleteTransaction({ transactionId, onSuccess }: DeleteTransactionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      setIsOpen(false)
      if (onSuccess) onSuccess()
    },
  })

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        Delete
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mutation.mutate()}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

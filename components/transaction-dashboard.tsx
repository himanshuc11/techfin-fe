"use client"

import { useState } from "react"
import { TransactionTable } from "./transaction-table"
import { TransactionFiltersComponent } from "./transaction-filters"
import { AddTransactionButton } from "./transaction-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, LogOut, TrendingUp, DollarSign, Calendar, Users } from "lucide-react"

export interface Transaction {
  id: number
  payee: string
  amount: string
  category: string
  date: string
}

export interface TransactionFilters {
  payee?: string
  minAmount?: number
  maxAmount?: number
  category?: string
  dateFrom?: string
  dateTo?: string
}

export function TransactionDashboard() {
  const [filters, setFilters] = useState<TransactionFilters>({})

  const handleLogout = () => {
    localStorage.removeItem("auth-token")
    window.location.href = "/"
  }

  const handleDownloadAll = async () => {
    // Mock download functionality - replace with actual API call
    const allData = [
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
    ]

    const csvContent = [
      ["ID", "Payee", "Amount", "Category", "Date"],
      ...allData.map((row) => [row.id, row.payee, row.amount, row.category, row.date]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transaction Dashboard</h1>
          <p className="text-slate-600 mt-1">Monitor and manage your financial transactions</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AddTransactionButton />
          <Button onClick={handleDownloadAll} variant="outline" className="border-slate-300 hover:bg-slate-50">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button onClick={handleLogout} variant="outline" className="border-slate-300 hover:bg-slate-50">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">$1,245.51</div>
            <p className="text-xs text-slate-500 mt-1">+2.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">2</div>
            <p className="text-xs text-slate-500 mt-1">Active this month</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Categories</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">1</div>
            <p className="text-xs text-slate-500 mt-1">World category</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">Today</div>
            <p className="text-xs text-slate-500 mt-1">June 12, 2025</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Filters</CardTitle>
          <CardDescription>Filter transactions by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">Transactions</CardTitle>
            <CardDescription>View and manage your transaction history</CardDescription>
          </div>
          <div className="sm:hidden">
            <AddTransactionButton />
          </div>
        </CardHeader>
        <CardContent>
          <TransactionTable filters={filters} />
        </CardContent>
      </Card>
    </div>
  )
}

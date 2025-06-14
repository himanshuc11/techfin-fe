"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { TransactionFilters } from "./transaction-dashboard"

interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
}

export function TransactionFiltersComponent({ filters, onFiltersChange }: TransactionFiltersProps) {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const categories = ["World", "Food", "Transport"]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Payee Filter */}
        <div className="space-y-2">
          <Label htmlFor="payee-filter" className="text-sm font-medium text-slate-700">
            Payee
          </Label>
          <Input
            id="payee-filter"
            placeholder="Search payee..."
            value={filters.payee || ""}
            onChange={(e) => handleFilterChange("payee", e.target.value)}
            className="border-slate-200 focus:border-slate-400"
          />
        </div>

        {/* Min Amount Filter */}
        <div className="space-y-2">
          <Label htmlFor="min-amount-filter" className="text-sm font-medium text-slate-700">
            Min Amount
          </Label>
          <Input
            id="min-amount-filter"
            type="number"
            placeholder="0.00"
            value={filters.minAmount || ""}
            onChange={(e) => handleFilterChange("minAmount", Number.parseFloat(e.target.value))}
            className="border-slate-200 focus:border-slate-400"
          />
        </div>

        {/* Max Amount Filter */}
        <div className="space-y-2">
          <Label htmlFor="max-amount-filter" className="text-sm font-medium text-slate-700">
            Max Amount
          </Label>
          <Input
            id="max-amount-filter"
            type="number"
            placeholder="1000.00"
            value={filters.maxAmount || ""}
            onChange={(e) => handleFilterChange("maxAmount", Number.parseFloat(e.target.value))}
            className="border-slate-200 focus:border-slate-400"
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Category</Label>
          <Select value={filters.category || ""} onValueChange={(value) => handleFilterChange("category", value)}>
            <SelectTrigger className="border-slate-200 focus:border-slate-400">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date From Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-slate-200",
                  !dateFrom && "text-slate-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={(date) => {
                  setDateFrom(date)
                  handleFilterChange("dateFrom", date ? format(date, "yyyy-MM-dd") : undefined)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date To Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-slate-200",
                  !dateTo && "text-slate-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={(date) => {
                  setDateTo(date)
                  handleFilterChange("dateTo", date ? format(date, "yyyy-MM-dd") : undefined)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="flex justify-end">
        <Button onClick={clearFilters} variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    </div>
  )
}

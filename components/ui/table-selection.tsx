"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface TableSelectionContextType<T> {
  selectedItems: T[]
  toggleItem: (item: T, checked: boolean) => void
  isItemSelected: (item: T) => boolean
  selectAll: (items: T[]) => void
  deselectAll: () => void
  isAllSelected: (items: T[]) => boolean
  isSomeSelected: (items: T[]) => boolean
}

const TableSelectionContext = React.createContext<TableSelectionContextType<any> | undefined>(undefined)

export function useTableSelection<T>() {
  const context = React.useContext(TableSelectionContext)
  if (!context) {
    throw new Error("useTableSelection must be used within a TableSelectionProvider")
  }
  return context as TableSelectionContextType<T>
}

interface TableSelectionProviderProps<T> {
  children: React.ReactNode
  idField?: keyof T
}

export function TableSelectionProvider<T>({ children, idField = "id" as keyof T }: TableSelectionProviderProps<T>) {
  const [selectedItems, setSelectedItems] = React.useState<T[]>([])

  const toggleItem = React.useCallback(
    (item: T, checked: boolean) => {
      if (checked) {
        setSelectedItems((prev) => [...prev, item])
      } else {
        setSelectedItems((prev) => prev.filter((i) => i[idField] !== item[idField]))
      }
    },
    [idField],
  )

  const isItemSelected = React.useCallback(
    (item: T) => {
      return selectedItems.some((i) => i[idField] === item[idField])
    },
    [selectedItems, idField],
  )

  const selectAll = React.useCallback((items: T[]) => {
    setSelectedItems(items)
  }, [])

  const deselectAll = React.useCallback(() => {
    setSelectedItems([])
  }, [])

  const isAllSelected = React.useCallback(
    (items: T[]) => {
      return items.length > 0 && items.every((item) => isItemSelected(item))
    },
    [isItemSelected],
  )

  const isSomeSelected = React.useCallback(
    (items: T[]) => {
      return items.some((item) => isItemSelected(item)) && !isAllSelected(items)
    },
    [isItemSelected, isAllSelected],
  )

  const value = React.useMemo(
    () => ({
      selectedItems,
      toggleItem,
      isItemSelected,
      selectAll,
      deselectAll,
      isAllSelected,
      isSomeSelected,
    }),
    [selectedItems, toggleItem, isItemSelected, selectAll, deselectAll, isAllSelected, isSomeSelected],
  )

  return <TableSelectionContext.Provider value={value}>{children}</TableSelectionContext.Provider>
}

interface SelectAllCheckboxProps<T> {
  items: T[]
  className?: string
}

export function SelectAllCheckbox<T>({ items, className }: SelectAllCheckboxProps<T>) {
  const { isAllSelected, isSomeSelected, selectAll, deselectAll } = useTableSelection<T>()

  const handleChange = (checked: boolean) => {
    if (checked) {
      selectAll(items)
    } else {
      deselectAll()
    }
  }

  return (
    <Checkbox
      checked={isAllSelected(items)}
      indeterminate={isSomeSelected(items)}
      onCheckedChange={handleChange}
      className={cn("rounded-sm", className)}
      aria-label="Select all"
    />
  )
}

interface SelectRowCheckboxProps<T> {
  item: T
  className?: string
}

export function SelectRowCheckbox<T>({ item, className }: SelectRowCheckboxProps<T>) {
  const { isItemSelected, toggleItem } = useTableSelection<T>()
  const checked = isItemSelected(item)

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(checked) => toggleItem(item, !!checked)}
      className={cn("rounded-sm", className)}
      aria-label="Select row"
    />
  )
}

interface SelectionActionsProps {
  children: React.ReactNode
  className?: string
}

export function SelectionActions({ children, className }: SelectionActionsProps) {
  return <div className={cn("flex items-center gap-2", className)}>{children}</div>
}

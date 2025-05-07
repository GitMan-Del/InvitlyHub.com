"use client"

import type React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { useTableSelection } from "@/components/ui/table-selection"

interface SelectRowCheckboxProps<T> {
  item: T
  onClick?: (e: React.MouseEvent) => void
}

export function SelectRowCheckbox<T>({ item, onClick }: SelectRowCheckboxProps<T>) {
  const { isSelected, toggleSelection } = useTableSelection<T>()
  const selected = isSelected(item)

  const handleChange = (e: React.MouseEvent) => {
    if (onClick) onClick(e)
    e.stopPropagation()
    toggleSelection(item)
  }

  return (
    <Checkbox
      checked={selected}
      onClick={handleChange}
      className="data-[state=checked]:bg-[#9855FF] data-[state=checked]:border-[#9855FF]"
    />
  )
}

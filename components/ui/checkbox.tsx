"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    indeterminate?: boolean
  }
>(({ className, indeterminate, ...props }, ref) => {
  const innerRef = React.useRef<HTMLButtonElement>(null)

  React.useImperativeHandle(ref, () => innerRef.current!)

  return (
    <CheckboxPrimitive.Root
      ref={innerRef}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-white/20 bg-transparent shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9855FF] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#9855FF] data-[state=checked]:text-white",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        {indeterminate ? <Minus className="h-3 w-3" /> : <Check className="h-3 w-3" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

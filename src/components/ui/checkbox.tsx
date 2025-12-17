"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center space-x-2 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className={cn(
              "peer h-5 w-5 shrink-0 rounded border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-emerald-600 checked:border-emerald-600 appearance-none",
              className
            )}
            ref={ref}
            {...props}
          />
          <Check className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
        </div>
        {label && (
          <span className="text-sm font-medium text-gray-700">{label}</span>
        )}
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

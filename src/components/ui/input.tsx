import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // h-12 (48px) para un target táctil cómodo; text-base (16px) en vez de text-sm es a
          // propósito, no cosmético: por debajo de 16px, Safari/iOS hace zoom automático al
          // enfocar el campo (un clásico "esto se siente como página web" en el teléfono).
          "flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background transition-colors motion-reduce:transition-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

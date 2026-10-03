import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Mismo criterio que Input: text-base (16px) para que Safari/iOS no haga zoom
          // automático al enfocar el campo.
          "flex min-h-24 w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background transition-colors motion-reduce:transition-none placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

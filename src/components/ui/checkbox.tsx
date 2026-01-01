"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { useAppContext } from "../AppContext"

import { cn } from "./utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { accentColor } = useAppContext();

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-sm border border-white/20 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-white",
        className
      )}
      style={{
        '--accent-color': accentColor,
      } as React.CSSProperties}
      {...props}
    >
      {/* We use a style tag to apply the background color when checked, similar to how we did for the switch, 
          or we can just apply it directly to the root when data-state is checked via inline styles if we want to be safe,
          but Radix data attributes are cleaner if we can use the variable. 
          Actually, let's use the style prop for the background color conditionally or use the variable in a style tag.
      */}
      <style dangerouslySetInnerHTML={{
        __html: `
        button[data-state=checked].peer {
          background-color: var(--accent-color);
          border-color: var(--accent-color);
        }
      `}} />
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

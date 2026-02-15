import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuContent = DropdownMenuPrimitive.Content
const DropdownMenuItem = DropdownMenuPrimitive.Item

const MenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        className={cn(
          "z-50 min-w-[12rem] rounded-md border border-border/60 bg-background/95 p-1 text-foreground shadow-xl backdrop-blur",
          className,
        )}
        ref={ref}
        sideOffset={sideOffset}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
})

MenuContent.displayName = "MenuContent"

const MenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})

MenuItem.displayName = "MenuItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  MenuContent,
  MenuItem,
}

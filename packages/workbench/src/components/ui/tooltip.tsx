import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export const Tooltip = ({
  children,
  content,
  disabled,
}: {
  children: React.ReactNode
  content: string | React.ReactNode
  disabled?: boolean
}) => (
  <TooltipPrimitive.Provider disableHoverableContent={disabled}>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content className="TooltipContent" side="bottom">
          <div className="p-2 bg-background text-popover-foreground text-sm rounded-lg">{content}</div>
          <TooltipPrimitive.Arrow className="TooltipArrow" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
)

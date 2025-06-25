import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const Container = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'border border-border text-foreground rounded-lg overflow-hidden flex flex-col h-full',
      className,
    )}
    {...props}
  />
))
Container.displayName = 'Container'

const containerHeaderVariants = cva(
  'w-full bg-card flex items-center min-h-10 border-b border-border',
  {
    variants: {
      variant: {
        default: 'px-5 py-2',
        tabs: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export const ContainerHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & VariantProps<typeof containerHeaderVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(containerHeaderVariants({ variant, className }))} {...props} />
))
ContainerHeader.displayName = 'ContainerHeader'

export const ContainerContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-auto p-5', className)} {...props} />
  ),
)
ContainerContent.displayName = 'ContainerContent'
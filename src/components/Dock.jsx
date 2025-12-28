import React from 'react'
import { cn } from '@/lib/utils'

export const Dock = React.forwardRef(({
  className,
  children,
  direction = 'horizontal',
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex gap-3 rounded-2xl bg-background/95 backdrop-blur-md border border-border px-5 py-3 shadow-lg',
      direction === 'vertical' ? 'flex-col' : 'flex-row',
      className
    )}
    {...props}
  >
    {children}
  </div>
))

Dock.displayName = 'Dock'

export const DockIcon = React.forwardRef(({
  className,
  children,
  tooltip,
  active = false,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-muted hover:bg-secondary hover:scale-110 transition-all cursor-pointer group',
      className
    )}
    {...props}
  >
    {children}
    {tooltip && (
      <span className="absolute bottom-full mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground border border-border rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {tooltip}
      </span>
    )}
  </div>
))

DockIcon.displayName = 'DockIcon'

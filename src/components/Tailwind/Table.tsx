'use client'

import clsx from 'clsx'
import type React from 'react'
import { createContext, useContext, useState } from 'react'

const TableContext = createContext<{ bleed: boolean; dense: boolean; grid: boolean; striped: boolean }>({
  bleed: false,
  dense: false,
  grid: false,
  striped: false,
})

export function Table({
  bleed = false,
  dense = false,
  grid = false,
  striped = false,
  className,
  children,
  ...props
}: { bleed?: boolean; dense?: boolean; grid?: boolean; striped?: boolean } & React.ComponentPropsWithoutRef<'div'>) {
  return (
    <TableContext.Provider value={{ bleed, dense, grid, striped } as React.ContextType<typeof TableContext>}>
      <div className="flow-root">
        <div {...props} className={clsx(className, '-mx-[--gutter] overflow-x-auto whitespace-nowrap')}>
          <div className={clsx('inline-block min-w-full align-middle rounded-lg overflow-hidden', !bleed && 'sm:px-[--gutter]')}>
            <table className="min-w-full divide-y divide-gray-300 dark:divide-white/15 text-left text-sm text-zinc-950 dark:text-white font-figtree">{children}</table>
          </div>
        </div>
      </div>
    </TableContext.Provider>
  )
}

export function TableHead({ className, ...props }: React.ComponentPropsWithoutRef<'thead'>) {
  return <thead {...props} className={clsx(className, 'border-b border-zinc-800 [&_tr>*:not(:first-child)]:!border-l-zinc-950 [&_tr>*:not(:first-child)]:!border-l')} />
}

export function TableBody({ className, ...props }: React.ComponentPropsWithoutRef<'tbody'>) {
  return <tbody {...props} className={clsx(className, 'divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-900')} />
}

const TableRowContext = createContext<{ href?: string; target?: string; title?: string }>({
  href: undefined,
  target: undefined,
  title: undefined,
})

export function TableRow({
  href,
  target,
  title,
  className,
  ...props
}: { href?: string; target?: string; title?: string } & React.ComponentPropsWithoutRef<'tr'>) {
  const { striped } = useContext(TableContext)

  return (
    <TableRowContext.Provider value={{ href, target, title } as React.ContextType<typeof TableRowContext>}>
      <tr
        {...props}
        className={clsx(
          className,
          'divide-x divide-gray-200 dark:divide-white/10',
          href &&
            'has-[[data-row-link][data-focus]]:outline has-[[data-row-link][data-focus]]:outline-2 has-[[data-row-link][data-focus]]:-outline-offset-2 has-[[data-row-link][data-focus]]:outline-blue-500 dark:focus-within:bg-white/[2.5%]',
          striped && 'even:bg-zinc-950/[2.5%] dark:even:bg-white/[2.5%]',
          href && striped && 'hover:bg-zinc-950/5 dark:hover:bg-white/5',
          href && !striped && 'hover:bg-zinc-950/[2.5%] dark:hover:bg-white/[2.5%]'
        )}
      />
    </TableRowContext.Provider>
  )
}

export function TableHeader({ className, stickyLeft, stickyRight, autoWidth, ...props }: React.ComponentPropsWithoutRef<'th'> & { stickyLeft?: boolean; stickyRight?: boolean; autoWidth?: boolean }) {
  return (
    <th
      {...props}
      className={clsx(
        className,
        'bg-stone-900 px-4 py-3 text-left text-sm font-semibold text-neutral-50 dark:text-white font-figtree',
        '!border-r-0 min-h-[2.5rem] h-[2.5rem] max-h-[2.5rem]',
        !autoWidth && 'min-w-[200px] max-w-[calc(100vw/4)]',
        stickyLeft && 'sticky left-0 z-10',
        stickyRight && 'sticky right-0 z-10'
      )}
      style={{
        ...(stickyLeft && { backgroundColor: 'rgb(28 25 23)' }),
        ...(stickyRight && { backgroundColor: 'rgb(28 25 23)' }),
        width: props.style?.width || 'auto',
      } as React.CSSProperties}
    />
  )
}

export function TableCell({ className, children, stickyLeft, stickyRight, autoWidth, ...props }: React.ComponentPropsWithoutRef<'td'> & { stickyLeft?: boolean; stickyRight?: boolean; autoWidth?: boolean }) {
  const { href, target, title } = useContext(TableRowContext)
  const [cellRef, setCellRef] = useState<HTMLElement | null>(null)

  return (
    <td
      ref={href ? setCellRef : undefined}
      {...props}
      className={clsx(
        className,
        'py-2 text-sm text-zinc-700 dark:text-gray-300 font-figtree',
        'first:font-medium first:text-gray-900 first:dark:text-white',
        'min-h-[2.5rem] h-[2.5rem] max-h-[2.5rem]',
        autoWidth ? 'pl-4 pr-4' : 'pl-4',
        !autoWidth && 'min-w-[200px] max-w-[calc(100vw/4)]',
        stickyLeft && 'sticky left-0 z-10 bg-white dark:bg-gray-900',
        stickyRight && 'sticky right-0 z-10 bg-white dark:bg-gray-900'
      )}
      style={{
        ...(props.style || {}),
        width: props.style?.width || 'auto',
      } as React.CSSProperties}
    >
      {href && (
        <a
          data-row-link
          href={href}
          target={target}
          aria-label={title}
          tabIndex={cellRef?.previousElementSibling === null ? 0 : -1}
          className="absolute inset-0 focus:outline-none"
        />
      )}
      <div className={clsx('overflow-y-hidden h-full flex items-center', autoWidth ? 'w-auto' : 'whitespace-nowrap overflow-x-auto w-full')}>
        {children}
      </div>
    </td>
  )
}

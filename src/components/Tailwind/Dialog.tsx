import React from 'react'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { Text } from './Text'

export const sizes = {
  xs: 'sm:max-w-xs',
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
}

export function Dialog({
  size = 'lg',
  className,
  children,
  ...props
}: { size?: keyof typeof sizes; className?: string; children: React.ReactNode } & Omit<
  Headless.DialogProps,
  'as' | 'className'
>) {
  return (
    <Headless.Dialog {...props}>
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 flex w-screen justify-center overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm px-2 py-2 transition-opacity duration-300 focus:outline-0 data-[closed]:opacity-0 data-[closed]:duration-300 data-[enter]:ease-out data-[leave]:ease-in sm:px-6 sm:py-8 lg:px-8 lg:py-16"
      />

      <div className="fixed inset-0 w-screen overflow-x-hidden overflow-y-auto flex items-end justify-center sm:items-center pt-6 sm:pt-0 sm:p-4">
        <Headless.DialogPanel
          transition
          className={clsx(
            className,
            sizes[size],
            'w-full min-w-0 h-[calc(100%-56px)] min-h-[calc(100%-56px)] sm:h-auto sm:min-h-0 max-h-[calc(100%-56px)] sm:max-h-[90vh] rounded-t-3xl bg-white shadow-lg ring-1 ring-zinc-950/10 sm:rounded-2xl dark:bg-zinc-900 dark:ring-white/10 forced-colors:outline',
            'transform translate-y-0 opacity-100 scale-100 transition-all ease-out',
            'duration-300',
            'data-[closed]:translate-y-28 data-[closed]:opacity-0 data-[closed]:scale-90',
            'data-[closed]:duration-300',
            'overflow-hidden flex flex-col'
          )}
        >
          {children}
        </Headless.DialogPanel>
      </div>
    </Headless.Dialog>
  )
}

export function DialogTitle({
  className,
  ...props
}: { className?: string } & Omit<Headless.DialogTitleProps, 'as' | 'className'>) {
  return (
    <Headless.DialogTitle
      {...props}
      className={clsx(className, 'flex-shrink-0 text-balance text-lg/6 font-semibold text-zinc-950 sm:text-base/6 dark:text-white py-3 px-4')}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: { className?: string } & Omit<Headless.DescriptionProps<typeof Text>, 'as' | 'className'>) {
  return <Headless.Description as={Text} {...props} className={clsx(className, 'mt-2 text-pretty')} />
}

export function DialogBody({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={clsx(className, 'flex-1 overflow-y-auto p-4')} />
}

export function DialogActions({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex-shrink-0 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:flex-row sm:*:w-auto py-3 px-4'
      )}
    />
  )
}
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef, useState } from 'react'

export function InputGroup({ children }: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      data-slot="control"
      className={clsx(
        'relative isolate block',
        '[&_input]:has-[[data-slot=icon]:first-child]:pl-10 [&_input]:has-[[data-slot=icon]:last-child]:pr-10 sm:[&_input]:has-[[data-slot=icon]:first-child]:pl-8 sm:[&_input]:has-[[data-slot=icon]:last-child]:pr-8',
        '[&>[data-slot=icon]]:pointer-events-none [&>[data-slot=icon]]:absolute [&>[data-slot=icon]]:top-3 [&>[data-slot=icon]]:z-10 [&>[data-slot=icon]]:size-5 sm:[&>[data-slot=icon]]:top-2.5 sm:[&>[data-slot=icon]]:size-4',
        '[&>[data-slot=icon]:first-child]:left-3 sm:[&>[data-slot=icon]:first-child]:left-2.5 [&>[data-slot=icon]:last-child]:right-3 sm:[&>[data-slot=icon]:last-child]:right-2.5',
        '[&>[data-slot=icon]]:text-zinc-500 dark:[&>[data-slot=icon]]:text-zinc-400'
      )}
    >
      {children}
    </span>
  )
}

const dateTypes = ['date', 'datetime-local', 'month', 'time', 'week']
type DateType = (typeof dateTypes)[number];

export const Input = forwardRef(function Input(
  {
    label,
    labelPosition = 'floating',
    className,
    ...props
  }: {
    label?: string;
    labelPosition?: 'floating' | 'above';
    className?: string;
    type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url' | DateType;
  } & Omit<Headless.InputProps, 'as' | 'className'>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="relative">
      {label && labelPosition === 'above' && (
        <label
          htmlFor={props.id}
          className="block text-[13px] font-bold text-slate-800 dark:text-white mb-1.5"
        >
          {label}
        </label>
      )}
      {label && labelPosition === 'floating' && (
        <label
          htmlFor={props.id}
          className={clsx(
            'absolute left-3 transition-all bg-white px-1 z-10',
            isFocused || props.value
              ? '-top-2 text-xs font-medium text-gray-900 opacity-100'
              : 'top-3 text-gray-500 opacity-0 pointer-events-none'
          )}
        >
          {label}
        </label>
      )}
      <span
        data-slot="control"
        className={clsx([
          className,
          'relative block w-full',
          'before:absolute before:inset-0 before:rounded-lg before:bg-white before:shadow-[rgba(67,71,85,0.27)_0px_0px_0.2em,rgba(90,125,188,0.02)_0px_0.25em_0.5em]',
          'dark:before:hidden',
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2 sm:after:focus-within:ring-sky-400',
          'has-[[data-disabled]]:opacity-50 before:has-[[data-disabled]]:bg-zinc-950/5 before:has-[[data-disabled]]:shadow-none',
          'before:has-[[data-invalid]]:shadow-red-500/10',
        ])}
      >
        <Headless.Input
          ref={ref}
          {...props}
          placeholder={!isFocused ? props.placeholder : ''}
          className={clsx([
            //Date classes
            props.type &&
              dateTypes.includes(props.type) && [
              '[&::-webkit-datetime-edit-fields-wrapper]:p-0',
              '[&::-webkit-date-and-time-value]:min-h-[1.5em]',
              '[&::-webkit-datetime-edit]:inline-flex',
              '[&::-webkit-datetime-edit]:p-0',
              '[&::-webkit-datetime-edit-year-field]:p-0',
              '[&::-webkit-datetime-edit-month-field]:p-0',
              '[&::-webkit-datetime-edit-day-field]:p-0',
              '[&::-webkit-datetime-edit-hour-field]:p-0',
              '[&::-webkit-datetime-edit-minute-field]:p-0',
              '[&::-webkit-datetime-edit-second-field]:p-0',
              '[&::-webkit-datetime-edit-millisecond-field]:p-0',
              '[&::-webkit-datetime-edit-meridiem-field]:p-0',
            ],
            'relative block w-full appearance-none rounded-lg px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[3])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[2.5])-1px)]',
            'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white font-medium',
            'border border-zinc-600 border-solid',
            //Normalize password input styling to match text inputs
            '[&[type="password"]]:font-sans [&[type="password"]]:tracking-normal [&[type="password"]]:font-medium',
            'bg-transparent dark:bg-white/5',
            //Ensure consistent height and box model
            'min-h-[calc(theme(spacing[2.5])*2+theme(fontSize.base[1].lineHeight))] sm:min-h-[calc(theme(spacing[2])*2+theme(fontSize.sm[1].lineHeight))]',
            'focus:outline-none',
            'data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500 data-[invalid]:dark:border-red-500 data-[invalid]:data-[hover]:dark:border-red-500',
            'data-[disabled]:border-zinc-950/20 dark:data-[hover]:data-[disabled]:border-white/15 data-[disabled]:dark:border-white/15 data-[disabled]:dark:bg-white/[2.5%]',
            'dark:[color-scheme:dark]',
          ])}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </span>
    </div>
  )
})

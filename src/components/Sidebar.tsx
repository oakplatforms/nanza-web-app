// 'use client'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Select } from './Select'

export function Sidebar({ className, ...props }: React.ComponentPropsWithoutRef<'nav'>) {
  return <nav {...props} className={clsx(className, 'flex h-full min-h-0 flex-col')} />
}

export function SidebarHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-col border-b border-zinc-950/20 p-4 dark:border-white/5 [&>[data-slot=section]+[data-slot=section]]:mt-2.5'
      )}
    />
  )
}

export function SidebarBody({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-1 flex-col overflow-y-auto p-4 [&>[data-slot=section]+[data-slot=section]]:mt-8'
      )}
    />
  )
}

export const SidebarItem = forwardRef(function SidebarItem(
  {
    current,
    className,
    children,
    ...props
  }: { current?: boolean; className?: string; children: React.ReactNode } & (
    | Omit<Headless.ButtonProps, 'as' | 'className'>
    | Omit<Headless.ButtonProps, 'as' | 'className'>
  ),
  ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>
) {
  let classes = clsx(
    'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5',
  )

  return (
    <span className={clsx(className, 'relative')}>
      {'href' in props ? (
        <Headless.CloseButton
          {...props}
          className={classes}
          data-current={current ? 'true' : undefined}
          ref={ref}
        >
          <button>{children}</button>
        </Headless.CloseButton>
      ) : (
        <Headless.Button
          {...props}
          className={clsx('cursor-default', classes)}
          data-current={current ? 'true' : undefined}
          ref={ref}
        >
          <button>{children}</button>
        </Headless.Button>
      )}
    </span>
  )
})

export function SidebarDivider({ className, ...props }: React.ComponentPropsWithoutRef<'hr'>) {
  return <hr {...props} className={clsx(className, 'my-4 border-t border-zinc-950/20 lg:-mx-4 dark:border-white/5')} />
}

export function SidebarSpacer({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div aria-hidden="true" {...props} className={clsx(className, 'mt-8 flex-1')} />
}

export function SidebarHeading({ className, ...props }: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h1 {...props} className={clsx(className, 'mb-1 px-2 font-medium text-zinc-500 dark:text-zinc-400 text-sm')} />
  )
}

const classes = clsx(
  'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5',
)

export function SidebarNavigation() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menuName: string) => {
    setOpenMenu((prev) => (prev === menuName ? menuName : menuName));
  };

  const closeMenu = (menuName: string) => {
    if (openMenu === menuName) return; // Prevent closing the currently open menu when clicking its child links
    setOpenMenu(null);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarHeading>TCGX Marketplace</SidebarHeading>
      </SidebarHeader>
      <SidebarBody>
        {/* Dashboard */}
        <Link to="/" onClick={() => closeMenu('')}>
          <div className={clsx('cursor-default', classes)}>Dashboard</div>
        </Link>

        {/* Products */}
        <div>
          <div
            className={clsx('cursor-pointer', classes)}
            onClick={() => toggleMenu('products')}
          >
            <Link to="/products" className="flex-grow">
              Products
            </Link>
          </div>
          {openMenu === 'products' && (
            <div className="ml-4">
              <Link to="/tags">
                <div className={clsx('cursor-default', classes)}>Tags</div>
              </Link>
            </div>
          )}
        </div>

        {/* Settings */}
        <div>
          <div
            className={clsx('cursor-pointer', classes)}
            onClick={() => toggleMenu('settings')}
          >
            <Link to="/settings" className="flex-grow">
              Settings
            </Link>
          </div>
          {openMenu === 'settings' && (
            <div className="ml-4">
              <Link to="/language">
                <div className={clsx('cursor-default', classes)}>Language</div>
              </Link>
            </div>
          )}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

import React from 'react'
import { Navbar, NavbarSection, NavbarSpacer } from './Tailwind'
import { useSession } from '../context/SessionContext'
import { signOut } from 'aws-amplify/auth'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { NestedDropdown, NestedMenuItem } from './NestedDropdown'

const navigation = [
  //{ name: 'Dashboard', to: '/dashboard' },
  { name: 'Products', to: '/products' },
  { name: 'Tags', to: '/tags' },
  { name: 'Sets', to: '/sets' },
  { name: 'Brands', to: '/brands' },
  { name: 'Categories', to: '/categories' },
  { name: 'Conditions', to: '/conditions' },
  { name: 'Shipping Methods', to: '/shipping-methods' },
  { name: 'Shipping Options', to: '/shipping-options' },
]

const createMenuItems: NestedMenuItem[] = [
  { name: 'Product', to: '/products?create=true' },
  { name: 'Tag', to: '/tags?create=true' },
  { name: 'Brand', to: '/brands?create=true' },
  { name: 'Category', to: '/categories?create=true' },
  { name: 'Set', to: '/sets?create=true' },
]

export function TopNavbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const { setIsSignedIn, setCurrentUser } = useSession()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsSignedIn(false)
      setCurrentUser(undefined)
    } catch (error) {
      console.log(error)
    }
  }

  const navbarItemClasses = clsx(
    'h-10 relative flex min-w-0 items-center gap-3 px-4 py-2 text-left text-base/6 font-semibold text-zinc-950 sm:text-[13px]',
    'hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5'
  )

  const contentMenuItems: NestedMenuItem[] = [
    { name: 'Homepage', to: '/homepage' },
  ]

  return (
    <Navbar className="px-4 lg:px-8">
      <NavbarSection>
        {/*Mobile menu button*/}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon aria-hidden="true" className="size-6" />
        </button>
        {/*Logo*/}
        <Link to="/" className="-ml-4 p-1.5">
          <span className="sr-only">Oak Platforms</span>
          <img alt="Oak Platforms" src="/oak.svg" className="h-4 w-auto" />
        </Link>
      </NavbarSection>
      {/*Navigation items - hidden on mobile, shown on desktop*/}
      <NavbarSection className="hidden lg:flex">
        <NestedDropdown
          items={createMenuItems}
          trigger={
            <div className={clsx(navbarItemClasses, 'cursor-pointer')}>
              <svg width="10" height="10" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-950 dark:text-white">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 48.031H31.969V80H48.031V48.031H80V31.969H48.031V0H31.969V31.969H0V48.031Z" fill="currentColor" />
              </svg>
            </div>
          }
        />
        {navigation.map((item) => {
          const isCurrent = location.pathname === item.to
          return (
            <React.Fragment key={item.name}>
              <Link
                to={item.to}
                className={clsx(navbarItemClasses, isCurrent && 'bg-zinc-950/5 dark:bg-white/5')}
              >
                {item.name}
              </Link>
              {item.name === 'Brands' && (
                <NestedDropdown
                  items={contentMenuItems}
                  trigger={
                    <div className={clsx(navbarItemClasses, 'cursor-pointer')}>
                      Content
                    </div>
                  }
                />
              )}
            </React.Fragment>
          )
        })}
      </NavbarSection>
      <NavbarSpacer />
      <NavbarSection>
        <button
          onClick={handleSignOut}
          className="font-figtree font-semibold text-sm text-zinc-800 hover:text-sky-600 inline-flex items-center"
        >
          Sign out
          <svg className="ml-1.5" width="9.77" height="9" viewBox="0 0 38 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M37 14.99L25 0.990019C24.27 0.260019 23.52 -0.0199809 22.82 1.90935e-05C22.78 1.90935e-05 22.73 1.90935e-05 22.69 1.90935e-05C20.54 -0.0699809 18.06 2.84002 19.75 4.72002L20.28 5.31002L28.1 13.99H3C-1 13.99 -1 19.99 3 19.99H27.96L19.4 29.5L18.87 30.09C17.21 31.94 19.58 34.78 21.71 34.81C21.75 34.81 21.8 34.81 21.85 34.81C21.9 34.81 21.94 34.81 21.99 34.81C22.9 34.79 23.96 34.29 25.01 33L37.01 19C38.01 18 38.01 16 37.01 15L37 14.99Z" fill="currentColor"/>
          </svg>
        </button>
      </NavbarSection>
    </Navbar>
  )
}


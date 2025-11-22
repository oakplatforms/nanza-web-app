import * as Headless from '@headlessui/react'
import React, { useState } from 'react'

function CloseMenuIcon() {
  return (
    <svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  )
}

function MobileSidebar({ open, close, children }: React.PropsWithChildren<{ open: boolean; close: () => void }>) {
  return (
    <Headless.Dialog open={open} onClose={close} className="lg:hidden">
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 transition data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <Headless.DialogPanel
        transition
        className="fixed inset-y-0 w-full max-w-80 p-2 transition duration-300 ease-in-out data-[closed]:-translate-x-full"
      >
        <div className="flex h-full flex-col rounded-lg bg-white shadow-sm ring-1 dark:ring-white/10">
          <div className="-mb-3 px-4 pt-3">
            <Headless.CloseButton aria-label="Close navigation">
              <CloseMenuIcon />
            </Headless.CloseButton>
          </div>
          {children}
        </div>
      </Headless.DialogPanel>
    </Headless.Dialog>
  )
}

export function Layout({
  navbar,
  sidebar,
  children,
}: React.PropsWithChildren<{ navbar?: React.ReactNode; sidebar?: React.ReactNode }>) {
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <div className="relative isolate flex min-h-svh w-full bg-gradient-to-r from-gray-100 to-gray-300">
      {/*Navbar - fixed at the very top, spans full width*/}
      {navbar && (
        <div className="fixed top-0 left-0 right-0 z-50 h-auto bg-white dark:bg-gray-900 shadow-sm">
          <div className="h-full">
            {React.isValidElement(navbar)
              ? React.cloneElement(navbar as React.ReactElement, { onOpenSidebar: () => setShowSidebar(true) })
              : navbar}
          </div>
        </div>
      )}
      {/*Sidebar - positioned below navbar, adjusted for navbar height*/}
      {/* <div className={`fixed ${navbar ? 'top-[56px]' : 'top-0'} bottom-0 left-0 w-64 border-r border-zinc-950/20 bg-white dark:bg-gray-900`}>
        {sidebar}
      </div> */}
      {/*Mobile Sidebar*/}
      {sidebar && (
        <MobileSidebar open={showSidebar} close={() => setShowSidebar(false)}>
          {sidebar}
        </MobileSidebar>
      )}
      {/*Main content - positioned below navbar, accounts for sidebar width on desktop*/}
      <main className={`flex flex-1 flex-col pb-2 min-w-0 ${navbar ? 'pt-10' : 'pt-0'} lg:pl-0 lg:pr-0`}>
        <div className="grow pb-6 lg:pb-10">
          <div className="mx-auto">{children}</div>
        </div>
      </main>
    </div>
  )
}

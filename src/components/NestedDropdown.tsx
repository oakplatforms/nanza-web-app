import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

export type NestedMenuItem = {
  name: string
  to?: string
  children?: NestedMenuItem[]
}

type NestedDropdownProps = {
  items: NestedMenuItem[]
  trigger: React.ReactNode
  className?: string
}

type SubmenuProps = {
  items: NestedMenuItem[]
  parentRef: React.RefObject<HTMLElement>
  isOpen: boolean
  onClose: () => void
}

function Submenu({ items, parentRef, isOpen, onClose }: SubmenuProps) {
  const submenuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<'right' | 'left'>('right')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isOpen && parentRef.current && submenuRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect()
      const submenuWidth = 200 // Estimated submenu width
      const viewportWidth = window.innerWidth
      const spaceOnRight = viewportWidth - parentRect.right
      const spaceOnLeft = parentRect.left

      // Position to left if not enough space on right, but prefer right
      if (spaceOnRight < submenuWidth && spaceOnLeft > submenuWidth) {
        setPosition('left')
      } else {
        setPosition('right')
      }
    }
  }, [isOpen, parentRef])

  useEffect(() => {
    if (!isHovered && !isOpen) {
      onClose()
    }
  }, [isHovered, isOpen, onClose])

  if (!isOpen) return null

  const menuClasses = clsx(
    'absolute -top-1 z-50 min-w-[200px] bg-white shadow-lg py-1 dark:bg-zinc-900',
    position === 'right' ? 'left-full -ml-1' : 'right-full -mr-1'
  )

  return (
    <div
      ref={submenuRef}
      className={menuClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setHoveredIndex(null)
      }}
    >
      {items.map((item, index) => (
        <NestedMenuItemComponent
          key={item.name}
          item={item}
          isHovered={hoveredIndex === index}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          position={position}
        />
      ))}
    </div>
  )
}

function NestedMenuItemComponent({
  item,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  position,
}: {
  item: NestedMenuItem
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  position: 'right' | 'left'
}) {
  const itemRef = useRef<HTMLDivElement>(null)
  const [showSubmenu, setShowSubmenu] = useState(false)

  const hasChildren = item.children && item.children.length > 0

  const itemClasses = clsx(
    'relative flex items-center justify-between px-3 py-2 text-sm/6 font-medium text-zinc-950',
    'hover:bg-zinc-950/5 cursor-pointer',
    'dark:text-white dark:hover:bg-white/5'
  )

  useEffect(() => {
    if (hasChildren) {
      setShowSubmenu(isHovered)
    }
  }, [isHovered, hasChildren])

  return (
    <>
      <div
        ref={itemRef}
        className={itemClasses}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {item.to ? (
          <Link to={item.to} className="flex-1">
            {item.name}
          </Link>
        ) : (
          <span className="flex-1">{item.name}</span>
        )}
        {hasChildren && (
          <ChevronRightIcon
            className={clsx(
              'h-4 w-4 text-zinc-500',
              position === 'left' && 'rotate-180'
            )}
          />
        )}
      </div>
      {hasChildren && (
        <Submenu
          items={item.children!}
          parentRef={itemRef}
          isOpen={showSubmenu}
          onClose={() => setShowSubmenu(false)}
        />
      )}
    </>
  )
}

export function NestedDropdown({ items, trigger, className }: NestedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const menuClasses = clsx(
    'absolute top-full left-0 z-50 min-w-[200px] bg-white shadow-lg py-1 dark:bg-zinc-900',
    className
  )

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseLeave={() => {
        setIsOpen(false)
        setHoveredIndex(null)
      }}
    >
      <div onMouseEnter={() => setIsOpen(true)}>{trigger}</div>
      {isOpen && (
        <div className={menuClasses}>
          {items.map((item, index) => (
            <NestedMenuItemComponent
              key={item.name}
              item={item}
              isHovered={hoveredIndex === index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              position="right"
            />
          ))}
        </div>
      )}
    </div>
  )
}


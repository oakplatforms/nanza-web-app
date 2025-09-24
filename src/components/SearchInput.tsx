import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Input, InputGroup } from './Tailwind/Input'

interface SearchInputProps {
  value: string
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function SearchInput({
  value,
  onSearch,
  placeholder = 'Search products...',
  className = '',
  debounceMs = 350
}: SearchInputProps) {
  const [searchText, setSearchText] = useState(value)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setSearchText(value)
  }, [value])

  const handleSearchTextChange = useCallback((query: string) => {
    setSearchText(query)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      onSearch(query)
    }, debounceMs)
  }, [onSearch, debounceMs])

  const handleClearSearch = useCallback(() => {
    setSearchText('')
    onSearch('')

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
  }, [onSearch])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <InputGroup>
        <Input
          type="text"
          value={searchText}
          onChange={(e) => handleSearchTextChange(e.target.value)}
          placeholder={placeholder}
          className={searchText ? 'pr-8' : ''}
        />
        {searchText && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </InputGroup>
    </div>
  )
}

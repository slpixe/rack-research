'use client'

import { useState, useEffect, useRef } from 'react'
import { useProductFilters } from '@/lib/hooks/useProductFilters'
import { useDebounce } from '@/lib/hooks/useDebounce'
import styles from './SearchBar.module.css'

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { filters, updateFilters } = useProductFilters()
  const [query, setQuery] = useState(filters.q || '')
  const [isMac, setIsMac] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  // Sync URL to state when filters change externally
  useEffect(() => {
    setQuery(filters.q || '')
  }, [filters.q])

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== (filters.q || '')) {
      updateFilters({ q: debouncedQuery || null })
    }
  }, [debouncedQuery, filters.q, updateFilters])

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleClear = () => {
    setQuery('')
    updateFilters({ q: null })
    inputRef.current?.focus()
  }

  const shortcutHint = isMac ? '⌘K' : 'Ctrl+K'

  return (
    <div className={styles.searchBar}>
      <svg
        className={styles.searchIcon}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        placeholder={`Search products... (${shortcutHint})`}
        value={query}
        onChange={e => setQuery(e.target.value)}
        className={styles.input}
      />
      {query && (
        <button onClick={handleClear} className={styles.clear} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  )
}

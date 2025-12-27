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
  
  // Track if the last change was from typing (vs external URL change)
  const isTypingRef = useRef(false)
  // Track the last intentional query value to prevent stale debounced updates
  const lastIntentionalQueryRef = useRef(filters.q || '')

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    const isMacPlatform = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    setIsMac(isMacPlatform)
  }, [])

  // Sync URL to state when filters change externally
  // NOTE: exhaustive-deps is disabled intentionally. Including 'query' would cause:
  // 1. The effect to run on every keystroke (when query updates)
  // 2. Infinite loops as it tries to sync state that's already in sync
  // We only want this effect to run when filters.q (URL) changes, not when local query changes
  useEffect(() => {
    const urlQuery = filters.q || ''
    // If URL changed but not from our typing, update immediately
    if (urlQuery !== query) {
      if (!isTypingRef.current) {
        setQuery(urlQuery)
        lastIntentionalQueryRef.current = urlQuery
      }
      // If we are typing, we ignore the URL update and keep isTypingRef true
      // to protect against lagging URL updates overwriting our state
    } else {
      // Only reset typing flag when we are fully in sync
      isTypingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q])

  // Update URL when debounced query changes
  useEffect(() => {
    // Only update if:
    // 1. The debounced query is different from the URL query, AND
    // 2. The debounced query matches the last intentional query value
    // This prevents stale debounced values from being applied after external clears
    if (debouncedQuery !== (filters.q || '') && debouncedQuery === lastIntentionalQueryRef.current) {
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
    isTypingRef.current = false
    updateFilters({ q: null })
    inputRef.current?.focus()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true
    const newValue = e.target.value
    setQuery(newValue)
    lastIntentionalQueryRef.current = newValue
  }

  const handleBlur = () => {
    isTypingRef.current = false
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
        onChange={handleChange}
        onBlur={handleBlur}
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

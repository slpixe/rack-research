'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import styles from './SearchBar.module.css';

interface SearchBarV2Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBarV2({ value, onChange }: SearchBarV2Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const [isMac, setIsMac] = useState(false);
  const debouncedValue = useDebounce(localValue, 300);

  // Track if the last change was from typing
  const isTypingRef = useRef(false);

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    const isMacPlatform = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    setIsMac(isMacPlatform);
  }, []);

  // Sync external value to local state
  // NOTE: exhaustive-deps is disabled intentionally. Including 'localValue' would cause:
  // 1. The effect to run every time we update localValue internally
  // 2. Unnecessary re-synchronization when localValue is already correct
  // We only want this effect to run when the external 'value' prop changes
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
      // When value comes from outside, we're not typing
      isTypingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Propagate debounced value
  useEffect(() => {
    if (isTypingRef.current && debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    setLocalValue('');
    isTypingRef.current = false;
    onChange('');
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isTypingRef.current = true;
    setLocalValue(e.target.value);
  };

  const shortcutHint = isMac ? '⌘K' : 'Ctrl+K';

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
        value={localValue}
        onChange={handleChange}
        className={styles.input}
      />
      {localValue && (
        <button onClick={handleClear} className={styles.clear} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}

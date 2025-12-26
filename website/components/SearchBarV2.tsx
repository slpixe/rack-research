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
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Sync external value to local state
  useEffect(() => {
    if (value !== localValue && !isTypingRef.current) {
      setLocalValue(value);
    }
    isTypingRef.current = false;
  }, [value, localValue]);

  // Propagate debounced value
  useEffect(() => {
    if (debouncedValue !== value) {
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

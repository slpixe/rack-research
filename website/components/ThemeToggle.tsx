"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import styles from "./ThemeToggle.module.css"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={styles.placeholder} />
  }

  return (
    <button
      className={styles.toggle}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  )
}

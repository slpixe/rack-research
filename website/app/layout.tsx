import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import styles from './layout.module.css'
import { ThemeProvider } from '../components/theme-provider'
import { ThemeToggle } from '../components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Rack Research - Server Chassis Database',
  description: 'Compare and research rack mount server cases across multiple vendors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <Link href="/" className={styles.logo}>
                📦 Rack Research
              </Link>
              <nav className={styles.nav}>
                <Link href="/" className={styles.navLink}>
                  Products
                </Link>
                <Link href="/compare" className={styles.navLink}>
                  Compare
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className={styles.main}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}

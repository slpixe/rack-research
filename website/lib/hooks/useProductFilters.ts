'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export interface ProductFilters {
  rack_units?: string
  source?: string
  brand?: string
  q?: string
}

export function useProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateFilters = useCallback(
    (filters: Record<string, string | string[] | null | undefined>) => {
      const params = new URLSearchParams(searchParams)

      Object.entries(filters).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key)
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','))
          } else {
            params.delete(key)
          }
        } else {
          params.set(key, value)
        }
      })

      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    },
    [searchParams, router, pathname]
  )

  const clearAllFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const filters: ProductFilters = Object.fromEntries(searchParams.entries())

  return {
    filters,
    updateFilters,
    clearAllFilters,
  }
}

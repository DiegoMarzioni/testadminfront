'use client'

import { useState, useCallback } from 'react'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(url: string) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }

      let apiUrl = url
      if (url.startsWith('http://localhost:3001/api')) {
        apiUrl = url.replace('http://localhost:3001/api', '/api')
      } else if (url.startsWith('http://localhost:3001')) {
        apiUrl = url.replace('http://localhost:3001', '/api')
      }

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setState({ data, loading: false, error: null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setState({ data: null, loading: false, error: errorMessage })
    }
  }, [url])

  return { ...state, refetch: fetchData }
}
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { Product, Category, DashboardStats } from '@/types'
import { ProductsService, CategoriesService, DashboardService } from '@/services/api'
import { Logger } from '@/lib/logger'

interface AdminContextType {
  
  products: Product[]
  categories: Category[]
  stats: DashboardStats | null

  isLoadingProducts: boolean
  isLoadingCategories: boolean
  isLoadingStats: boolean

  fetchProducts: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchStats: () => Promise<void>
  deleteProduct: (id: number) => Promise<boolean>
  deleteCategory: (id: number) => Promise<boolean>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

interface AdminProviderProps {
  children: ReactNode
}

export function AdminProvider({ children }: AdminProviderProps) {
  const { isAuthenticated } = useAuth()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)

  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const fetchProducts = async () => {
    const token = localStorage.getItem('token')
    if (!isAuthenticated || !token) {
      setProducts([])
      return
    }
    
    setIsLoadingProducts(true)
    try {
      const data = await ProductsService.getProducts()
      setProducts(data.data || [])
    } catch (error) {
      Logger.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const fetchCategories = async () => {
    const token = localStorage.getItem('token')
    if (!isAuthenticated || !token) {
      setCategories([])
      return
    }
    
    setIsLoadingCategories(true)
    try {
      const data = await CategoriesService.getCategories()
      setCategories(data)
    } catch (error) {
      Logger.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const fetchStats = async () => {
    const token = localStorage.getItem('token')
    if (!isAuthenticated || !token) {
      setStats(null)
      return
    }
    
    setIsLoadingStats(true)
    try {
      const data = await DashboardService.getStats()
      setStats(data)
    } catch (error) {
      Logger.error('Error fetching stats:', error)
      setStats(null)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      await ProductsService.deleteProduct(String(id))
      setProducts(prev => prev.filter(product => product.id !== id))
      return true
    } catch (error) {
      Logger.error('Error deleting product:', error)
      return false
    }
  }

  const deleteCategory = async (id: number): Promise<boolean> => {
    try {
      await CategoriesService.deleteCategory(String(id))
      setCategories(prev => prev.filter(category => category.id !== id))
      return true
    } catch (error) {
      Logger.error('Error deleting category:', error)
      return false
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts()
      fetchCategories()
      fetchStats()
    }
  }, [isAuthenticated])

  const value = {
    
    products,
    categories,
    stats,

    isLoadingProducts,
    isLoadingCategories,
    isLoadingStats,

    fetchProducts,
    fetchCategories,
    fetchStats,
    deleteProduct,
    deleteCategory,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
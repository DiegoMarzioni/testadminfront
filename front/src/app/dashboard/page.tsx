'use client'

import { useEffect, useState } from 'react'
import ErrorDisplay from '@/components/ErrorDisplay'
import SmartLowStock from '@/components/SmartLowStock'
import { DashboardLoading } from '@/components/ui/Spinner'
import { Package, FolderOpen, Tag, AlertTriangle, DollarSign, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { DashboardData, InventoryData, TopProduct } from '@/types'
import { DashboardService } from '@/services/api'
import { Logger } from '@/lib/logger'

const safeMoney = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '0.00'
  if (typeof value === 'number' && !isNaN(value)) return value.toFixed(2)
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? '0.00' : parsed.toFixed(2)
  }
  return '0.00'
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [statsData, invData, topProductsData] = await Promise.all([
        DashboardService.getStats(),
        DashboardService.getInventorySummary(),
        DashboardService.getTopProducts()
      ])

      setDashboardData(statsData)
      setInventoryData(invData)
      setTopProducts(topProductsData)
    } catch (error) {
      Logger.error('Error fetching dashboard data:', error)
      setError('Error al cargar las estadísticas del dashboard')
      toast.error('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [router])

  if (loading) {
    return <DashboardLoading />
  }

  if (error || !dashboardData || !inventoryData) {
    return (
      <div className="p-6">
        <ErrorDisplay 
          message={error || "Error al cargar las estadísticas"} 
          onRetry={fetchDashboardData}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="space-y-6 animate-fade-in">
        {}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">Resumen general del sistema</p>
        </div>

        {}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
              <p className="text-blue-100">
                Aquí tienes un resumen rápido de tu tienda
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-blue-100 text-sm">Fecha de hoy</p>
                <p className="font-semibold">{new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Inventario de Productos</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">{inventoryData.totalProducts}</p>
                <p className="text-sm text-blue-600 mt-1">
                  Productos en inventario
                </p>
              </div>
              <div className="p-3 bg-blue-100/30 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Valor</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">${safeMoney(inventoryData.totalValue)}</p>
                <p className="text-sm text-green-600 mt-1">
                  Valor total inventario
                </p>
              </div>
              <div className="p-3 bg-green-100/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Categorías</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">{dashboardData.totalCategories}</p>
                <p className="text-sm text-purple-600 mt-1">
                  {inventoryData.categoryStats.length} con productos
                </p>
              </div>
              <div className="p-3 bg-purple-100/30 rounded-lg">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Stock Bajo</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2">{inventoryData.lowStockProducts.length}</p>
                <p className="text-sm text-orange-600 mt-1">
                  {inventoryData.outOfStockCount} sin stock
                </p>
              </div>
              <div className="p-3 bg-orange-100/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2">
            <SmartLowStock />
          </div>

          {}
          <div className="space-y-6">
            {}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Ventas Recientes
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.recentOrders.length > 0 ? dashboardData.recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100/30 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {order.customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {order.customer.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Orden #{order.orderNumber}
                          </p>
                          <p className="text-xs text-slate-500">
                            Status: {order.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${safeMoney(order.total)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-slate-500">
                      No hay ventas recientes
                    </p>
                  )}
                </div>
              </div>
            </div>

            {}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Productos Más Vendidos
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topProducts.length > 0 ? topProducts.slice(0, 3).map((item, index) => (
                    <div key={item.product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100/30 text-blue-600 rounded-full text-sm font-medium">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.product.category.name} - {item.product.brand.name}
                          </p>
                          <p className="text-xs text-green-600">
                            ${safeMoney(item.product.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          {item.totalSold} vendidos
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.ordersCount} órdenes
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-slate-500">
                      No hay productos vendidos aún.
                    </p>
                  )}
                </div>
                {topProducts.length > 3 && (
                  <div className="text-center pt-4 border-t border-slate-200 mt-4">
                    <button 
                      onClick={() => router.push('/dashboard/products')}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Ver todos los productos
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
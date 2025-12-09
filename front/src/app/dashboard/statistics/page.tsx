'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardCharts from '@/components/DashboardCharts'
import DataExport from '@/components/DataExport'
import { DashboardService } from '@/services/api'
import { SalesData } from '@/types'
import { Logger } from '@/lib/logger'

export default function StatisticsPage() {
  const [salesData, setSalesData] = useState<Array<{ month: string; sales: number }>>([])
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([])
  const [revenueData, setRevenueData] = useState<Array<{ day: string; revenue: number }>>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') 
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchStatistics()
  }, [router, dateRange])

  const fetchStatistics = async () => {
    try {
      setLoading(true)

      const [salesResponse, inventoryData, dashboardStats] = await Promise.all([
        DashboardService.getSalesData({ days: parseInt(dateRange) }),
        DashboardService.getInventorySummary(),
        DashboardService.getStats()
      ])

      const transformedSalesData = transformSalesDataForChart(salesResponse)
      setSalesData(transformedSalesData)

      if (inventoryData?.categoryStats) {
        const categoryChartData = inventoryData.categoryStats.map((cat: any) => ({
          name: cat.category || cat.name,
          value: cat.totalProducts || cat.productCount || cat.count || 0
        }))
        setCategoryData(categoryChartData)
      }

      const revenueChartData = generateRevenueData(salesResponse)
      setRevenueData(revenueChartData)

    } catch (error: any) {
      Logger.error('Error fetching statistics:', error)
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        localStorage.removeItem('token')
        router.push('/login')
      } else {
        toast.error('Error al cargar estadísticas')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStatistics()
    setRefreshing(false)
    toast.success('Estadísticas actualizadas')
  }

  const transformSalesDataForChart = (salesResponse: any): Array<{ month: string; sales: number }> => {
    
    const dailySales = salesResponse?.dailySales || []
    if (!Array.isArray(dailySales) || dailySales.length === 0) return []
    
    return dailySales.slice(-7).map((item: any, index: number) => {
      const date = new Date(item.date)
      
      return {
        month: date.toLocaleDateString('es-ES', { 
          weekday: 'short', 
          day: 'numeric' 
        }),
        sales: item.orders_count || 0
      }
    })
  }

  const generateRevenueData = (salesResponse: any): Array<{ day: string; revenue: number }> => {
    const dailySales = salesResponse?.dailySales || []
    if (!Array.isArray(dailySales)) {
      
      const weeks = []
      const today = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const weekStart = new Date(today)
        weekStart.setDate(weekStart.getDate() - (i * 7))
        
        weeks.push({
          day: `Sem ${weekStart.getDate()} ${weekStart.toLocaleDateString('es-ES', { month: 'short' })}`,
          revenue: 0
        })
      }
      
      return weeks
    }

    const weeks = []
    const today = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - (i * 7))
      
      const weekData = dailySales.filter((item: any) => {
        const itemDate = new Date(item.date)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        return itemDate >= weekStart && itemDate <= weekEnd
      })

      const totalRevenue = weekData.reduce((sum: number, item: any) => sum + (item.total_revenue || 0), 0)
      
      weeks.push({
        day: `Sem ${weekStart.getDate()} ${weekStart.toLocaleDateString('es-ES', { month: 'short' })}`,
        revenue: totalRevenue
      })
    }
    
    return weeks
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando estadísticas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Estadísticas y Análisis</h1>
            <p className="text-slate-600">Métricas detalladas y tendencias de ventas</p>
          </div>
        </div>
        
        {}
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="365">Último año</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ventas (Período)</p>
              <p className="text-2xl font-bold text-slate-900">
                {Array.isArray(salesData) ? salesData.reduce((sum, item) => sum + (item.sales || 0), 0) : 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ingresos (Período)</p>
              <p className="text-2xl font-bold text-slate-900">
                ${Array.isArray(revenueData) ? revenueData.reduce((sum, item) => sum + item.revenue, 0).toFixed(2) : '0.00'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Categorías</p>
              <p className="text-2xl font-bold text-slate-900">
                {Array.isArray(categoryData) ? categoryData.length : 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Promedio Diario</p>
              <p className="text-2xl font-bold text-slate-900">
                {Array.isArray(salesData) && salesData.length > 0 ? 
                  (salesData.reduce((sum, item) => sum + (item.sales || 0), 0) / salesData.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {}
      <DashboardCharts 
        salesData={salesData}
        categoryData={categoryData}
        revenueData={revenueData}
      />

      {}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Exportar Datos
          </h3>
          <Download className="w-5 h-5 text-slate-500" />
        </div>
        <DataExport 
          data={salesData} 
          filename="estadisticas-ventas"
          title="Estadísticas de Ventas"
        />
      </div>
    </div>
  )
}
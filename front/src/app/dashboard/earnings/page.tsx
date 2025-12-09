'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Eye,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Percent
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Order } from '@/types'
import { OrdersService } from '@/services/api'
import { Logger } from '@/lib/logger'

interface EarningsData {
  totalCommissions: number
  monthlyCommissions: number
  weeklyCommissions: number
  totalProcessedOrders: number
  topSellingAdmins: Array<{
    admin: {
      id: number
      name: string
      email: string
    }
    totalSales: number
    commission: number
    ordersCount: number
  }>
  recentCommissions: Array<{
    orderId: number
    orderNumber: string
    sellerName: string
    orderTotal: number
    commission: number
    processedAt: string
  }>
  monthlyTrend: Array<{
    month: string
    commissions: number
    orders: number
  }>
}

export default function EarningsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') 
  const [statusFilter, setStatusFilter] = useState('PAGADO') 
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchEarnings()
  }, [router, dateRange, statusFilter])

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      
      const response = await OrdersService.getOrders()
      let allOrders = response.data || response || []

      const processedOrders = allOrders.filter(order => {
        console.log('Earnings order:', order.id, 'Seller:', order.seller, 'Payment Status:', order.paymentStatus)
        return order.seller && 
               order.seller.role === 'admin' &&
               order.paymentStatus === statusFilter &&
               order.paymentMethod === 'TRANSFERENCIA_INTERNA'
      })
      
      setOrders(processedOrders)

      const earningsData = calculateEarnings(processedOrders)
      setEarnings(earningsData)
      
    } catch (error: any) {
      Logger.error('Error fetching earnings:', error)
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        localStorage.removeItem('token')
        router.push('/login')
      } else {
        toast.error('Error al cargar ganancias')
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateEarnings = (processedOrders: Order[]): EarningsData => {
    const now = new Date()
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const totalCommissions = processedOrders.reduce((sum, order) => sum + (order.total * 0.1), 0)

    const monthlyOrders = processedOrders.filter(order => new Date(order.createdAt) >= oneMonthAgo)
    const monthlyCommissions = monthlyOrders.reduce((sum, order) => sum + (order.total * 0.1), 0)

    const weeklyOrders = processedOrders.filter(order => new Date(order.createdAt) >= oneWeekAgo)
    const weeklyCommissions = weeklyOrders.reduce((sum, order) => sum + (order.total * 0.1), 0)

    const sellerMap = new Map()
    processedOrders.forEach(order => {
      if (order.seller) {
        const sellerId = order.seller.id
        if (sellerMap.has(sellerId)) {
          const existing = sellerMap.get(sellerId)
          sellerMap.set(sellerId, {
            ...existing,
            totalSales: existing.totalSales + order.total,
            commission: existing.commission + (order.total * 0.1),
            ordersCount: existing.ordersCount + 1
          })
        } else {
          sellerMap.set(sellerId, {
            admin: order.seller,
            totalSales: order.total,
            commission: order.total * 0.1,
            ordersCount: 1
          })
        }
      }
    })

    const topSellingAdmins = Array.from(sellerMap.values())
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 5)

    const recentCommissions = processedOrders
      .slice(-10)
      .map(order => ({
        orderId: order.id,
        orderNumber: order.orderNumber || `#${order.id}`,
        sellerName: order.seller?.name || 'N/A',
        orderTotal: order.total,
        commission: order.total * 0.1,
        processedAt: order.updatedAt || order.createdAt
      }))
      .reverse()

    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthOrders = processedOrders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= monthStart && orderDate <= monthEnd
      })
      
      monthlyTrend.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        commissions: monthOrders.reduce((sum, order) => sum + (order.total * 0.1), 0),
        orders: monthOrders.length
      })
    }

    return {
      totalCommissions,
      monthlyCommissions,
      weeklyCommissions,
      totalProcessedOrders: processedOrders.length,
      topSellingAdmins,
      recentCommissions,
      monthlyTrend
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Calculando ganancias...</span>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className="text-center p-8">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No se pudieron cargar los datos de ganancias</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mis Ganancias</h1>
            <p className="text-slate-600">Comisiones del 10% por ventas procesadas</p>
          </div>
        </div>
        
        {}
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="365">Último año</option>
          </select>
          
          <button
            onClick={fetchEarnings}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Comisiones Totales</p>
              <p className="text-2xl font-bold text-green-600">${earnings.totalCommissions.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-slate-600">De {earnings.totalProcessedOrders} órdenes</span>
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Este Mes</p>
              <p className="text-2xl font-bold text-blue-600">${earnings.monthlyCommissions.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-100/30 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-500">+12.5%</span>
            <span className="text-slate-600 ml-1">vs mes anterior</span>
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Esta Semana</p>
              <p className="text-2xl font-bold text-purple-600">${earnings.weeklyCommissions.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-slate-600">Promedio semanal</span>
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tasa de Comisión</p>
              <p className="text-2xl font-bold text-orange-600">10%</p>
            </div>
            <div className="p-3 bg-orange-100/30 rounded-lg">
              <Percent className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-slate-600">Por cada venta procesada</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900">Top Administradores</h3>
          </div>
          <div className="space-y-3">
            {earnings.topSellingAdmins.map((seller, index) => (
              <div key={seller.admin.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100/30 rounded-full flex items-center justify-center text-green-600 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{seller.admin.name}</p>
                    <p className="text-xs text-slate-600">{seller.ordersCount} ventas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${seller.commission.toFixed(2)}</p>
                  <p className="text-xs text-slate-600">comisión</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Comisiones Recientes</h3>
          </div>
          <div className="space-y-3">
            {earnings.recentCommissions.map((commission, index) => (
              <div key={commission.orderId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{commission.orderNumber}</p>
                  <p className="text-xs text-slate-600">
                    {commission.sellerName} • ${commission.orderTotal.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+${commission.commission.toFixed(2)}</p>
                  <p className="text-xs text-slate-600">
                    {new Date(commission.processedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
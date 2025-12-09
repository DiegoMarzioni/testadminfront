'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  Search, 
  Filter, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign,
  TrendingUp,
  Users,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Order, OrderStatus, PaymentStatus } from '@/types'
import { OrdersService } from '@/services/api'
import { Logger } from '@/lib/logger'

interface OrderStats {
  total: number
  pending: number
  completed: number
  canceled: number
  totalValue: number
  avgOrderValue: number
  todayOrders: number
  weekGrowth: number
}

interface TopCustomer {
  name: string
  email: string
  orderCount: number
  totalSpent: number
}

interface TopSeller {
  name: string
  email: string
  salesCount: number
  totalEarnings: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [topSellers, setTopSellers] = useState<TopSeller[]>([])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchOrdersAndStats()
  }, [router])

  const fetchOrdersAndStats = async () => {
    try {
      setLoading(true)
      const response = await OrdersService.getOrders()
      const ordersData = response.data || []
      setOrders(ordersData)

      calculateStats(ordersData)
      calculateTopCustomers(ordersData)
      calculateTopSellers(ordersData)
    } catch (error: any) {
      Logger.error('Error fetching orders:', error)
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        localStorage.removeItem('token')
        router.push('/login')
      } else {
        toast.error('Error al cargar órdenes')
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ordersData: Order[]) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const todayOrders = ordersData.filter(order => 
      new Date(order.createdAt).toDateString() === today.toDateString()
    ).length

    const thisWeekOrders = ordersData.filter(order => 
      new Date(order.createdAt) >= weekAgo
    ).length

    const lastWeekStart = new Date(weekAgo)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const lastWeekOrders = ordersData.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= lastWeekStart && orderDate < weekAgo
    }).length

    const weekGrowth = lastWeekOrders === 0 ? 100 : 
      ((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100

    const totalValue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0)
    const avgOrderValue = ordersData.length > 0 ? totalValue / ordersData.length : 0

    setStats({
      total: ordersData.length,
      pending: ordersData.filter(o => o.paymentStatus === 'PENDING').length,
      completed: ordersData.filter(o => o.paymentStatus === 'PAGADO').length,
      canceled: ordersData.filter(o => o.status === 'CANCELADO').length,
      totalValue,
      avgOrderValue,
      todayOrders,
      weekGrowth
    })
  }

  const calculateTopCustomers = (ordersData: Order[]) => {
    const customerMap = new Map<string, TopCustomer>()
    
    ordersData.forEach(order => {
      const key = order.customer.email
      if (customerMap.has(key)) {
        const existing = customerMap.get(key)!
        customerMap.set(key, {
          ...existing,
          orderCount: existing.orderCount + 1,
          totalSpent: existing.totalSpent + (order.total || 0)
        })
      } else {
        customerMap.set(key, {
          name: order.customer.name,
          email: order.customer.email,
          orderCount: 1,
          totalSpent: order.total || 0
        })
      }
    })

    const topCustomersArray = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
    
    setTopCustomers(topCustomersArray)
  }

  const calculateTopSellers = (ordersData: Order[]) => {
    const sellerMap = new Map<string, TopSeller>()
    
    ordersData.forEach(order => {
      if (order.seller) {
        const key = order.seller.email
        const commission = (order.total || 0) * 0.9 
        
        if (sellerMap.has(key)) {
          const existing = sellerMap.get(key)!
          sellerMap.set(key, {
            ...existing,
            salesCount: existing.salesCount + 1,
            totalEarnings: existing.totalEarnings + commission
          })
        } else {
          sellerMap.set(key, {
            name: order.seller.name,
            email: order.seller.email,
            salesCount: 1,
            totalEarnings: commission
          })
        }
      }
    })

    const topSellersArray = Array.from(sellerMap.values())
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 5)
    
    setTopSellers(topSellersArray)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'EN_PREPARACION':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ENVIADO':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PAGADO':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'FALLIDO':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando órdenes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel de Órdenes</h1>
            <p className="text-slate-600">Análisis completo de órdenes y estadísticas</p>
          </div>
        </div>
      </div>

      {}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Órdenes</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100/30 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-slate-600">Hoy: {stats.todayOrders}</span>
            </div>
          </div>

          {}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Valor Total</p>
                <p className="text-2xl font-bold text-slate-900">${stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-slate-600">Promedio: ${stats.avgOrderValue.toFixed(2)}</span>
            </div>
          </div>

          {}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-slate-600">Completadas: {stats.completed}</span>
            </div>
          </div>

          {}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Crecimiento Semanal</p>
                <p className={`text-2xl font-bold ${stats.weekGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.weekGrowth >= 0 ? '+' : ''}{stats.weekGrowth.toFixed(1)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stats.weekGrowth >= 0 ? 'bg-green-100/30' : 'bg-red-100/30'}`}>
                {stats.weekGrowth >= 0 ? 
                  <ArrowUpRight className="w-6 h-6 text-green-600" /> :
                  <ArrowDownRight className="w-6 h-6 text-red-600" />
                }
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-slate-600">vs semana anterior</span>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Top Clientes</h3>
          </div>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={customer.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100/30 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    <p className="text-xs text-slate-600">{customer.orderCount} órdenes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${customer.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900">Top Vendedores</h3>
          </div>
          <div className="space-y-3">
            {topSellers.map((seller, index) => (
              <div key={seller.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100/30 rounded-full flex items-center justify-center text-green-600 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{seller.name}</p>
                    <p className="text-xs text-slate-600">{seller.salesCount} ventas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${seller.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por ID, cliente o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="EN_PREPARACION">En Preparación</option>
              <option value="ENVIADO">Enviado</option>
              <option value="COMPLETADO">Completado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          {}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los pagos</option>
              <option value="PENDING">Pago Pendiente</option>
              <option value="PAGADO">Pagado</option>
              <option value="FALLIDO">Pago Fallido</option>
            </select>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Órdenes Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.slice(0, 10).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.orderNumber || order.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer.name}</div>
                    <div className="text-sm text-gray-500">{order.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > 10 && (
          <div className="p-4 border-t border-slate-200 text-center">
            <button
              onClick={() => router.push('/dashboard/sales')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas las órdenes ({filteredOrders.length}) →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
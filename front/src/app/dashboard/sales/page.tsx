'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Order, OrderStatus, PaymentStatus, OrdersResponse } from '@/types'
import { OrdersService } from '@/services/api'
import { Logger } from '@/lib/logger'
import NewSaleModal from '@/components/NewSaleModal'
import PaymentManagementModal from '@/components/PaymentManagementModal'

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showNewSaleModal, setShowNewSaleModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await OrdersService.getOrders()
      Logger.debug('Orders response:', response)

      let allOrders: any[] = []
      if (response.data) {
        allOrders = response.data
      } else if (Array.isArray(response)) {
        allOrders = response
      }

      const commissionOrders = allOrders.filter(order => {
        console.log('Order:', order.id, 'Seller:', order.seller, 'Payment:', order.paymentMethod)
        return order.seller && 
               (order.seller.role === 'admin' || order.seller.role === 'seller') && 
               order.paymentMethod === 'TRANSFERENCIA_INTERNA' 
      })
      
      console.log('Filtered commission orders:', commissionOrders)
      setOrders(commissionOrders)
    } catch (error) {
      Logger.error('Error fetching orders:', error)
      console.error('Full error:', error) 
      setError('Error al cargar las órdenes')
      toast.error('Error al cargar las órdenes')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case OrderStatus.EN_PREPARACION:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case OrderStatus.ENVIADO:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case OrderStatus.COMPLETADO:
        return 'bg-green-100 text-green-800 border-green-200'
      case OrderStatus.CANCELADO:
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case PaymentStatus.PAGADO:
        return 'bg-green-100 text-green-800 border-green-200'
      case PaymentStatus.FALLIDO:
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="w-4 h-4" />
      case OrderStatus.EN_PREPARACION:
        return <Package className="w-4 h-4" />
      case OrderStatus.ENVIADO:
        return <Truck className="w-4 h-4" />
      case OrderStatus.COMPLETADO:
        return <CheckCircle className="w-4 h-4" />
      case OrderStatus.CANCELADO:
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
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

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await OrdersService.updateOrder(orderId, { status: newStatus })
      toast.success('Estado actualizado correctamente')
      fetchOrders() 
    } catch (error) {
      Logger.error('Error updating order status:', error)
      toast.error('Error al actualizar el estado')
    }
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const handleNewSale = () => {
    setShowNewSaleModal(true)
  }

  const handleSaleCreated = (orderId: number) => {
    
    fetchOrders()
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Pagos</h1>
          <p className="text-slate-600">Procesa pagos a administradores vendedores</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100/30 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

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
              <option value={OrderStatus.PENDING}>Pendiente</option>
              <option value={OrderStatus.EN_PREPARACION}>En Preparación</option>
              <option value={OrderStatus.ENVIADO}>Enviado</option>
              <option value={OrderStatus.COMPLETADO}>Completado</option>
              <option value={OrderStatus.CANCELADO}>Cancelado</option>
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
              <option value={PaymentStatus.PENDING}>Pago Pendiente</option>
              <option value={PaymentStatus.PAGADO}>Pagado</option>
              <option value={PaymentStatus.FALLIDO}>Pago Fallido</option>
            </select>
          </div>
        </div>
      </div>

      {}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor / Cliente
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gestionar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id}
                      </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <strong>Vendedor:</strong> {order.seller?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      <strong>Cliente:</strong> {order.customer.name}
                    </div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                        <DollarSign className="w-3 h-3 mr-1" />
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50/30 transition-colors"
                          title="Gestionar pago"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                    No se encontraron órdenes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      <div className="lg:hidden space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              {}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-bold text-slate-900">Orden #{order.id}</span>
                </div>
                <button
                  onClick={() => viewOrderDetails(order)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Gestionar pago"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              {}
              <div className="space-y-2">
                {}
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 font-medium">Vendedor:</span>
                  <span className="text-sm text-slate-900 font-medium text-right">
                    {order.seller?.name || 'N/A'}
                  </span>
                </div>

                {}
                <div className="flex justify-between items-start">
                  <span className="text-xs text-slate-500 font-medium">Cliente:</span>
                  <span className="text-sm text-slate-700 text-right">
                    {order.customer.name}
                  </span>
                </div>

                {}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}>
                    <DollarSign className="w-3 h-3 mr-1" />
                    {order.paymentStatus}
                  </span>
                </div>

                {}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500 block">Fecha</span>
                    <span className="text-sm text-slate-700 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'short',
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total</span>
                    <span className="text-lg font-bold text-slate-900">
                      ${order.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">No se encontraron órdenes</p>
          </div>
        )}
      </div>

      {}
      {showOrderModal && selectedOrder && (
        <PaymentManagementModal
          order={selectedOrder}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onPaymentProcessed={() => {
            fetchOrders() 
            setShowOrderModal(false)
          }}
        />
      )}

      {}
      <NewSaleModal
        isOpen={showNewSaleModal}
        onClose={() => setShowNewSaleModal(false)}
        onSaleCreated={handleSaleCreated}
      />
    </div>
  )
}
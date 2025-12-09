'use client'

import { useState } from 'react'
import { 
  X, 
  DollarSign, 
  User, 
  Store, 
  Package, 
  CreditCard,
  Check,
  AlertTriangle,
  Receipt,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Order, PaymentStatus } from '@/types'
import { OrdersService } from '@/services/api'
import { Logger } from '@/lib/logger'

interface PaymentManagementModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onPaymentProcessed: () => void
}

export default function PaymentManagementModal({ 
  order, 
  isOpen, 
  onClose, 
  onPaymentProcessed 
}: PaymentManagementModalProps) {
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('TRANSFERENCIA')
  const [paymentNotes, setPaymentNotes] = useState('')

  if (!isOpen) return null

  const commission = order.total * 0.10
  const adminPayment = order.total * 0.90 

  const processPayment = async (approved: boolean) => {
    setProcessing(true)
    
    try {
      const newStatus = approved ? PaymentStatus.PAGADO : PaymentStatus.FALLIDO
      const notes = approved 
        ? `Pago procesado por ${paymentMethod}. ${paymentNotes || 'Pago aprobado y transferido al administrador vendedor.'}`
        : `Pago rechazado. ${paymentNotes || 'Pago no autorizado.'}`

      await OrdersService.updateOrder(order.id, {
        paymentStatus: newStatus,
        notes: notes
      })

      toast.success(approved ? '¡Pago procesado exitosamente!' : 'Pago rechazado correctamente')
      onPaymentProcessed()
    } catch (error: any) {
      Logger.error('Error processing payment:', error)
      toast.error('Error al procesar el pago')
    } finally {
      setProcessing(false)
    }
  }

  const getSellerInfo = () => {
    
    const firstItem = order.items[0]
    return {
      name: order.seller?.name || order.customer.name, 
      email: order.seller?.email || order.customer.email
    }
  }

  const sellerInfo = getSellerInfo()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100/30 rounded-lg">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Gestión de Pago
                </h2>
                <p className="text-sm text-gray-600">
                  Orden #{order.orderNumber || order.id} • {new Date(order.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {}
            <div className="space-y-6">
              {}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Cliente</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-900">{order.customer.name}</p>
                  <p className="text-gray-600">{order.customer.email}</p>
                  {order.customer.phone && (
                    <p className="text-gray-600">{order.customer.phone}</p>
                  )}
                </div>
              </div>

              {}
              <div className="bg-green-50/20 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Store className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Administrador Vendedor</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-900 font-medium">{sellerInfo.name}</p>
                  <p className="text-gray-600">{sellerInfo.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100/30 text-green-800">
                      <DollarSign className="w-3 h-3 mr-1" />
                      A recibir: ${adminPayment.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Package className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Productos</h3>
                </div>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {}
            <div className="space-y-6">
              {}
              <div className="bg-blue-50/20 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Resumen de Pago</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de la orden:</span>
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Comisión plataforma (10%):</span>
                    <span className="font-medium text-blue-600">-${commission.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Pago al vendedor:</span>
                      <span className="font-bold text-green-600">${adminPayment.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Estado Actual</h3>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    order.paymentStatus === 'PENDING' ? 'bg-yellow-100/30' :
                    order.paymentStatus === 'PAGADO' ? 'bg-green-100/30' :
                    'bg-red-100/30'
                  }`}>
                    {order.paymentStatus === 'PENDING' && <Clock className="w-5 h-5 text-yellow-600" />}
                    {order.paymentStatus === 'PAGADO' && <Check className="w-5 h-5 text-green-600" />}
                    {order.paymentStatus === 'FALLIDO' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.paymentStatus}</p>
                    <p className="text-xs text-gray-600">
                      {order.paymentStatus === 'PENDING' && 'Esperando procesamiento'}
                      {order.paymentStatus === 'PAGADO' && 'Pago completado'}
                      {order.paymentStatus === 'FALLIDO' && 'Pago rechazado'}
                    </p>
                  </div>
                </div>
              </div>

              {}
              {order.paymentStatus === 'PENDING' && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Procesar Pago</h3>
                  
                  {}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Pago
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      disabled={processing}
                    >
                      <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="PAYPAL">PayPal</option>
                      <option value="STRIPE">Stripe</option>
                    </select>
                  </div>

                  {}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas del Pago (Opcional)
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Detalles adicionales sobre el pago..."
                      disabled={processing}
                    />
                  </div>

                  {}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => processPayment(true)}
                      disabled={processing}
                      className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-2"
                    >
                      {processing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Procesar Pago</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => processPayment(false)}
                      disabled={processing}
                      className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-2"
                    >
                      {processing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          <span>Rechazar Pago</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {}
              {order.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Notas de la Orden</h3>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
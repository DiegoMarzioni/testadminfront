'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, Search, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { Product, OrderItem, Customer, CreateOrderRequest, PaymentMethod } from '@/types'
import { ProductsService, OrdersService } from '@/services/api'
import { Logger } from '@/lib/logger'

interface NewSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onSaleCreated?: (orderId: number) => void
}

export default function NewSaleModal({ isOpen, onClose, onSaleCreated }: NewSaleModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [searchProduct, setSearchProduct] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.EFECTIVO)
  const [shippingAddress, setShippingAddress] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setLoadingData(true)
    try {
      const [productsData, customersData] = await Promise.all([
        ProductsService.getProducts(),
        OrdersService.getAllCustomers()
      ])
      
      const validProducts = productsData.data.filter((product: any) => 
        product && 
        typeof product === 'object' && 
        product.id && 
        product.name && 
        product.brand && 
        product.category
      )
      setProducts(validProducts)
      setCustomers(customersData)
    } catch (error) {
      Logger.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
      setProducts([])
      setCustomers([])
    } finally {
      setLoadingData(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product?.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product?.brand?.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product?.category?.name?.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const addToOrder = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Producto sin stock disponible')
      return
    }

    const existingItem = orderItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('No hay suficiente stock disponible')
        return
      }
      
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setOrderItems([...orderItems, {
        productId: product.id,
        product,
        quantity: 1,
        price: product.price
      }])
    }
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(productId)
      return
    }

    const product = products.find(p => p.id === productId)
    if (product && newQuantity > product.stock) {
      toast.error('Cantidad excede el stock disponible')
      return
    }

    setOrderItems(orderItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeFromOrder = (productId: number) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId))
  }

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCreateSale = async () => {
    if (!selectedCustomer) {
      toast.error('Por favor seleccione un cliente')
      return
    }

    if (orderItems.length === 0) {
      toast.error('Por favor agregue productos a la venta')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading('Procesando venta...')
    
    try {
      const orderData: CreateOrderRequest = {
        customerId: parseInt(selectedCustomer),
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod,
        shippingAddress: shippingAddress || undefined,
        notes: notes || undefined
      }

      const response = await OrdersService.createOrder(orderData)
      
      toast.dismiss(loadingToast)
      toast.success(`¡Venta creada exitosamente! Orden #${response.id}`, {
        duration: 4000
      })

      resetForm()
      onClose()
      
      if (onSaleCreated) {
        onSaleCreated(response.id)
      }
      
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error('Error al generar la venta')
      Logger.error('Error creating order:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setOrderItems([])
    setSelectedCustomer('')
    setSearchProduct('')
    setPaymentMethod(PaymentMethod.EFECTIVO)
    setShippingAddress('')
    setNotes('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Nueva Venta</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {}
        <div className="flex flex-1 overflow-hidden">
          {}
          <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
            
            {}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2">Cargando productos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      product.stock <= 0
                        ? 'bg-gray-100 border-gray-300 opacity-60'
                        : 'bg-white border-gray-200 hover:border-green-500'
                    }`}
                    onClick={() => addToOrder(product)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      <span className="text-green-600 font-bold">${product.price}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{product.brand.name}</p>
                    <p className="text-xs text-gray-600 mb-2">{product.category.name}</p>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.stock <= 0
                          ? 'bg-red-100 text-red-800'
                          : product.stock <= 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="w-96 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Venta</h3>
            
            {}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Seleccionar cliente...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            </div>

            {}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={PaymentMethod.EFECTIVO}>Efectivo</option>
                <option value={PaymentMethod.TARJETA}>Tarjeta</option>
                <option value={PaymentMethod.TRANSFERENCIA}>Transferencia</option>
              </select>
            </div>

            {}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección de Envío
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Dirección de envío (opcional)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales (opcional)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Productos Agregados</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {orderItems.length > 0 ? (
                  orderItems.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-gray-600">${item.price} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300"
                        >
                          <Minus className="w-3 h-3 mx-auto" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300"
                        >
                          <Plus className="w-3 h-3 mx-auto" />
                        </button>
                      </div>
                      <span className="font-medium ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">
                    No hay productos agregados
                  </p>
                )}
              </div>
            </div>

            {}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">${getTotalAmount().toFixed(2)}</span>
              </div>
            </div>

            {}
            <button
              onClick={handleCreateSale}
              disabled={loading || orderItems.length === 0 || !selectedCustomer}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors font-semibold flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{loading ? 'Procesando...' : 'Crear Venta'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
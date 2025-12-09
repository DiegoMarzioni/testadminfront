'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Product, OrderItem, Customer, CreateOrderRequest } from '@/types'
import { ProductsService, OrdersService } from '@/services/api'
import { Logger } from '@/lib/logger'

export default function NewSalePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [searchProduct, setSearchProduct] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        
        const productsData = await ProductsService.getProducts()
        Logger.debug('Products response:', productsData)

        const validProducts = productsData.data.filter((product: any) => 
          product && 
          typeof product === 'object' && 
          product.id && 
          product.name && 
          product.brand && 
          product.category
        )
        setProducts(validProducts)

        const customersData = await OrdersService.getAllCustomers()
        Logger.debug('Customers response:', customersData)
        setCustomers(customersData)

      } catch (error) {
        Logger.error('Error fetching data:', error)
        toast.error('Error al cargar los datos')
        setProducts([])
        setCustomers([])
      }
    }

    fetchData()
  }, [router])

  const filteredProducts = products.filter(product =>
    product?.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product?.brand?.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product?.category?.name?.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const addToOrder = (product: Product) => {
    if (product.stock <= 0) {
      alert('Producto sin stock disponible')
      return
    }

    const existingItem = orderItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('No hay suficiente stock disponible')
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
      alert('Cantidad excede el stock disponible')
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

  const handleGenerateSale = async () => {
    if (!selectedCustomer) {
      alert('Por favor seleccione un cliente')
      return
    }

    if (orderItems.length === 0) {
      toast.error('Por favor agregue productos a la venta')
      return
    }

    setLoading(true)
    setError('')

    const loadingToast = toast.loading('Procesando venta...')
    
    try {
      const orderData: CreateOrderRequest = {
        customerId: parseInt(selectedCustomer),
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }

      const response = await OrdersService.createOrder(orderData)
      
      toast.dismiss(loadingToast)
      toast.success(`¡Venta generada exitosamente! ID: ${response.id}`, {
        duration: 4000
      })
      
      setOrderItems([])
      setSelectedCustomer('')
      setSearchProduct('')
      
    } catch (err) {
      toast.dismiss(loadingToast)
      const errorMsg = 'Error al generar la venta'
      setError(errorMsg)
      toast.error(errorMsg)
      Logger.error('Error creating order:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Generar Venta</h1>
          </div>
        </div>
        <p className="text-slate-600 mt-1 sm:mt-2">Sistema de punto de venta</p>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 p-4 bg-red-100/30 border border-red-300 text-red-700 rounded-md">
          {typeof error === 'string' ? error : 'Error en el sistema de ventas'}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">Buscar Productos</h2>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por nombre, marca o categoría..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.isArray(filteredProducts) && filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      product.stock <= 0
                        ? 'bg-gray-100 border-gray-300 opacity-60'
                        : 'bg-white border-gray-200 hover:border-green-500'
                    }`}
                    onClick={() => addToOrder(product)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <span className="text-lg font-bold text-green-600">${product.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Marca: {product.brand.name}</p>
                    <p className="text-sm text-gray-600 mb-2">Categoría: {product.category.name}</p>
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
                      {product.stock > 0 && (
                        <span className="text-xs text-blue-600">Click para agregar</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Venta</h2>
            
            {}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Seleccionar cliente...</option>
                {Array.isArray(customers) && customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            </div>

            {}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {Array.isArray(orderItems) && orderItems.length > 0 ? (
                orderItems.map((item) => (
                  <div key={item.productId} className="border-b border-gray-200 pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                      <button
                        onClick={() => removeFromOrder(item.productId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ❌
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded text-sm hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded text-sm hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>${item.price} x {item.quantity}</span>
                      <span className="font-medium">${item.price * item.quantity}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay productos agregados
                </p>
              )}
            </div>

            {}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-green-600">${getTotalAmount()}</span>
              </div>
            </div>

            {}
            <button
              onClick={handleGenerateSale}
              disabled={loading || orderItems.length === 0 || !selectedCustomer}
              className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors font-semibold flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{loading ? 'Procesando...' : 'Generar Venta'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { AlertTriangle, Plus, Package, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'
import { ProductsService } from '@/services/api'
import { Logger } from '@/lib/logger'

interface LowStockProduct extends Product {
  urgencyLevel: 'critical' | 'warning' | 'low'
  restockSuggestion: number
}

interface SmartLowStockProps {
  className?: string
}

export default function SmartLowStock({ className }: SmartLowStockProps) {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [totalLowStock, setTotalLowStock] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchLowStockProducts()
  }, [])

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true)
      const response = await ProductsService.getProducts()
      const products = response.data || []

      const lowStockItems = products
        .filter((product: Product) => (product.stock || 0) < 10)
        .map((product: Product) => {
          const stock = product.stock || 0
          let urgencyLevel: 'critical' | 'warning' | 'low'
          let restockSuggestion: number

          if (stock === 0) {
            urgencyLevel = 'critical'
            restockSuggestion = 50 
          } else if (stock <= 3) {
            urgencyLevel = 'critical' 
            restockSuggestion = Math.max(25, stock * 8)
          } else if (stock <= 6) {
            urgencyLevel = 'warning'
            restockSuggestion = Math.max(20, stock * 5)
          } else {
            urgencyLevel = 'low'
            restockSuggestion = Math.max(15, stock * 3)
          }

          return {
            ...product,
            urgencyLevel,
            restockSuggestion
          } as LowStockProduct
        })
        .sort((a, b) => {
          
          const urgencyOrder = { critical: 0, warning: 1, low: 2 }
          if (urgencyOrder[a.urgencyLevel] !== urgencyOrder[b.urgencyLevel]) {
            return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel]
          }
          return (a.stock || 0) - (b.stock || 0)
        })

      setLowStockProducts(lowStockItems)
      setTotalLowStock(lowStockItems.length)
    } catch (error: any) {
      Logger.error('Error fetching low stock products:', error)
      toast.error('Error al cargar productos con stock bajo')
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200/30'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200/30'
      case 'low':
        return 'bg-orange-100 text-orange-800 border-orange-200/30'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200/30'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    const iconClass = urgency === 'critical' ? 'w-4 h-4 text-red-600' : 
                     urgency === 'warning' ? 'w-4 h-4 text-yellow-600' : 
                     'w-4 h-4 text-orange-600'
    return <AlertTriangle className={iconClass} />
  }

  const handleRestockProduct = (productId: number, currentStock: number, suggestion: number) => {
    
    router.push(`/dashboard/products?edit=${productId}&stock=${currentStock}&suggestion=${suggestion}`)
  }

  const handleAddStock = (productId: number) => {
    
    const product = lowStockProducts.find(p => p.id === productId)
    if (product) {
      handleRestockProduct(productId, product.stock || 0, product.restockSuggestion)
    }
  }

  const getCriticalCount = () => lowStockProducts.filter(p => p.urgencyLevel === 'critical').length
  const getWarningCount = () => lowStockProducts.filter(p => p.urgencyLevel === 'warning').length

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-slate-600">Analizando stock...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${className}`}>
      {}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100/30 rounded-lg">
            <Package className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Stock Inteligente</h3>
            <p className="text-sm text-slate-600">
              {totalLowStock} productos necesitan reposición
            </p>
          </div>
        </div>
        
        {}
        <div className="flex space-x-2">
          {getCriticalCount() > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800/30">
              {getCriticalCount()} críticos
            </span>
          )}
          {getWarningCount() > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800/30">
              {getWarningCount()} advertencia
            </span>
          )}
        </div>
      </div>

      {}
      <div className="space-y-3">
        {lowStockProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">¡Excelente! Todos los productos tienen stock suficiente</p>
            <p className="text-sm text-slate-500 mt-1">No hay productos con stock menor a 10 unidades</p>
          </div>
        ) : (
          lowStockProducts.slice(0, 5).map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center space-x-3">
                {getUrgencyIcon(product.urgencyLevel)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {product.name}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(product.urgencyLevel)}`}>
                      {product.urgencyLevel === 'critical' ? 'Crítico' : 
                       product.urgencyLevel === 'warning' ? 'Advertencia' : 'Bajo'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-xs text-slate-600">
                      Stock actual: <span className="font-semibold text-red-600">{product.stock || 0}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      Sugerencia: <span className="font-semibold text-blue-600">+{product.restockSuggestion}</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      Precio: ${product.price}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {}
                <button
                  onClick={() => handleAddStock(product.id)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                  title={`Añadir ${product.restockSuggestion} unidades`}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Añadir
                </button>
                
                {}
                <button
                  onClick={() => handleRestockProduct(product.id, product.stock || 0, product.restockSuggestion)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {}
      {lowStockProducts.length > 5 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button
            onClick={() => router.push('/dashboard/products?filter=lowstock')}
            className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm py-2 rounded-md hover:bg-blue-50/20 transition-colors"
          >
            Ver todos los productos con stock bajo ({lowStockProducts.length}) →
          </button>
        </div>
      )}

      {}
      {lowStockProducts.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50/20 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Recomendaciones Inteligentes</h4>
          <div className="space-y-1 text-xs text-blue-800">
            {getCriticalCount() > 0 && (
              <p>• {getCriticalCount()} productos críticos requieren atención inmediata</p>
            )}
            <p>• Reposición total sugerida: {lowStockProducts.reduce((sum, p) => sum + p.restockSuggestion, 0)} unidades</p>
            <p>• Inversión estimada: ${lowStockProducts.reduce((sum, p) => sum + (p.restockSuggestion * p.price), 0).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
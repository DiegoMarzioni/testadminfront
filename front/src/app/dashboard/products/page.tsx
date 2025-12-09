'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'
import { Package, Edit, Trash2, Plus, Search, Eye, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Product, Category, PaginationState } from '@/types'
import { ProductsService, CategoriesService } from '@/services/api'
import { Logger } from '@/lib/logger'

interface ProductWithSuggestion extends Product {
  suggestedStock?: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 10, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [editingProduct, setEditingProduct] = useState<ProductWithSuggestion | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const filter = searchParams.get('filter')
    const editId = searchParams.get('edit')
    const stock = searchParams.get('stock')
    const suggestion = searchParams.get('suggestion')

    if (filter === 'lowstock') {
      setStockFilter('lowstock')
    }

    if (editId) {
      
      setTimeout(() => {
        const productToEdit = products.find(p => p.id === parseInt(editId))
        if (productToEdit) {
          setEditingProduct({
            ...productToEdit,
            suggestedStock: suggestion ? parseInt(suggestion) : undefined
          })
        }
      }, 500)
    }
  }, [searchParams, products])

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand?.name && product.brand.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = !categoryFilter || 
      (product.category && product.category.name === categoryFilter)
    
    const matchesStock = !stockFilter || 
      (stockFilter === 'lowstock' && (product.stock || 0) < 10) ||
      (stockFilter === 'outofstock' && (product.stock || 0) === 0)
    
    return matchesSearch && matchesCategory && matchesStock
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const productsData = await ProductsService.getProducts({ limit: 100 }) 
      
      setProducts(productsData.data || [])
      setPagination(productsData.pagination)
      
    } catch (error) {
      Logger.error('Error fetching products:', error)
      toast.error('Error al cargar productos', { id: 'products-error' })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesData = await CategoriesService.getCategories()
      setCategories(categoriesData || [])
    } catch (error) {
      Logger.error('Error fetching categories:', error)
      toast.error('Error al cargar categorías', { id: 'categories-error' })
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const handleDeleteClick = (product: Product) => {
    setDeleteModal({ isOpen: true, product })
  }

  const handleQuickStockUpdate = async (productId: number, newStock: number) => {
    try {
      await ProductsService.updateProduct(productId.toString(), { stock: newStock })

      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: newStock } : p
      ))
      
      setEditingProduct(null)
      toast.success('Stock actualizado correctamente')
    } catch (error: any) {
      Logger.error('Error updating stock:', error)
      toast.error('Error al actualizar el stock')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.product) return
    
    setIsDeleting(true)
    
    try {
      const updatedProduct = await ProductsService.deleteProduct(deleteModal.product.id.toString())

      setProducts(prev => prev.map(p => 
        p.id === deleteModal.product?.id 
          ? { ...p, status: 'INACTIVE' }
          : p
      ))
      
      toast.success(`Producto "${deleteModal.product.name}" desactivado correctamente`)
      setDeleteModal({ isOpen: false, product: null })
      
    } catch (error: any) {
      Logger.error('Error deleting product:', error)

      let errorMessage = 'Error al eliminar el producto'

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      if (errorMessage.includes('órdenes asociadas') || errorMessage.includes('orders')) {
        errorMessage = '📦 No se puede eliminar este producto porque tiene órdenes/ventas asociadas.\n\n💡 Cambia el estado a "Inactivo" en su lugar.'
      } else if (errorMessage.includes('Bad Request') || errorMessage.includes('400')) {
        errorMessage = '⚠️ Este producto no se puede eliminar porque está siendo utilizado.\n\nPuedes desactivarlo cambiando su estado a "Inactivo".'
      }
      
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: '400px',
          whiteSpace: 'pre-line'
        }
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Productos</h1>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Importar Productos</span>
          </button>
          <button
            onClick={() => router.push('/dashboard/products/new')}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

          {}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Buscar producto
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-500"
                  />
                </div>
              </div>
              
              {}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filtrar por categoría
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filtrar por stock
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                >
                  <option value="">Todo el stock</option>
                  <option value="lowstock">Stock bajo (&lt;10)</option>
                  <option value="outofstock">Sin stock (0)</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-600">
                Mostrando {filteredProducts.length} productos
                {stockFilter === 'lowstock' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800/30">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Stock Bajo
                  </span>
                )}
              </span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50 transition-colors">
                  Filtros
                </button>
                <button 
                  onClick={() => {
                    setSearchTerm('')
                    setCategoryFilter('')
                    setStockFilter('')
                    router.push('/dashboard/products') 
                  }}
                  className="px-3 py-1 text-blue-600 text-sm hover:bg-blue-50/20 rounded transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Marca</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                              {product.image ? (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (sibling) sibling.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-500" />
                              )}
                              {product.image && (
                                <Package className="w-5 h-5 text-slate-500 hidden" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {product.description ? product.description.substring(0, 60) + (product.description.length > 60 ? '...' : '') : 'Sin descripción'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100/30 text-blue-800">
                            {typeof product.category === 'object' ? product.category.name : product.category || 'Sin categoría'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {typeof product.brand === 'object' ? product.brand.name : product.brand || 'Sin marca'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock > 50 
                              ? 'bg-green-100/30 text-green-800'
                              : product.stock > 20
                              ? 'bg-yellow-100/30 text-yellow-800'
                              : 'bg-red-100/30 text-red-800'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.status === 'ACTIVE'
                              ? 'bg-green-100/30 text-green-800'
                              : product.status === 'DRAFT'
                              ? 'bg-yellow-100/30 text-yellow-800'
                              : 'bg-red-100/30 text-red-800'
                          }`}>
                            {product.status === 'ACTIVE' ? 'Activo' : product.status === 'DRAFT' ? 'Borrador' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => router.push(`/dashboard/products/${product.id}`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
                              title="Editar producto"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center space-y-3">
                          <Package className="w-12 h-12 text-slate-300" />
                          <p>
                            {searchTerm || categoryFilter 
                              ? 'No se encontraron productos con los filtros aplicados'
                              : 'No hay productos registrados'
                            }
                          </p>
                          {!searchTerm && !categoryFilter && (
                            <button
                              onClick={() => router.push('/dashboard/products/new')}
                              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              Crear primer producto
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {}
            <div className="lg:hidden">
              {filteredProducts.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <h3 className="text-sm font-semibold text-slate-900 truncate">
                              {product.name}
                            </h3>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-xs text-slate-600">
                              SKU: {product.sku || 'N/A'}
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {typeof product.category === 'object' ? product.category.name : product.category || 'Sin categoría'}
                              </span>
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                {typeof product.brand === 'object' ? product.brand.name : product.brand || 'Sin marca'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.stock > 50
                                  ? 'bg-green-100 text-green-800'
                                  : product.stock > 20
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                Stock: {product.stock}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.status === 'active' ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => router.push(`/dashboard/products/${product.id}`)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(product.stock || 0) < 10 && (
                            <button
                              onClick={() => setEditingProduct({
                                ...product,
                                suggestedStock: Math.max(25, (product.stock || 0) * 5)
                              })}
                              className="p-1.5 text-orange-500 hover:text-orange-600 transition-colors"
                              title="Stock bajo - Editar rápido"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center space-y-3">
                    <Package className="w-12 h-12 text-slate-300" />
                    <p>
                      {searchTerm || categoryFilter 
                        ? 'No se encontraron productos con los filtros aplicados'
                        : 'No hay productos registrados'
                      }
                    </p>
                    {!searchTerm && !categoryFilter && (
                      <button
                        onClick={() => router.push('/dashboard/products/new')}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Crear primer producto
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

      {}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleDeleteConfirm}
        title="Desactivar Producto"
        message={`¿Estás seguro de que deseas desactivar el producto "${deleteModal.product?.name}"? El producto cambiará a estado "Inactivo" pero se mantendrá en el sistema.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />

      {}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100/30 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Actualizar Stock
                    </h3>
                    <p className="text-sm text-slate-600">
                      {editingProduct.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Stock Actual</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {editingProduct.stock || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Precio</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${editingProduct.price}
                    </p>
                  </div>
                </div>
              </div>

              {}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nuevo Stock
                </label>
                <input
                  type="number"
                  min="0"
                  defaultValue={editingProduct.suggestedStock || editingProduct.stock || 0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
                  placeholder="Cantidad de stock"
                  id="stock-input"
                />
                {editingProduct.suggestedStock && (
                  <p className="text-sm text-blue-600 mt-2">
                    💡 Sugerencia inteligente: {editingProduct.suggestedStock} unidades
                  </p>
                )}
              </div>

              {}
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button
                  onClick={() => {
                    const input = document.getElementById('stock-input') as HTMLInputElement
                    input.value = (editingProduct.suggestedStock || 25).toString()
                  }}
                  className="px-3 py-2 text-sm bg-blue-50/20 text-blue-600 rounded-lg hover:bg-blue-100/30 transition-colors"
                >
                  Usar Sugerencia
                </button>
                <button
                  onClick={() => {
                    const input = document.getElementById('stock-input') as HTMLInputElement
                    input.value = ((editingProduct.stock || 0) + 10).toString()
                  }}
                  className="px-3 py-2 text-sm bg-green-50/20 text-green-600 rounded-lg hover:bg-green-100/30 transition-colors"
                >
                  +10 Unidades
                </button>
              </div>

              {}
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const input = document.getElementById('stock-input') as HTMLInputElement
                    const newStock = parseInt(input.value) || 0
                    handleQuickStockUpdate(editingProduct.id, newStock)
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Actualizar Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, FolderOpen, Package, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/ConfirmModal'
import { Category, Product } from '@/types'
import { CategoriesService, ProductsService } from '@/services/api'
import { Logger } from '@/lib/logger'

export default function CategoryDetailPage() {
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchCategory = async () => {
      try {
        setLoading(true)
        
        const categoryData = await CategoriesService.getCategoryById(params.id as string)
        setCategory(categoryData)

        try {
          const productsData = await ProductsService.getProducts({ categoryId: params.id as string, limit: 100 })
          setProducts(productsData.data || [])
        } catch (productError) {
          Logger.error('Error fetching products for category:', productError)
          setProducts([]) 
        }
        
      } catch (error: any) {
        Logger.error('Error fetching category:', error)
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          localStorage.removeItem('token')
          router.push('/login')
        } else {
          toast.error('Error al cargar la categoría')
          router.push('/dashboard/categories')
        }
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCategory()
    }
  }, [params.id, router])

  const handleDeleteClick = (category: Category) => {
    setDeleteModal({ isOpen: true, category })
  }

  const handleConfirmDelete = async () => {
    if (!deleteModal.category) return

    setIsDeleting(true)
    
    try {
      await CategoriesService.deleteCategory(String(deleteModal.category.id))
      toast.success(`Categoría "${deleteModal.category.name}" eliminada exitosamente`)
      router.push('/dashboard/categories')
    } catch (error: any) {
      Logger.error('Error deleting category:', error)

      let errorMessage = 'Error al eliminar la categoría'

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      if (errorMessage.includes('subcategorías') || errorMessage.includes('children')) {
        errorMessage = '❌ No se puede eliminar esta categoría porque tiene subcategorías.\n\n💡 Elimina primero todas las subcategorías.'
      } else if (errorMessage.includes('productos asociados') || errorMessage.includes('products')) {
        errorMessage = '📦 No se puede eliminar esta categoría porque tiene productos asociados.\n\n💡 Mueve primero todos los productos a otra categoría.'
      } else if (errorMessage.includes('Bad Request') || errorMessage.includes('400')) {
        
        errorMessage = '⚠️ Esta categoría no se puede eliminar porque está siendo utilizada.\n\nVerifica que no tenga productos o subcategorías asociadas.'
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
      setDeleteModal({ isOpen: false, category: null })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Categoría no encontrada
          </h1>
          <p className="text-slate-600 mb-4">
            La categoría que buscas no existe o ha sido eliminada.
          </p>
          <button
            onClick={() => router.push('/dashboard/categories')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Categorías
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/categories')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Detalles de Categoría
            </h1>
            <p className="text-slate-600">
              Información completa de la categoría
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/dashboard/categories/${category.id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => handleDeleteClick(category)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Información Básica
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FolderOpen className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500">
                  ID: #{category.id} | Posición: {category.position}
                </p>
              </div>
            </div>
            
            {category.description && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <p className="text-slate-600">
                  {category.description}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoría Padre
              </label>
              {category.parent ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100/30 text-blue-800">
                  {category.parent.name}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100/30 text-green-800">
                  Categoría Principal
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Creada
                </label>
                <p className="text-sm text-slate-600">
                  {new Date(category.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Actualizada
                </label>
                <p className="text-sm text-slate-600">
                  {new Date(category.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Estadísticas
          </h2>
          
          <div className="space-y-4">
            <div className="bg-slate-50/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-slate-900">
                    Subcategorías
                  </span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {category.children?.length || 0}
                </span>
              </div>
            </div>
            
            <div className="bg-slate-50/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-slate-900">
                    Productos
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {products.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      {category.children && category.children.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Subcategorías
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.children.map((child) => (
              <div
                key={child.id}
                className="border border-slate-200 p-4 rounded-lg hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/categories/${child.id}`)}
              >
                <div className="flex items-center space-x-3">
                  <FolderOpen className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-slate-900 truncate">
                      {child.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {child.products?.length || 0} productos
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {products && products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Productos ({products.length})
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-slate-200 p-4 rounded-lg hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>';
                          }
                        }}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-slate-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {typeof product.brand === 'object' ? product.brand.name : product.brand || 'Sin marca'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.stock > 20 
                          ? 'bg-green-100/30 text-green-800'
                          : product.stock > 10
                          ? 'bg-yellow-100/30 text-yellow-800'
                          : 'bg-red-100/30 text-red-800'
                      }`}>
                        Stock: {product.stock}
                      </span>
                      <button
                        onClick={() => router.push(`/dashboard/products/${product.id}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Ver producto"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {products.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Productos
          </h2>
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              No hay productos asociados a esta categoría
            </p>
            <button
              onClick={() => router.push('/dashboard/products/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar Producto
            </button>
          </div>
        </div>
      )}

      {}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que quieres eliminar la categoría "${deleteModal.category?.name}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
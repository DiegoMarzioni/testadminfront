'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Package, Edit, Trash2, Tag, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/ConfirmModal'
import { Product } from '@/types'
import { ProductsService } from '@/services/api'
import { Logger } from '@/lib/logger'

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null
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

    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await ProductsService.getProductById(params.id as string)
        setProduct(data)
      } catch (error: any) {
        Logger.error('Error fetching product:', error)
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          localStorage.removeItem('token')
          router.push('/login')
        } else {
          toast.error('Error al cargar el producto')
          router.push('/dashboard/products')
        }
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  const handleDeleteClick = (product: Product) => {
    setDeleteModal({ isOpen: true, product })
  }

  const handleConfirmDelete = async () => {
    if (!deleteModal.product) return

    setIsDeleting(true)
    
    try {
      await ProductsService.deleteProduct(deleteModal.product.id.toString())
      toast.success(`Producto "${deleteModal.product.name}" desactivado exitosamente`)
      router.push('/dashboard/products')
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
      setDeleteModal({ isOpen: false, product: null })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Cargando producto...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Producto no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {product.name}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => handleDeleteClick(product)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Imagen del Producto
            </h2>
            <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                    }
                  }}
                />
              ) : (
                <Package className="w-12 h-12 text-slate-400" />
              )}
            </div>
          </div>
        </div>

        {}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Información del Producto
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre
                  </label>
                  <p className="text-slate-900 font-medium">
                    {product.name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Precio
                  </label>
                  <p className="text-slate-900 font-medium text-xl">
                    ${product.price?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Stock
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 20 
                      ? 'bg-green-100/30 text-green-800'
                      : product.stock > 10
                      ? 'bg-yellow-100/30 text-yellow-800'
                      : 'bg-red-100/30 text-red-800'
                  }`}>
                    {product.stock} unidades
                  </span>
                </div>
              </div>

              {}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Categoría
                  </label>
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-900">
                      {typeof product.category === 'object' ? product.category.name : product.category || 'Sin categoría'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Marca
                  </label>
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-900">
                      {typeof product.brand === 'object' ? product.brand.name : product.brand || 'Sin marca'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === 'ACTIVE'
                      ? 'bg-green-100/30 text-green-800'
                      : product.status === 'DRAFT'
                      ? 'bg-yellow-100/30 text-yellow-800'
                      : 'bg-red-100/30 text-red-800'
                  }`}>
                    {product.status === 'ACTIVE' ? 'Activo' : product.status === 'DRAFT' ? 'Borrador' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {}
            {product.description && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción
                </label>
                <p className="text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Desactivar Producto"
        message={`¿Estás seguro de que quieres desactivar el producto "${deleteModal.product?.name}"? El producto cambiará a estado "Inactivo" pero se mantendrá en el sistema.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
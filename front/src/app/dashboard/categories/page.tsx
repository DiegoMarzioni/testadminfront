'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ConfirmModal'
import { FolderOpen, Edit, Trash2, Plus, Eye, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { Category } from '@/types'
import { CategoriesService } from '@/services/api'
import { Logger } from '@/lib/logger'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: Category | null }>({
    isOpen: false,
    category: null
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchCategories = async () => {
      try {
        const data = await CategoriesService.getCategories()
        setCategories(data)
      } catch (error: any) {
        Logger.error('Error fetching categories:', error)
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          localStorage.removeItem('token')
          router.push('/login')
        } else {
          toast.error('Error al cargar categorías')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [router])

  const handleDeleteClick = (category: Category) => {
    setDeleteModal({ isOpen: true, category })
  }

  const handleConfirmDelete = async () => {
    if (!deleteModal.category) return

    setIsDeleting(true)
    
    try {
      await CategoriesService.deleteCategory(String(deleteModal.category.id))
      setCategories(categories.filter(cat => cat.id !== deleteModal.category!.id))
      toast.success(`Categoría "${deleteModal.category.name}" eliminada`)
      setDeleteModal({ isOpen: false, category: null })
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Categorías</h1>
          <p className="text-slate-600 mt-1 sm:mt-2">Gestionar categorías de productos</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/categories/new')}
          className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Nueva Categoría</span>
          <span className="xs:hidden">Nueva</span>
        </button>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-500"
          />
        </div>
      </div>

          {}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Posición</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subcategorías</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría Padre</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Array.isArray(categories) && categories.length ? (
                    categories
                      .filter(category => 
                        category.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((category, index) => (
                      <tr key={category.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-4 text-sm text-slate-900 font-medium">{index}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-slate-900">{category.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {category.children?.length > 0 
                            ? `${category.children.length} subcategorías`
                            : '0 subcategorías'
                          }
                        </td>
                        <td className="px-4 py-4">
                          {category.parent ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100/30 text-blue-800">
                              {category.parent.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100/30 text-green-800">
                              Principal
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => router.push(`/dashboard/categories/${category.id}`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/categories/${category.id}/edit`)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors"
                              title="Editar categoría"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(category)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                              title="Eliminar categoría"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center space-y-3">
                          <FolderOpen className="w-12 h-12 text-slate-300" />
                          <p>No hay categorías registradas</p>
                          <button
                            onClick={() => router.push('/dashboard/categories/new')}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                          >
                            Crear primera categoría
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {}
            <div className="lg:hidden">
              {categories.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {categories
                    .filter(category => 
                      category.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((category, index) => (
                    <div key={category.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                              {index}
                            </span>
                            <FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <h3 className="text-sm font-semibold text-slate-900 truncate">
                              {category.name}
                            </h3>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-500">Subcategorías:</span>
                                <div className="font-medium text-slate-900">
                                  {category.children?.length > 0 
                                    ? `${category.children.length} subcategorías`
                                    : '0 subcategorías'
                                  }
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500">Categoría padre:</span>
                                <div className="font-medium">
                                  {category.parent ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100/30 text-blue-800">
                                      {category.parent.name}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100/30 text-green-800">
                                      Principal
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => router.push(`/dashboard/categories/${category.id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/categories/${category.id}/edit`)}
                            className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                            title="Editar categoría"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            title="Eliminar categoría"
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
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="mb-4">No hay categorías registradas</p>
                  <button
                    onClick={() => router.push('/dashboard/categories/new')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Crear primera categoría
                  </button>
                </div>
              )}
            </div>
          </div>

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
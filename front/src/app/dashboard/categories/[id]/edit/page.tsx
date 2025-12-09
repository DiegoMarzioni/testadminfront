'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Category, UpdateCategoryData } from '@/types'
import { CategoriesService } from '@/services/api'
import { Logger } from '@/lib/logger'

export default function EditCategoryPage() {
  const [category, setCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    parentId: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        
        const categoryData = await CategoriesService.getCategoryById(params.id as string)
        setCategory(categoryData)
        setFormData({
          name: categoryData.name,
          parentId: categoryData.parent?.id?.toString() || ''
        })

        const allCategories = await CategoriesService.getCategories()
        
        setCategories(allCategories.filter(cat => cat.id !== Number(params.id)))
      } catch (error: any) {
        Logger.error('Error fetching data:', error)
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          localStorage.removeItem('token')
          router.push('/login')
        } else {
          toast.error('Error al cargar los datos')
          router.push('/dashboard/categories')
        }
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload: UpdateCategoryData = {
        name: formData.name,
        parentId: formData.parentId || undefined
      }

      await CategoriesService.updateCategory(params.id as string, payload)
      toast.success('Categoría actualizada exitosamente')
      router.push(`/dashboard/categories/${params.id}`)
    } catch (err: any) {
      Logger.error('Error updating category:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al actualizar la categoría'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
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
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.push('/dashboard/categories')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Categoría
            </h1>
            <p className="mt-2 text-gray-600">
              Modifica los datos de la categoría "{category.name}"
            </p>
          </div>
        </div>

        {}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-8 sm:px-8">
            {error && (
              <div className="mb-6 p-4 bg-red-100/20 border border-red-300 text-red-700 rounded-md">
                {typeof error === 'string' ? error : 'Error al actualizar categoría'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {}
              <div className="bg-blue-50/20 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Editando categoría
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-700 font-medium">Actual:</span>
                  <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                    {category?.name}
                  </span>
                  {category?.parent && (
                    <>
                      <span className="text-blue-600">en</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {category.parent.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="parentId" className="block text-sm font-semibold text-gray-700 mb-3">
                    📁 Mover a Categoría Padre
                  </label>
                  <select
                    id="parentId"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
                  >
                    <option value="">🏠 Principal (sin padre)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        📂 {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Selecciona dónde quieres ubicar esta categoría
                  </p>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                    ✏️ Cambiar Nombre
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
                    placeholder="Escribe el nuevo nombre"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    El nuevo nombre para esta categoría
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/dashboard/categories')}
                  className="inline-flex items-center justify-center px-8 py-3 bg-white border border-gray-300 text-gray-700 text-base font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
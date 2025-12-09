'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Category, CreateCategoryData } from '@/types'
import { CategoriesService } from '@/services/api'
import { Logger } from '@/lib/logger'

export default function NewCategoryPage() {
  const [formData, setFormData] = useState({
    name: '',
    parentId: ''
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
      } catch (error) {
        Logger.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const token = localStorage.getItem('token')
    
    try {
      const payload: CreateCategoryData = {
        name: formData.name,
        parentId: formData.parentId || undefined
      }

      await CategoriesService.createCategory(payload)
      router.push('/dashboard/categories')
      
    } catch (err: any) {
      Logger.error('Error creating category:', err)
      setError(err.message || 'Error al crear la categoría')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
            <h1 className="text-3xl font-bold text-gray-900">Nueva Categoría</h1>
            <p className="text-gray-600 mt-2">Crear una nueva categoría de productos</p>
          </div>
        </div>

        {}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-8 sm:px-8">
            {error && (
              <div className="mb-6 p-4 bg-red-100/20 border border-red-300 text-red-700 rounded-md">
                {typeof error === 'string' ? error : 'Error al crear categoría'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                    Nombre *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
                    placeholder="Nombre de la categoría"
                  />
                </div>

                <div>
                  <label htmlFor="parentId" className="block text-sm font-semibold text-gray-700 mb-3">
                    Categoría Padre
                  </label>
                  <select
                    id="parentId"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-colors"
                  >
                    <option value="">Principal (sin padre)</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white text-base font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando...
                    </>
                  ) : (
                    "Crear"
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
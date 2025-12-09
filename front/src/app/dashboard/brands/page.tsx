'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Tag, Package, TrendingUp, Plus, Filter, Grid, List } from 'lucide-react'
import toast from 'react-hot-toast'
import { Brand, Product } from '@/types'
import { BrandsService, ProductsService } from '@/services/api'
import { Logger } from '@/lib/logger'

interface BrandWithStats extends Brand {
  productCount: number
  totalValue: number
  averagePrice: number
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'products' | 'value'>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [brandsData, productsResponse] = await Promise.all([
          BrandsService.getBrands(),
          ProductsService.getProducts({ limit: 1000 }) 
        ])

        const productsData = productsResponse.data || []

        const brandsWithStats: BrandWithStats[] = brandsData.map(brand => {
          const brandProducts = productsData.filter(product => product.brand && product.brand.id === brand.id)
          const totalValue = brandProducts.reduce((sum, product) => sum + (product.price * product.stock), 0)
          const averagePrice = brandProducts.length > 0 
            ? brandProducts.reduce((sum, product) => sum + product.price, 0) / brandProducts.length 
            : 0

          return {
            ...brand,
            productCount: brandProducts.length,
            totalValue,
            averagePrice
          }
        })

        setBrands(brandsWithStats)
      } catch (error: any) {
        Logger.error('Error fetching brands data:', error)
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          localStorage.removeItem('token')
          router.push('/login')
        } else {
          toast.error('Error al cargar datos de marcas')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const filteredAndSortedBrands = brands
    .filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'products':
          return b.productCount - a.productCount
        case 'value':
          return b.totalValue - a.totalValue
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-slate-600">Cargando marcas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Marcas
          </h1>
          <p className="text-slate-600 mt-2">
            Explora todas las marcas disponibles y sus estadísticas
          </p>
        </div>
        
        {}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100/30 rounded-lg">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Marcas</p>
                <p className="text-2xl font-bold text-slate-900">{brands.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100/30 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Productos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {brands.reduce((sum, brand) => sum + brand.productCount, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-slate-200 col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Valor Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${brands.reduce((sum, brand) => sum + brand.totalValue, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar marcas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-500"
            />
          </div>

          {}
          <div className="flex items-center space-x-3">
            {}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'products' | 'value')}
                className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Nombre A-Z</option>
                <option value="products">Más productos</option>
                <option value="value">Mayor valor</option>
              </select>
            </div>

            {}
            <div className="flex rounded-lg border border-slate-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      {filteredAndSortedBrands.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredAndSortedBrands.map((brand) => (
            <div
              key={brand.id}
              className={`bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 ${
                viewMode === 'grid' ? 'p-6' : 'p-4'
              }`}
            >
              {viewMode === 'grid' ? (
                
                <div className="text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {brand.name}
                  </h3>
                  
                  {brand.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {brand.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Productos:</span>
                      <span className="font-semibold text-slate-900">{brand.productCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Valor total:</span>
                      <span className="font-semibold text-green-600">
                        ${brand.totalValue.toLocaleString()}
                      </span>
                    </div>
                    
                    {brand.productCount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Precio prom.:</span>
                        <span className="font-semibold text-blue-600">
                          ${brand.averagePrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {brand.name}
                      </h3>
                      {brand.description && (
                        <p className="text-sm text-slate-600 line-clamp-1">
                          {brand.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="text-slate-600">Productos</p>
                      <p className="font-semibold text-slate-900">{brand.productCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-600">Valor Total</p>
                      <p className="font-semibold text-green-600">
                        ${brand.totalValue.toLocaleString()}
                      </p>
                    </div>
                    {brand.productCount > 0 && (
                      <div className="text-center">
                        <p className="text-slate-600">Precio Prom.</p>
                        <p className="font-semibold text-blue-600">
                          ${brand.averagePrice.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12">
          <div className="text-center">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No se encontraron marcas
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm ? 'Intenta ajustar tu búsqueda' : 'No hay marcas registradas en el sistema'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
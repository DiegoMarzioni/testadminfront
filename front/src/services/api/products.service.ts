import { BaseApiService } from '../base.service'
import { 
  Product, 
  CreateProductData, 
  UpdateProductData, 
  PaginatedResponse,
  API_ENDPOINTS 
} from '@/types'

export interface ProductsQueryParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  brandId?: string
  status?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export class ProductsService extends BaseApiService {
  static async getProducts(params?: ProductsQueryParams): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const endpoint = params && Object.keys(params).length > 0
      ? `${API_ENDPOINTS.PRODUCTS.BASE}?${searchParams.toString()}`
      : API_ENDPOINTS.PRODUCTS.BASE
    
    return this.get<PaginatedResponse<Product>>(endpoint)
  }

  static async getProductById(id: string): Promise<Product> {
    return this.get<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id))
  }

  static async createProduct(data: CreateProductData): Promise<Product> {
    return this.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, data)
  }

  static async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    return this.patch<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id), data)
  }

  static async deleteProduct(id: string): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.PRODUCTS.BY_ID(id))
  }

  static async searchProducts(query: string): Promise<Product[]> {
    return this.get<Product[]>(`${API_ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}`)
  }

  static async updateProductStock(id: number, stock: number): Promise<Product> {
    return this.patch<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(String(id)), { stock })
  }

  static async bulkUpdateProducts(updates: Array<{ id: number; data: Partial<Product> }>): Promise<Product[]> {
    return this.put<Product[]>(`${API_ENDPOINTS.PRODUCTS.BASE}/bulk`, { updates })
  }
}
import { BaseApiService } from '../base.service'
import { 
  Category, 
  CreateCategoryData, 
  UpdateCategoryData,
  API_ENDPOINTS 
} from '@/types'

export interface CategoriesQueryParams {
  includeProducts?: boolean
  includeChildren?: boolean
  parentId?: number
}

export class CategoriesService extends BaseApiService {
  static async getCategories(params?: CategoriesQueryParams): Promise<Category[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const endpoint = params && Object.keys(params).length > 0
      ? `${API_ENDPOINTS.CATEGORIES.BASE}?${searchParams.toString()}`
      : API_ENDPOINTS.CATEGORIES.BASE
    
    return this.get<Category[]>(endpoint)
  }

  static async getCategoryById(id: string, includeProducts = false): Promise<Category> {
    const endpoint = includeProducts 
      ? `${API_ENDPOINTS.CATEGORIES.BY_ID(id)}?includeProducts=true`
      : API_ENDPOINTS.CATEGORIES.BY_ID(id)
    
    return this.get<Category>(endpoint)
  }

  static async getCategoryTree(): Promise<Category[]> {
    return this.get<Category[]>(API_ENDPOINTS.CATEGORIES.TREE)
  }

  static async createCategory(data: CreateCategoryData): Promise<Category> {
    return this.post<Category>(API_ENDPOINTS.CATEGORIES.BASE, data)
  }

  static async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    return this.patch<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id), data)
  }

  static async deleteCategory(id: string): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.CATEGORIES.BY_ID(id))
  }

  static async reorderCategories(categories: Array<{ id: number; position: number }>): Promise<Category[]> {
    return this.put<Category[]>(`${API_ENDPOINTS.CATEGORIES.BASE}/reorder`, { categories })
  }
}
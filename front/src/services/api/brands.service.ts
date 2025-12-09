import { BaseApiService } from '../base.service'
import { Brand, API_ENDPOINTS } from '@/types'

export interface CreateBrandData {
  name: string
  description?: string
}

export interface UpdateBrandData extends Partial<CreateBrandData> {
  id: string
}

export class BrandsService extends BaseApiService {
  static async getBrands(): Promise<Brand[]> {
    return this.get<Brand[]>(API_ENDPOINTS.BRANDS.BASE)
  }

  static async getBrandById(id: string): Promise<Brand> {
    return this.get<Brand>(API_ENDPOINTS.BRANDS.BY_ID(id))
  }

  static async createBrand(data: CreateBrandData): Promise<Brand> {
    return this.post<Brand>(API_ENDPOINTS.BRANDS.BASE, data)
  }

  static async updateBrand(id: string, data: UpdateBrandData): Promise<Brand> {
    return this.put<Brand>(API_ENDPOINTS.BRANDS.BY_ID(id), data)
  }

  static async deleteBrand(id: number): Promise<void> {
    return this.delete<void>(API_ENDPOINTS.BRANDS.BY_ID(String(id)))
  }
}
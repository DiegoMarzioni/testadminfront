import { BaseApiService } from '../base.service'
import { 
  DashboardStats, 
  InventorySummary, 
  SalesData, 
  TopProduct,
  API_ENDPOINTS 
} from '@/types'
import { Logger } from '@/lib/logger'

export interface SalesQueryParams {
  days?: number
  startDate?: string
  endDate?: string
}

export class DashboardService extends BaseApiService {
  static async getStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS)
  }

  static async getInventorySummary(): Promise<InventorySummary> {
    return this.get<InventorySummary>(API_ENDPOINTS.DASHBOARD.INVENTORY)
  }

  static async getSalesData(params?: SalesQueryParams): Promise<SalesData[]> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const endpoint = params && Object.keys(params).length > 0
      ? `${API_ENDPOINTS.DASHBOARD.SALES}?${searchParams.toString()}`
      : API_ENDPOINTS.DASHBOARD.SALES
    
    return this.get<SalesData[]>(endpoint)
  }

  static async getTopProducts(limit = 10): Promise<TopProduct[]> {
    return this.get<TopProduct[]>(`${API_ENDPOINTS.DASHBOARD.TOP_PRODUCTS}?limit=${limit}`)
  }

  static async getAllDashboardData(): Promise<{
    stats: DashboardStats
    inventory: InventorySummary
    sales: SalesData[]
    topProducts: TopProduct[]
  }> {
    try {
      const [stats, inventory, sales, topProducts] = await Promise.all([
        this.getStats(),
        this.getInventorySummary(),
        this.getSalesData({ days: 30 }),
        this.getTopProducts()
      ])

      return { stats, inventory, sales, topProducts }
    } catch (error) {
      Logger.error('Error fetching dashboard data:', error)
      throw error
    }
  }
}

export interface DashboardData {
  totalProducts: number
  totalCategories: number
  totalOrders: number
  totalRevenue: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: string
    customer: {
      name: string
    }
  }>
  lowStockProducts: Array<{
    id: string
    name: string
    stock: number
    sku: string
  }>
  topSellingProducts: Array<{
    id: string
    name: string
    totalSold: number
    revenue: number
  }>
}

export interface InventoryData {
  totalProducts: number
  totalValue: number
  lowStockProducts: Array<{
    id: string
    name: string
    stock: number
    price: number
    category: { name: string }
    brand: { name: string }
  }>
  outOfStockCount: number
  categoryStats: Array<{
    category: string
    totalProducts: number
    totalStock: number
    totalValue: number
  }>
}

export interface TopProduct {
  product: {
    id: string
    name: string
    image?: string
    price: number
    category: { name: string }
    brand: { name: string }
  }
  totalSold: number
  ordersCount: number
}

export interface SalesData {
  period: string
  totalSales: number
  salesRevenue: number
  averageOrderValue: number
  dailySales: Array<{
    date: string
    orders_count: number
    total_revenue: number
  }>
}

export interface DashboardStats extends DashboardData {}
export interface InventorySummary extends InventoryData {}
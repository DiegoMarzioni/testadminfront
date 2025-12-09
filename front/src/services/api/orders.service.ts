import { BaseApiService } from '../base.service'
import { 
  API_ENDPOINTS, 
  Order, 
  Customer, 
  CreateOrderRequest,
  UpdateOrderRequest,
  OrdersResponse,
  OrderHistory 
} from '@/types'

export class OrdersService extends BaseApiService {
  static async getOrders(page?: number, limit?: number): Promise<OrdersResponse> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())
    
    const endpoint = params.toString() 
      ? `${API_ENDPOINTS.ORDERS.BASE}?${params.toString()}`
      : API_ENDPOINTS.ORDERS.BASE
      
    return this.get<OrdersResponse>(endpoint)
  }

  static async getOrderById(id: number): Promise<Order> {
    return this.get<Order>(`${API_ENDPOINTS.ORDERS.BASE}/${id}`)
  }

  static async createOrder(data: CreateOrderRequest): Promise<Order> {
    return this.post<Order>(API_ENDPOINTS.ORDERS.BASE, data)
  }

  static async updateOrder(id: number, data: UpdateOrderRequest): Promise<Order> {
    return this.patch<Order>(`${API_ENDPOINTS.ORDERS.BASE}/${id}`, data)
  }

  static async updateOrderStatus(id: number, status: string): Promise<Order> {
    return this.patch<Order>(`${API_ENDPOINTS.ORDERS.BASE}/${id}`, { status })
  }

  static async deleteOrder(id: number): Promise<void> {
    return this.delete<void>(`${API_ENDPOINTS.ORDERS.BASE}/${id}`)
  }

  static async getOrderHistory(id: number): Promise<OrderHistory[]> {
    return this.get<OrderHistory[]>(`${API_ENDPOINTS.ORDERS.BASE}/${id}/history`)
  }

  static async getAllCustomers(): Promise<Customer[]> {
    return this.get<Customer[]>(API_ENDPOINTS.ORDERS.CUSTOMERS)
  }

  static async createCustomer(data: { name: string; email: string; phone?: string; address?: string }): Promise<Customer> {
    return this.post<Customer>('/orders/customers', data)
  }
}
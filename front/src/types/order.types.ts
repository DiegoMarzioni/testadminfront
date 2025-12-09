import { Product } from './product.types'

export enum OrderStatus {
  PENDING = 'PENDING',
  EN_PREPARACION = 'EN_PREPARACION', 
  ENVIADO = 'ENVIADO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAGADO = 'PAGADO',
  FALLIDO = 'FALLIDO',
}

export enum PaymentMethod {
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  TRANSFERENCIA_INTERNA = 'TRANSFERENCIA_INTERNA',
  EFECTIVO = 'EFECTIVO',
}

export interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export interface OrderUser {
  id: number
  name: string
  email: string
  role: string
}

export interface OrderItem {
  productId: number
  product: Product
  quantity: number
  price: number
}

export interface OrderHistory {
  id: number
  orderId: number
  action: string
  previousValue?: string
  newValue?: string
  notes?: string
  adminId?: number
  adminName?: string
  createdAt: string
}

export interface Order {
  id: number
  orderNumber?: string
  customerId: number
  customer: Customer
  buyerId?: number
  buyer?: OrderUser
  sellerId?: number
  seller?: OrderUser
  items: OrderItem[]
  total: number  
  subtotal?: number
  tax?: number
  shipping?: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  shippingAddress?: string
  trackingNumber?: string
  notes?: string
  adminId?: number
  orderDate: string
  createdAt: string
  updatedAt: string
  history?: OrderHistory[]
}

export interface CreateOrderRequest {
  customerId: number
  items: Array<{
    productId: number
    quantity: number
    price: number
  }>
  paymentMethod?: PaymentMethod
  shippingAddress?: string
  notes?: string
  tax?: number
  shipping?: number
}

export interface UpdateOrderRequest {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
  shippingAddress?: string
  trackingNumber?: string
  notes?: string
}

export interface OrdersResponse {
  data: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
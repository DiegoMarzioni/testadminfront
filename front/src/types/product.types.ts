export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  sku: string
  image?: string | null
  status: string
  brand: Brand
  category: Category
  createdAt: string
}

export interface Category {
  id: number
  name: string
  description: string | null
  position: number
  parent: Category | null
  children: Category[]
  products: Product[]
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: number
  name: string
  description?: string | null
  createdAt: string
}

export interface CreateProductData {
  name: string
  description?: string
  price: number
  stock: number
  categoryId: number | string
  brandId: number | string
  status?: string
  image?: string
}

export interface ProductFormData {
  name: string
  description: string
  price: number | string
  stock: number | string
  categoryId: string
  brandId: string
  status: string
  image?: string
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id?: number
}

export interface CreateCategoryData {
  name: string;
  parentId?: string;
  
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  
}
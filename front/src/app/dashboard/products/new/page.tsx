'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Package, Upload, X, Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Category, Brand, CreateProductData, ProductFormData } from '@/types'
import { ProductsService, CategoriesService, BrandsService } from '@/services/api'
import { Logger } from '@/lib/logger'

const ProductSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre es requerido'),
  description: Yup.string()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  price: Yup.number()
    .positive('El precio debe ser mayor a 0')
    .required('El precio es requerido'),
  stock: Yup.number()
    .integer('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser menor a 0')
    .required('El stock es requerido'),
  categoryId: Yup.string()
    .required('Debe seleccionar una categoría')
    .min(1, 'Debe seleccionar una categoría válida'),
  brandId: Yup.string()
    .required('Debe seleccionar una marca')
    .min(1, 'Debe seleccionar una marca válida'),
  status: Yup.string()
    .oneOf(['ACTIVE', 'INACTIVE', 'DRAFT'], 'Estado inválido')
    .required('Debe seleccionar un estado'),
})

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()

  const initialValues: ProductFormData = {
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    brandId: '',
    status: 'ACTIVE',
    image: ''
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        
        const categoriesData = await CategoriesService.getCategories()
        Logger.debug('Categories loaded:', categoriesData)
        setCategories(categoriesData)

        const brandsData = await BrandsService.getBrands()
        Logger.debug('Brands loaded:', brandsData)
        setBrands(brandsData)
        
      } catch (error) {
        Logger.error('Error fetching data:', error)
        toast.error('Error al cargar categorías y marcas')
      }
    }

    fetchData()
  }, [router])

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'tennis_star_preset')
    
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error('Cloudinary cloud name not configured')
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        setImagePreview(data.secure_url)
        return data.secure_url
      } else {
        throw new Error(data.error?.message || 'Error uploading image')
      }
    } catch (error) {
      Logger.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (values: ProductFormData, { setSubmitting }: any) => {
    const token = localStorage.getItem('token')
    
    try {
      Logger.debug('Form values:', values)
      
      const productData = {
        name: values.name,
        description: values.description,
        price: parseFloat(values.price as string),
        stock: parseInt(values.stock as string),
        categoryId: values.categoryId, 
        brandId: values.brandId, 
        status: values.status,
        image: values.image || null,
      }

      Logger.debug('Product data after conversion:', productData)

      const response = await ProductsService.createProduct(productData as CreateProductData)
      
      toast.success('Producto creado exitosamente')
      router.push('/dashboard/products')
      
    } catch (error: any) {
      Logger.error('Error creating product:', error)
      toast.error(error.message || 'Error al crear el producto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Nuevo Producto
            </h1>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={ProductSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, values }) => (
            <Form className="space-y-6">
              {}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre del Producto *
                </label>
                <Field
                  name="name"
                  type="text"
                  placeholder="Ej: Raqueta Wilson Pro Staff"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              {}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows="4"
                  placeholder="Descripción detallada del producto..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
                <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              {}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                  <Field
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <ErrorMessage name="price" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              {}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-2">
                  Stock Total *
                </label>
                <Field
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <ErrorMessage name="stock" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {}
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 mb-2">
                    Categoría *
                  </label>
                  <Field
                    as="select"
                    name="categoryId"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="categoryId" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                {}
                <div>
                  <label htmlFor="brandId" className="block text-sm font-medium text-slate-700 mb-2">
                    Marca *
                  </label>
                  <Field
                    as="select"
                    name="brandId"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="brandId" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              {}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                  Estado *
                </label>
                <Field
                  as="select"
                  name="status"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="DRAFT">Borrador</option>
                </Field>
                <ErrorMessage name="status" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Imagen del Producto
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setFieldValue('image', '')
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-slate-600">
                          Arrastra una imagen aquí o 
                          <label className="mx-1 text-blue-600 hover:text-blue-500 cursor-pointer">
                            selecciona un archivo
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const imageUrl = await handleImageUpload(file)
                                  if (imageUrl) {
                                    setFieldValue('image', imageUrl)
                                  }
                                }
                              }}
                            />
                          </label>
                        </p>
                        <p className="text-sm text-slate-500">
                          PNG, JPG, WEBP hasta 10MB
                        </p>
                      </div>
                    </div>
                  )}
                  {uploading && (
                    <div className="mt-4 text-center">
                      <div className="inline-flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Subiendo imagen...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {}
              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar Producto'}</span>
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
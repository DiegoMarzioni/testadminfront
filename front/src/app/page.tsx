'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Shield, BarChart3, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239fa6b2' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-6 shadow-xl border border-slate-200">
                <Image
                  src="https://res.cloudinary.com/dvwpxy4kh/image/upload/v1765300390/logotipo_vch7xl.png"
                  alt="Tennis Star Logo"
                  width={120}
                  height={120}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-slate-600 font-medium">
              Panel Administrativo
            </p>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
              Gestiona tu negocio de manera eficiente con nuestro sistema administrativo completo
            </p>
          </div>

          {}
          <div className="grid md:grid-cols-3 gap-6 my-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Seguro</h3>
              <p className="text-slate-600 text-sm">
                Sistema de autenticación robusto y datos protegidos
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics</h3>
              <p className="text-slate-600 text-sm">
                Reportes detallados y métricas en tiempo real
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Gestión</h3>
              <p className="text-slate-600 text-sm">
                Control total de productos, ventas y categorías
              </p>
            </div>
          </div>

          {}
          <div className="space-y-6">
            <Link 
              href="/login"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <span>Acceder al Panel</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <p className="text-sm text-slate-500">
              ¿Necesitas una cuenta? 
              <Link 
                href="/register" 
                className="ml-1 text-blue-600 hover:text-blue-500 font-medium transition-colors underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Logger } from '@/lib/logger'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Tag, 
  Package, 
  ShoppingCart, 
  FileText, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  Menu,
  X,
  BarChart3,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { logout, user } = useAuth()

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      }
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)

    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const menuItems = [
    {
      label: 'Panel Principal',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      label: 'Categorías',
      icon: FolderOpen,
      path: '/dashboard/categories'
    },
    {
      label: 'Marcas',
      icon: Tag,
      path: '/dashboard/brands'
    },
    {
      label: 'Productos',
      icon: Package,
      path: '/dashboard/products'
    },
    {
      label: 'Órdenes',
      icon: ShoppingCart,
      path: '/dashboard/orders'
    },
    {
      label: 'Ventas',
      icon: DollarSign,
      path: '/dashboard/sales'
    },
    {
      label: 'Ganancias',
      icon: BarChart3,
      path: '/dashboard/earnings'
    },
    {
      label: 'Estadísticas',
      icon: TrendingUp,
      path: '/dashboard/statistics'
    },
  ]

  const handleLogout = async () => {
    try {
      Logger.info('Iniciando logout')
      await logout()
      toast.success('Sesión cerrada exitosamente')
      router.push('/login')
    } catch (error) {
      Logger.error('Error en logout:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  const handleNavigation = (path: string) => {
    if (isMobile) {
      setMobileMenuOpen(false)
    }
    router.push(path)
  }

  return (
    <>
      {isMobile && !mobileMenuOpen && (
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200 lg:hidden"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      )}
      <div className={`
        bg-white shadow-xl transition-all duration-300 flex flex-col border-r border-slate-200
        ${isMobile ? `fixed left-0 top-0 h-full z-40 w-64 transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }` : collapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {(!collapsed || isMobile) && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">TechGear</h2>
                  <p className="text-xs text-slate-500">Admin Panel</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {isMobile ? (
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              ) : (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {collapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = item.path === '/dashboard' 
                ? pathname === '/dashboard'
                : pathname === item.path || pathname.startsWith(item.path + '/')
              const IconComponent = item.icon
              
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 text-left transition-all duration-200 rounded-lg group ${
                      isActive
                        ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <IconComponent className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive 
                        ? 'text-blue-600' 
                        : 'text-slate-500 group-hover:text-slate-700'
                    }`} />
                    {(!collapsed || isMobile) && (
                      <span className="font-medium text-sm truncate">{item.label}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors rounded-lg group ${
              collapsed && !isMobile ? 'justify-center' : ''
            }`}
            title={collapsed && !isMobile ? 'Cerrar Sesión' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="font-medium text-sm">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
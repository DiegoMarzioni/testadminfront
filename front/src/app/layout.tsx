import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'
import { AdminProvider } from '@/context/AdminContext'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'TechGear',
  description: 'Panel administrativo para gestión de ecommerce',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <AuthProvider>
          <AdminProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
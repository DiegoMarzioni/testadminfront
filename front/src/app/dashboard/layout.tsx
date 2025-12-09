'use client'

import Sidebar from '@/components/Sidebar'
import Breadcrumbs from '@/components/Breadcrumbs'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-3 sm:p-4 lg:p-6 min-h-full bg-slate-50 pt-16 lg:pt-3">
            <div className="mb-4">
              <Breadcrumbs />
            </div>
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
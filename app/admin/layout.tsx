'use client'
import AdminSidebar from '@/components/admin-sidebar'
import AdminHeader from '@/components/admin-header'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-gray-900 text-white flex font-sans overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Profile */}
        <AdminHeader />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

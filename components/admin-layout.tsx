import React from 'react'
import { useRouter } from 'next/router'
import DynamicSidebar from '../components/dynamic-sidebar'
import PermissionGuard from '../components/permission-guard'
import { PERMISSIONS } from '../lib/use-permissions'

interface AdminLayoutProps {
  children: React.ReactNode
  roleId: string
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, roleId }) => {
  const router = useRouter()

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <DynamicSidebar roleId={roleId} currentPath={router.pathname} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {getPageTitle(router.pathname)}
            </h2>
            <div className="flex items-center space-x-4">
              {/* Example: Show create button only if user has permission for current module */}
              <PermissionGuard moduleId={getCurrentModuleId(router.pathname)}>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create New
                </button>
              </PermissionGuard>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// Example page component with permission protection
const AlbumsPage: React.FC<{ roleId: string }> = ({ roleId }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Album Management</h3>
        
        {/* Show different content based on permissions */}
        <PermissionGuard moduleId={2}>
          <div className="mb-4">
            <p>Album list will be displayed here...</p>
          </div>
        </PermissionGuard>

        <div className="flex space-x-2">
          <PermissionGuard moduleId={2}>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Add Album
            </button>
          </PermissionGuard>

          <PermissionGuard moduleId={2}>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
              Edit Album
            </button>
          </PermissionGuard>

          <PermissionGuard moduleId={2}>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Delete Album
            </button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/albums': 'Albums',
    '/admin/albums/add': 'Add Album',
    '/admin/enquiries': 'Enquiries',
    '/admin/users': 'Users',
    '/admin/users/roles': 'User Roles',
    '/admin/users/access': 'Access Privileges',
    '/admin/action-logs': 'Action Logs'
  }
  return titles[pathname] || 'Dashboard'
}

function getCurrentModuleId(pathname: string): number {
  const moduleMap: Record<string, number> = {
    '/admin': 1,
    '/admin/albums': 2,
    '/admin/albums/add': 2,
    '/admin/enquiries': 3,
    '/admin/users': 4,
    '/admin/users/roles': 4,
    '/admin/users/access': 4,
    '/admin/action-logs': 5
  }
  return moduleMap[pathname] || 1
}

export { AlbumsPage }
export default AdminLayout
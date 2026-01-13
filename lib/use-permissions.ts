import { useState, useEffect } from 'react'

interface Permission {
  id: number
  name: string
}

interface SubModule {
  id: number
  name: string
  is_sub_module: boolean
  permissions: number[]
  icon?: string
  url?: string
}

interface ModuleInfo {
  id: number
  name: string
  is_sub_module: boolean
  permissions: number[]
  icon?: string
  url?: string
}

interface RolePermission {
  role_id: string
  module_info: ModuleInfo
  sub_module_info: SubModule[]
}

interface UsePermissionsReturn {
  permissions: RolePermission[]
  loading: boolean
  error: string | null
  hasPermission: (moduleId: number, permissionId: number) => boolean
  refetch: () => void
}

export const usePermissions = (roleId: string): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = async () => {
    if (!roleId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/permissions/menu/${roleId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPermissions(data.data || [])
      } else {
        throw new Error(data.message || 'Failed to fetch permissions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching permissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (moduleId: number, permissionId: number): boolean => {
    for (const rolePermission of permissions) {
      // Check main module
      if (rolePermission.module_info.id === moduleId) {
        return rolePermission.module_info.permissions.includes(permissionId)
      }
      
      // Check sub-modules
      for (const subModule of rolePermission.sub_module_info) {
        if (subModule.id === moduleId) {
          return subModule.permissions.includes(permissionId)
        }
      }
    }
    return false
  }

  useEffect(() => {
    fetchPermissions()
  }, [roleId])

  return {
    permissions,
    loading,
    error,
    hasPermission,
    refetch: fetchPermissions
  }
}

// Permission constants
export const PERMISSIONS = {
  READ: 1,
  CREATE: 2,
  UPDATE: 3,
  DELETE: 4
} as const

export type PermissionType = typeof PERMISSIONS[keyof typeof PERMISSIONS]
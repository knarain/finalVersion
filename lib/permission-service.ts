// lib/permission-service.ts

import { API_BASE_URL } from './constants'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Role {
  id: number
  name: string
  description?: string
  is_active: number
  created_at?: string
  updated_at?: string
}

export interface Module {
  id: number
  name: string
  slug: string
  parent_id?: number
  is_sub_module: number
  icon?: string
  order: number
  sub_modules?: Module[]
  created_at?: string
  updated_at?: string
}

export interface Permission {
  id: number
  name: string
  slug: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface AdminUser {
  id: number
  username: string
  email: string
  role_id?: number
  role_name?: string
  is_active: number
  two_factor_enabled: number
  created_at?: string
  updated_at?: string
}

export interface PermissionAssignment {
  role_id: number
  module_id: number
  permission_ids: number[]
}

export interface PermissionStructure {
  roles: Role[]
  modules: Module[]
  permissions: Permission[]
  assigned: Record<number, Record<number, number[]>>
}

export interface PaginatedAdmins {
  users: AdminUser[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface ApiResponse<T> {
  status: string
  message: string
  data: T | null
  code: number
}

// ============================================
// ROLE SERVICE
// ============================================

export async function getRoles(token?: string): Promise<Role[]> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error('Failed to fetch roles')
    const data: ApiResponse<Role[]> = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching roles:', error)
    throw error
  }
}

export async function getActiveRoles(token?: string): Promise<Role[]> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/roles/status/active`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error('Failed to fetch active roles')
    const data: ApiResponse<Role[]> = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching active roles:', error)
    throw error
  }
}

export async function getRoleById(roleId: number, token?: string): Promise<Role> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error('Failed to fetch role')
    const data: ApiResponse<Role> = await response.json()
    return data.data as Role
  } catch (error) {
    console.error('Error fetching role:', error)
    throw error
  }
}

export async function createRole(
  role: Partial<Role>,
  token?: string
): Promise<Role> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(role),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create role')
    }
    const data: ApiResponse<Role> = await response.json()
    return data.data as Role
  } catch (error) {
    console.error('Error creating role:', error)
    throw error
  }
}

export async function updateRole(
  roleId: number,
  role: Partial<Role>,
  token?: string
): Promise<Role> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(role),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update role')
    }
    const data: ApiResponse<Role> = await response.json()
    return data.data as Role
  } catch (error) {
    console.error('Error updating role:', error)
    throw error
  }
}

export async function deleteRole(roleId: number, token?: string): Promise<void> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete role')
    }
  } catch (error) {
    console.error('Error deleting role:', error)
    throw error
  }
}

export async function toggleRoleStatus(
  roleId: number,
  token?: string
): Promise<Role> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/roles/${roleId}/toggle-status`, {
      method: 'PATCH',
      headers,
    })

    if (!response.ok) throw new Error('Failed to toggle role status')
    const data: ApiResponse<Role> = await response.json()
    return data.data as Role
  } catch (error) {
    console.error('Error toggling role status:', error)
    throw error
  }
}

// ============================================
// USER SERVICE
// ============================================

export async function getUsers(
  page: number = 1,
  perPage: number = 10,
  token?: string
): Promise<PaginatedAdmins> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(
      `${API_BASE_URL}/users?page=${page}&per_page=${perPage}`,
      {
        method: 'GET',
        headers,
      }
    )

    if (!response.ok) throw new Error('Failed to fetch users')
    const data: ApiResponse<PaginatedAdmins> = await response.json()
    return data.data as PaginatedAdmins
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export async function getActiveUsers(token?: string): Promise<AdminUser[]> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/users/status/active`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error('Failed to fetch active users')
    const data: ApiResponse<AdminUser[]> = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching active users:', error)
    throw error
  }
}

export async function getUserById(userId: number, token?: string): Promise<AdminUser> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error('Failed to fetch user')
    const data: ApiResponse<AdminUser> = await response.json()
    return data.data as AdminUser
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function createUser(
  user: Partial<AdminUser> & { password: string },
  token?: string
): Promise<AdminUser> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(user),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create user')
    }
    const data: ApiResponse<AdminUser> = await response.json()
    return data.data as AdminUser
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function updateUser(
  userId: number,
  user: Partial<AdminUser>,
  token?: string
): Promise<AdminUser> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(user),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update user')
    }
    const data: ApiResponse<AdminUser> = await response.json()
    return data.data as AdminUser
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export async function deleteUser(userId: number, token?: string): Promise<void> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete user')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

export async function changeUserPassword(
  userId: number,
  oldPassword: string,
  newPassword: string,
  token?: string
): Promise<void> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/users/${userId}/change-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to change password')
    }
  } catch (error) {
    console.error('Error changing password:', error)
    throw error
  }
}

export async function resetUserPassword(
  userId: number,
  newPassword: string,
  token?: string
): Promise<void> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        new_password: newPassword,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to reset password')
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
}

export async function assignRoleToUser(
  userId: number,
  roleId: number,
  token?: string
): Promise<AdminUser> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/users/${userId}/assign-role`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role_id: roleId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to assign role')
    }
    const data: ApiResponse<AdminUser> = await response.json()
    return data.data as AdminUser
  } catch (error) {
    console.error('Error assigning role:', error)
    throw error
  }
}

export async function toggleUserStatus(userId: number, token?: string): Promise<AdminUser> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/users/${userId}/toggle-status`, {
      method: 'PATCH',
      headers,
    })

    if (!response.ok) throw new Error('Failed to toggle user status')
    const data: ApiResponse<AdminUser> = await response.json()
    return data.data as AdminUser
  } catch (error) {
    console.error('Error toggling user status:', error)
    throw error
  }
}

// ============================================
// PERMISSION SERVICE
// ============================================

export async function getPermissionStructure(
  token?: string
): Promise<PermissionStructure> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error('Failed to fetch permissions')
    const data: ApiResponse<PermissionStructure> = await response.json()
    return data.data as PermissionStructure
  } catch (error) {
    console.error('Error fetching permissions:', error)
    throw error
  }
}

export async function getRolePermissions(
  roleId: number,
  token?: string
): Promise<any> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/permissions/role/${roleId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) throw new Error('Failed to fetch role permissions')
    const data: ApiResponse<any> = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching role permissions:', error)
    throw error
  }
}

export async function assignPermissionsToRole(
  roleId: number,
  moduleId: number,
  permissionIds: number[],
  token?: string
): Promise<void> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/permissions/assign`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        role_id: roleId,
        module_id: moduleId,
        permission_ids: permissionIds,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to assign permissions')
    }
  } catch (error) {
    console.error('Error assigning permissions:', error)
    throw error
  }
}

export async function assignPermissionsBulk(
  roleId: number,
  assignments: PermissionAssignment[],
  token?: string
): Promise<void> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/permissions/assign-bulk`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        role_id: roleId,
        assignments,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to assign permissions')
    }
  } catch (error) {
    console.error('Error bulk assigning permissions:', error)
    throw error
  }
}

export async function removePermission(
  roleId: number,
  moduleId: number,
  permissionId: number,
  token?: string
): Promise<void> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(
      `${API_BASE_URL}/permissions/${roleId}/${moduleId}/${permissionId}`,
      {
        method: 'DELETE',
        headers,
      }
    )

    if (!response.ok) throw new Error('Failed to remove permission')
  } catch (error) {
    console.error('Error removing permission:', error)
    throw error
  }
}

export async function checkPermission(
  roleId: number,
  moduleId: number,
  permissionId: number,
  token?: string
): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_BASE_URL}/permissions/check`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        role_id: roleId,
        module_id: moduleId,
        permission_id: permissionId,
      }),
    })

    if (!response.ok) return false
    const data: ApiResponse<{ has_permission: boolean }> = await response.json()
    return data.data?.has_permission || false
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

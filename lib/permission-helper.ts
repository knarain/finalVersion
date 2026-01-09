import { MODULES, PERMISSIONS } from './constants'

/**
 * Permission checking helper functions for frontend
 * These functions help check if a user has specific permissions
 */

export interface UserPermissions {
  modules: Record<
    number,
    {
      name: string
      permissions: number[]
    }
  >
}

/**
 * Check if user has specific permission for a module
 * @param permissions User's permission structure
 * @param moduleId Module ID to check
 * @param permissionId Permission ID to check
 * @returns true if user has the permission
 */
export function hasPermission(
  permissions: UserPermissions | null | undefined,
  moduleId: number,
  permissionId: number
): boolean {
  if (!permissions || !permissions.modules) return false
  const modulePerms = permissions.modules[moduleId]
  if (!modulePerms) return false
  return modulePerms.permissions.includes(permissionId)
}

/**
 * Check if user can create in a specific module
 */
export function canCreate(
  permissions: UserPermissions | null | undefined,
  moduleId: number
): boolean {
  return hasPermission(permissions, moduleId, PERMISSIONS.CREATE)
}

/**
 * Check if user can read/view a specific module
 */
export function canRead(
  permissions: UserPermissions | null | undefined,
  moduleId: number
): boolean {
  return hasPermission(permissions, moduleId, PERMISSIONS.READ)
}

/**
 * Check if user can update in a specific module
 */
export function canUpdate(
  permissions: UserPermissions | null | undefined,
  moduleId: number
): boolean {
  return hasPermission(permissions, moduleId, PERMISSIONS.UPDATE)
}

/**
 * Check if user can delete in a specific module
 */
export function canDelete(
  permissions: UserPermissions | null | undefined,
  moduleId: number
): boolean {
  return hasPermission(permissions, moduleId, PERMISSIONS.DELETE)
}

/**
 * Check if user has any permissions in a module
 */
export function hasModuleAccess(
  permissions: UserPermissions | null | undefined,
  moduleId: number
): boolean {
  if (!permissions || !permissions.modules) return false
  return !!permissions.modules[moduleId]
}

/**
 * Check if user has all specified permissions for a module
 */
export function hasAllPermissions(
  permissions: UserPermissions | null | undefined,
  moduleId: number,
  permissionIds: number[]
): boolean {
  return permissionIds.every((pId) => hasPermission(permissions, moduleId, pId))
}

/**
 * Check if user has any of the specified permissions for a module
 */
export function hasAnyPermission(
  permissions: UserPermissions | null | undefined,
  moduleId: number,
  permissionIds: number[]
): boolean {
  return permissionIds.some((pId) => hasPermission(permissions, moduleId, pId))
}

/**
 * Get all permissions for a module
 */
export function getModulePermissions(
  permissions: UserPermissions | null | undefined,
  moduleId: number
): number[] {
  if (!permissions || !permissions.modules) return []
  return permissions.modules[moduleId]?.permissions || []
}

/**
 * Get all accessible modules
 */
export function getAccessibleModules(
  permissions: UserPermissions | null | undefined
): number[] {
  if (!permissions || !permissions.modules) return []
  return Object.keys(permissions.modules).map(Number)
}

/**
 * Get permission name from ID
 */
export function getPermissionName(permissionId: number): string {
  const names: Record<number, string> = {
    [PERMISSIONS.CREATE]: 'Create',
    [PERMISSIONS.READ]: 'Read',
    [PERMISSIONS.UPDATE]: 'Update',
    [PERMISSIONS.DELETE]: 'Delete',
  }
  return names[permissionId] || 'Unknown'
}

/**
 * Get module name from ID
 */
export function getModuleName(moduleId: number): string {
  const names: Record<number, string> = {
    [MODULES.DASHBOARD]: 'Dashboard',
    [MODULES.USERS]: 'Users',
    [MODULES.ROLES_PERMISSIONS]: 'Roles & Permissions',
    [MODULES.ALBUMS]: 'Albums',
    [MODULES.CATEGORIES]: 'Categories',
    [MODULES.ENQUIRIES]: 'Enquiries',
    [MODULES.SETTINGS]: 'Settings',
  }
  return names[moduleId] || 'Unknown'
}

/**
 * Generate summary of user permissions
 */
export function getPermissionsSummary(
  permissions: UserPermissions | null | undefined
): Record<string, number> {
  const summary: Record<string, number> = {
    modules: 0,
    totalPermissions: 0,
    create: 0,
    read: 0,
    update: 0,
    delete: 0,
  }

  if (!permissions || !permissions.modules) return summary

  Object.entries(permissions.modules).forEach(([_, modulePerms]) => {
    summary.modules++
    summary.totalPermissions += modulePerms.permissions.length

    modulePerms.permissions.forEach((pId) => {
      if (pId === PERMISSIONS.CREATE) summary.create++
      else if (pId === PERMISSIONS.READ) summary.read++
      else if (pId === PERMISSIONS.UPDATE) summary.update++
      else if (pId === PERMISSIONS.DELETE) summary.delete++
    })
  })

  return summary
}

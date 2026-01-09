// lib/constants.ts

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

// Module IDs (from database seeding)
export const MODULES = {
  DASHBOARD: 1,
  USERS: 2,
  ROLES_PERMISSIONS: 3,
  ALBUMS: 4,
  CATEGORIES: 5,
  ENQUIRIES: 6,
  SETTINGS: 7,
} as const

// Permission IDs (from database seeding)
export const PERMISSIONS = {
  CREATE: 1,
  READ: 2,
  UPDATE: 3,
  DELETE: 4,
} as const

// Permission slugs
export const PERMISSION_SLUGS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const

// Module slugs
export const MODULE_SLUGS = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  ROLES_PERMISSIONS: 'roles-permissions',
  ALBUMS: 'albums',
  CATEGORIES: 'categories',
  ENQUIRIES: 'enquiries',
  SETTINGS: 'settings',
} as const

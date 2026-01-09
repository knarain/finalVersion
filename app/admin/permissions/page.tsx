'use client'

import { useEffect, useState } from 'react'
import {
  getPermissionStructure,
  getRoles,
  Role,
  Module,
  Permission,
  PermissionStructure,
} from '@/lib/permission-service'
import Link from 'next/link'

export default function PermissionsPage() {
  const [data, setData] = useState<PermissionStructure | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedModule, setExpandedModule] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [permData, rolesData] = await Promise.all([
        getPermissionStructure(),
        getRoles(),
      ])
      setData(permData)
      setRoles(rolesData)
      setError('')
    } catch (err) {
      setError('Failed to load permissions data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getMainModules = () => {
    return data?.modules.filter((m) => m.is_sub_module === 0) || []
  }

  const getSubModules = (moduleId: number) => {
    return data?.modules.filter((m) => m.parent_id === moduleId) || []
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Permission Management</h1>
        <p className="text-gray-600">
          View system modules, permissions, and their assignments to roles
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded shadow">
              <div className="bg-gray-100 px-6 py-3 border-b">
                <h2 className="text-xl font-bold">System Modules</h2>
              </div>
              <div className="p-6">
                {getMainModules().length === 0 ? (
                  <p className="text-gray-500">No modules found</p>
                ) : (
                  <div className="space-y-3">
                    {getMainModules().map((module) => (
                      <div key={module.id}>
                        <button
                          onClick={() =>
                            setExpandedModule(
                              expandedModule === module.id ? null : module.id
                            )
                          }
                          className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded flex justify-between items-center"
                        >
                          <div>
                            <h3 className="font-semibold text-blue-900">
                              {module.name}
                            </h3>
                            <p className="text-sm text-blue-700">{module.slug}</p>
                          </div>
                          <span className="text-xl">
                            {expandedModule === module.id ? '▼' : '▶'}
                          </span>
                        </button>

                        {expandedModule === module.id && (
                          <div className="mt-2 ml-4 space-y-2">
                            {/* Permissions */}
                            <div className="p-3 bg-gray-50 rounded">
                              <h4 className="font-semibold text-gray-700 mb-2">
                                Permissions:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {data?.permissions.map((perm) => (
                                  <span
                                    key={perm.id}
                                    className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-sm"
                                  >
                                    {perm.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Sub-modules */}
                            {getSubModules(module.id).length > 0 && (
                              <div className="p-3 bg-gray-50 rounded">
                                <h4 className="font-semibold text-gray-700 mb-2">
                                  Sub-modules:
                                </h4>
                                <ul className="space-y-1">
                                  {getSubModules(module.id).map((submodule) => (
                                    <li key={submodule.id} className="text-gray-700">
                                      <span className="font-medium">
                                        {submodule.name}
                                      </span>{' '}
                                      <span className="text-gray-500">
                                        ({submodule.slug})
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Roles Section */}
          <div>
            <div className="bg-white rounded shadow">
              <div className="bg-gray-100 px-6 py-3 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Roles ({roles.length})</h2>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {roles.length === 0 ? (
                    <p className="text-gray-500">No roles found</p>
                  ) : (
                    roles.map((role) => (
                      <Link
                        key={role.id}
                        href={`/admin/roles/${role.id}/permissions`}
                        className="block p-3 bg-green-50 hover:bg-green-100 rounded border border-green-200"
                      >
                        <h4 className="font-semibold text-green-900">
                          {role.name}
                        </h4>
                        <p className="text-sm text-green-700">
                          {role.description || 'No description'}
                        </p>
                        <p className="text-xs text-green-600 mt-2">
                          {role.is_active ? '✓ Active' : '✗ Inactive'}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
                <Link
                  href="/admin/roles"
                  className="mt-4 block text-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Manage Roles
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reference */}
      {!loading && data && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Quick Reference</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Modules</p>
              <p className="text-2xl font-bold text-blue-600">
                {getMainModules().length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Permissions</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.permissions.length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Modules</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.modules.length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Roles</p>
              <p className="text-2xl font-bold text-blue-600">{roles.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

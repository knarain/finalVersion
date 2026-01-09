'use client'

import { useEffect, useState } from 'react'
import {
  getPermissionStructure,
  getRoles,
  Role,
  PermissionStructure,
} from '@/lib/permission-service'
import { getPermissionsSummary } from '@/lib/permission-helper'

export default function PermissionSettingsPage() {
  const [permData, setPermData] = useState<PermissionStructure | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const [permStructure, rolesData] = await Promise.all([
        getPermissionStructure(token || undefined),
        getRoles(token || undefined),
      ])
      setPermData(permStructure)
      setRoles(rolesData)
      if (rolesData.length > 0) {
        setSelectedRole(rolesData[0].id)
      }
      setError('')
    } catch (err) {
      setError('Failed to load permission settings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getMainModules = () => {
    return permData?.modules.filter((m) => m.is_sub_module === 0) || []
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Permission Settings</h1>
        <p className="text-gray-600">
          Detailed permission structure and role configuration
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Overview Cards */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Modules</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {getMainModules().length}
            </p>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Permissions</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {permData?.permissions.length || 0}
            </p>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">All Modules</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {permData?.modules.length || 0}
            </p>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Roles</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{roles.length}</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Modules & Permissions Detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded shadow overflow-hidden">
              <div className="bg-gray-100 px-6 py-3 border-b">
                <h2 className="text-xl font-bold">System Structure</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {getMainModules().map((module) => (
                    <div
                      key={module.id}
                      className="border border-gray-200 rounded p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">
                            {module.name}
                          </h4>
                          <p className="text-sm text-gray-500">{module.slug}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          ID: {module.id}
                        </span>
                      </div>

                      {/* Permissions */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Standard Permissions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {permData?.permissions.map((perm) => (
                            <span
                              key={perm.id}
                              className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm"
                            >
                              {perm.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Sub-modules */}
                      {(permData?.modules || []).filter((m) => m.parent_id === module.id)
                        .length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Sub-modules:
                          </p>
                          <ul className="text-sm space-y-1 ml-4">
                            {permData?.modules
                              .filter((m) => m.parent_id === module.id)
                              .map((submodule) => (
                                <li key={submodule.id} className="text-gray-600">
                                  <span className="font-medium">
                                    {submodule.name}
                                  </span>{' '}
                                  <span className="text-gray-400">
                                    ({submodule.slug})
                                  </span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Roles Overview */}
          <div>
            <div className="bg-white rounded shadow overflow-hidden">
              <div className="bg-gray-100 px-6 py-3 border-b">
                <h2 className="text-xl font-bold">Roles Overview</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`p-4 rounded border-2 ${
                        role.is_active
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900">
                        {role.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {role.description || 'No description'}
                      </p>
                      <div className="mt-3 flex justify-between items-center">
                        <span
                          className={`text-xs font-semibold ${
                            role.is_active
                              ? 'text-green-700'
                              : 'text-gray-500'
                          }`}
                        >
                          {role.is_active ? '✓ Active' : '✗ Inactive'}
                        </span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          ID: {role.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documentation */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-6">
        <h3 className="font-semibold text-blue-900 mb-4">Permission System Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-900">
          <div>
            <h4 className="font-semibold mb-2">Available Permissions</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Create:</strong> User can create new records
              </li>
              <li>
                <strong>Read:</strong> User can view records
              </li>
              <li>
                <strong>Update:</strong> User can edit existing records
              </li>
              <li>
                <strong>Delete:</strong> User can remove records
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How It Works</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Create roles in the system</li>
              <li>Assign specific permissions to roles</li>
              <li>Assign roles to admin users</li>
              <li>Users inherit permissions from their assigned role</li>
              <li>Permissions control access across all modules</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

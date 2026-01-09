'use client'

import { useEffect, useState } from 'react'
import { getRoleById, getPermissionStructure, assignPermissionsBulk, Role, Module, Permission } from '@/lib/permission-service'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function RolePermissionsPage() {
  const params = useParams()
  const roleId = Number(params.id)

  const [role, setRole] = useState<Role | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<Record<number, number[]>>({})

  useEffect(() => {
    loadData()
  }, [roleId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [roleData, permData] = await Promise.all([
        getRoleById(roleId),
        getPermissionStructure(),
      ])

      setRole(roleData)
      setModules(permData.modules)
      setPermissions(permData.permissions)

      // Initialize selected permissions for this role
      const selected: Record<number, number[]> = {}
      for (const moduleId in permData.assigned[roleId] || {}) {
        selected[Number(moduleId)] = permData.assigned[roleId][Number(moduleId)] || []
      }
      setSelectedPermissions(selected)
      setError('')
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (moduleId: number, permissionId: number) => {
    setSelectedPermissions((prev) => {
      const current = prev[moduleId] || []
      const updated = current.includes(permissionId)
        ? current.filter((p) => p !== permissionId)
        : [...current, permissionId]

      return {
        ...prev,
        [moduleId]: updated,
      }
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const assignments = Object.entries(selectedPermissions).map(([moduleId, permissionIds]) => ({
        role_id: roleId,
        module_id: Number(moduleId),
        permission_ids: permissionIds,
      }))

      await assignPermissionsBulk(roleId, assignments)
      setError('')
      alert('Permissions saved successfully!')
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving permissions')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{role?.name} - Permissions</h1>
        <Link href="/admin/roles" className="text-blue-600 hover:text-blue-800">
          ← Back to Roles
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Assign Permissions to Modules</h2>
          <p className="text-gray-600 text-sm mb-4">Check the boxes to grant permissions for each module</p>
        </div>

        <div className="space-y-6">
          {modules
            .filter((m) => !m.is_sub_module) // Show only main modules
            .map((module) => (
              <div key={module.id} className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-medium mb-3">{module.name}</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {permissions.map((permission) => (
                    <label key={permission.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(selectedPermissions[module.id] || []).includes(permission.id)}
                        onChange={() => togglePermission(module.id, permission.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
          <Link href="/admin/roles" className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}

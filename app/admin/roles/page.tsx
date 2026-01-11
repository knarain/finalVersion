'use client'

import { useEffect, useState } from 'react'
import { getRoles, createRole, updateRole, deleteRole, toggleRoleStatus, Role } from '@/lib/permission-service'
import { getPermissionStructure } from '@/lib/permission-service'
import Link from 'next/link'

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      const data = await getRoles(token || undefined)
      setRoles(data)
      setError('')
    } catch (err) {
      setError('Failed to load roles')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      if (editingId) {
        await updateRole(editingId, formData, token || undefined)
      } else {
        await createRole(formData, token || undefined)
      }
      setFormData({ name: '', description: '' })
      setEditingId(null)
      setShowForm(false)
      loadRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving role')
    }
  }

  const handleEdit = (role: Role) => {
    setFormData({ name: role.name, description: role.description || '' })
    setEditingId(role.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      await deleteRole(id, token || undefined)
      loadRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting role')
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      await toggleRoleStatus(id, token || undefined)
      loadRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error toggling status')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Roles Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: '', description: '' })
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Create Role'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              placeholder="e.g., Editor"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              placeholder="Role description"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {editingId ? 'Update Role' : 'Create Role'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{role.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{role.description || '-'}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        role.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {role.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <Link
                      href={`/admin/roles/${role.id}/permissions`}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Permissions
                    </Link>
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-orange-600 hover:text-orange-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(role.id)}
                      className="text-yellow-600 hover:text-yellow-800 mr-3"
                    >
                      {role.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

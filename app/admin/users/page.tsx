'use client'

import { useEffect, useState } from 'react'
import {
  getUsers,
  getActiveRoles,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  AdminUser,
  Role,
  PaginatedAdmins,
} from '@/lib/permission-service'
import Link from 'next/link'

export default function UsersPage() {
  const [data, setData] = useState<PaginatedAdmins | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
  })

  useEffect(() => {
    loadData()
  }, [currentPage])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      const [usersData, rolesData] = await Promise.all([
        getUsers(currentPage, 10, token || undefined),
        getActiveRoles(token || undefined),
      ])
      setData(usersData)
      setRoles(rolesData)
      setError('')
    } catch (err) {
      setError('Failed to load data')
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
        const updateData: any = {
          email: formData.email,
        }
        if (formData.role_id) updateData.role_id = Number(formData.role_id)
        await updateUser(editingId, updateData, token || undefined)
      } else {
        if (!formData.password) {
          setError('Password is required for new users')
          return
        }
        await createUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role_id: formData.role_id ? Number(formData.role_id) : undefined,
        }, token || undefined)
      }
      resetForm()
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving user')
    }
  }

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '', role_id: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (user: AdminUser) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role_id: user.role_id?.toString() || '',
    })
    setEditingId(user.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      await deleteUser(id, token || undefined)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting user')
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      await toggleUserStatus(id, token || undefined)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error toggling status')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Users</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            if (!showForm) resetForm()
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Create User'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required={!editingId}
                disabled={!!editingId}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                placeholder="Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {editingId ? 'New Password (leave empty to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingId}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                placeholder="Password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {editingId ? 'Update User' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Username</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{user.username}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-3 text-sm">{user.role_name || '-'}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-orange-600 hover:text-orange-800 mr-3"
                      >
                        Edit
                      </button>
                      <Link
                        href={`/admin/users/${user.id}/roles`}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Role
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/password`}
                        className="text-purple-600 hover:text-purple-800 mr-3"
                      >
                        Password
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="text-yellow-600 hover:text-yellow-800 mr-3"
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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

          {data && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing page {data.pagination.page} of {data.pagination.total_pages} ({data.pagination.total} total users)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-100"
                >
                  Previous
                </button>
                {Array.from({ length: data.pagination.total_pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(data.pagination.total_pages, p + 1))}
                  disabled={currentPage === data.pagination.total_pages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

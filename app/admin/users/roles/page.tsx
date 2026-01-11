'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, Edit2 } from 'lucide-react'

interface Role {
  id: number
  name: string
  description: string
  is_active: boolean
  created_at: string
}

export default function UserRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRoles(res.data.results || [])
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('adminToken')
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/roles`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuccess('Role created successfully')
      setFormData({ name: '', description: '' })
      setShowModal(false)
      fetchRoles()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create role')
    }
  }

  const handleDeleteRole = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('Role deleted successfully')
      fetchRoles()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete role')
    }
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">User Roles</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Add Role
        </button>
      </div>

      {error && <div className="bg-red-900 text-red-200 p-4 rounded mb-4 border border-red-700">{error}</div>}
      {success && <div className="bg-green-900 text-green-200 p-4 rounded mb-4 border border-green-700">{success}</div>}

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Role Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Description</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role, idx) => (
              <tr key={role.id} className={`border-b border-gray-700 hover:bg-gray-750 transition ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                <td className="px-6 py-4 font-medium text-gray-200">{role.name}</td>
                <td className="px-6 py-4 text-gray-400">{role.description || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${role.is_active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button className="text-blue-400 hover:text-blue-300 transition">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteRole(role.id)} className="text-red-400 hover:text-red-300 transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">Add New Role</h2>
            <form onSubmit={handleAddRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Role Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 text-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Add Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

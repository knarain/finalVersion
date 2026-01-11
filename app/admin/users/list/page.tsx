'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, Edit2 } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  role_id: number
  role_name?: string
  is_active: boolean
  created_at: string
}

interface Role {
  id: number
  name: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role_id: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data.results?.users || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRoles(res.data.results || [])
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('adminToken')
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role_id: formData.role_id ? parseInt(formData.role_id) : null
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuccess('User created successfully')
      setFormData({ username: '', email: '', password: '', role_id: '' })
      setShowModal(false)
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess('User deleted successfully')
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Add User
        </button>
      </div>

      {error && <div className="bg-red-900 text-red-200 p-4 rounded mb-4 border border-red-700">{error}</div>}
      {success && <div className="bg-green-900 text-green-200 p-4 rounded mb-4 border border-green-700">{success}</div>}

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-700 border-b border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Username</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user.id} className={`border-b border-gray-700 hover:bg-gray-750 transition ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                <td className="px-6 py-4 text-gray-300">{user.username}</td>
                <td className="px-6 py-4 text-gray-400">{user.email}</td>
                <td className="px-6 py-4 text-gray-300">{user.role_name || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${user.is_active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button className="text-blue-400 hover:text-blue-300 transition">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300 transition">
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
            <h2 className="text-2xl font-bold mb-4 text-white">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Role</label>
                <select
                  value={formData.role_id}
                  onChange={e => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
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
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

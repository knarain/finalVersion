'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, MoreVertical } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

type ActionMenuType = 'edit' | 'changeRole' | 'changePassword' | 'toggleStatus' | null

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role_id: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [actionType, setActionType] = useState<ActionMenuType>(null)

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1] || localStorage.getItem('adminToken')
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })
      setUsers(res.data.results?.users || [])
      setError('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch users'
      console.error('Fetch users error:', errorMsg)
      setError(errorMsg)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1] || localStorage.getItem('adminToken')
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/roles`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
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
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1] || localStorage.getItem('adminToken')
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role_id: formData.role_id ? parseInt(formData.role_id) : null
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
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
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1] || localStorage.getItem('adminToken')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })
      setSuccess('User deleted successfully')
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleToggleStatus = async (user: User) => {
    try {
      setActionLoading(true)
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1] || localStorage.getItem('adminToken')
      await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${user.id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })
      setSuccess(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`)
      setOpenMenuId(null)
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleChangeRole = async (roleId: number) => {
    if (!selectedUser) return
    try {
      setActionLoading(true)
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1] || localStorage.getItem('adminToken')
      await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${selectedUser.id}/assign-role`, { role_id: roleId }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })
      setSuccess('Role updated successfully')
      setOpenMenuId(null)
      setActionType(null)
      setSelectedUser(null)
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change role')
    } finally {
      setActionLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newPassword || !confirmPassword) {
      setError('All fields required')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      setActionLoading(true)
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1] || localStorage.getItem('adminToken')
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${selectedUser.id}/reset-password`, { new_password: newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })
      setSuccess('Password changed successfully')
      setOpenMenuId(null)
      setActionType(null)
      setSelectedUser(null)
      setNewPassword('')
      setConfirmPassword('')
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      setActionLoading(true)
      const token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1] || localStorage.getItem('adminToken')
      await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${selectedUser.id}`, { email: selectedUser.email }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })
      setSuccess('User updated successfully')
      setOpenMenuId(null)
      setActionType(null)
      setSelectedUser(null)
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user')
    } finally {
      setActionLoading(false)
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

      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
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
              <tr key={`user-${user.id}-${idx}`} className={`border-b border-gray-700 hover:bg-gray-750 transition ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                <td className="px-6 py-4 text-gray-300">{user.username}</td>
                <td className="px-6 py-4 text-gray-400">{user.email}</td>
                <td className="px-6 py-4 text-gray-300">{user.role_name || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${user.is_active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                    className="text-gray-400 hover:text-gray-200 transition"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenuId === user.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg z-50 border border-gray-600">
                      <button
                        onClick={() => { setSelectedUser(user); setActionType('edit'); setOpenMenuId(null) }}
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setActionType('changeRole'); setOpenMenuId(null) }}
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 transition border-t border-gray-600"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => { setSelectedUser(user); setActionType('changePassword'); setOpenMenuId(null) }}
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 transition border-t border-gray-600"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={() => { setOpenMenuId(null); handleToggleStatus(user) }}
                        disabled={actionLoading}
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 transition border-t border-gray-600 disabled:opacity-50"
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && actionType === 'edit' && (
        <Dialog open={true} onOpenChange={() => { setActionType(null); setSelectedUser(null) }}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                <Input
                  type="email"
                  value={selectedUser.email}
                  onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" onClick={() => { setActionType(null); setSelectedUser(null) }} className="bg-gray-700 hover:bg-gray-600">Cancel</Button>
                <Button type="submit" disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">{actionLoading ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {selectedUser && actionType === 'changeRole' && (
        <Dialog open={true} onOpenChange={() => { setActionType(null); setSelectedUser(null) }}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Change Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <select
                onChange={e => handleChangeRole(parseInt(e.target.value))}
                disabled={actionLoading}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <Button type="button" onClick={() => { setActionType(null); setSelectedUser(null) }} className="w-full bg-gray-700 hover:bg-gray-600">Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {selectedUser && actionType === 'changePassword' && (
        <Dialog open={true} onOpenChange={() => { setActionType(null); setSelectedUser(null); setNewPassword(''); setConfirmPassword('') }}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Change Password</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" onClick={() => { setActionType(null); setSelectedUser(null); setNewPassword(''); setConfirmPassword('') }} className="bg-gray-700 hover:bg-gray-600">Cancel</Button>
                <Button type="submit" disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">{actionLoading ? 'Updating...' : 'Update'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

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
                  {roles.map((role, idx) => (
                    <option key={`role-${role.id}-${idx}`} value={role.id}>{role.name}</option>
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

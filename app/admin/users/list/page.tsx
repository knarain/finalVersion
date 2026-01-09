'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2 } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  role: string
  created_at: string
}

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      // Handle both paginated and direct responses
      setUsers(response.data.data?.users || response.data.data || [])
    } catch (err: any) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`
            }
          }
        )
        fetchUsers()
      } catch (err) {
        setError('Failed to delete user')
      }
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User List</h1>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-lg mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Username</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Created At</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4 text-sm">{user.username}</td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-400">No users found</div>
          )}
        </div>
      )}
    </div>
  )
}

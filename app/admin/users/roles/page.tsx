'use client'
import { useState, useEffect } from 'react'
import { getRoles, Role } from '@/lib/permission-service'
import { Shield, Plus, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function UserRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const data = await getRoles(token)
      setRoles(data)
      setError('')
    } catch (err) {
      setError('Failed to fetch roles')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield size={32} className="text-green-500" />
          <h1 className="text-3xl font-bold">Manage Roles</h1>
        </div>
        <Link href="/admin/roles">
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            <Plus size={20} /> Add Role
          </button>
        </Link>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <Link key={role.id} href={`/admin/roles/${role.id}/permissions`}>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold">{role.name}</h3>
                <div className="flex items-center gap-2">
                  {role.is_active ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <XCircle size={20} className="text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">{role.description || 'No description'}</p>
              <p className="text-gray-500 text-xs">
                <strong>Status:</strong> {role.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

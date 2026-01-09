'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getUserById,
  getActiveRoles,
  assignRoleToUser,
  AdminUser,
  Role,
} from '@/lib/permission-service'

export default function UserRolePage() {
  const params = useParams()
  const router = useRouter()
  const userId = Number(params.id)

  const [user, setUser] = useState<AdminUser | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [userData, rolesData] = await Promise.all([
        getUserById(userId),
        getActiveRoles(),
      ])
      setUser(userData)
      setRoles(rolesData)
      setSelectedRole(userData.role_id?.toString() || '')
      setError('')
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      setError('Please select a role')
      return
    }

    try {
      setSubmitting(true)
      await assignRoleToUser(userId, Number(selectedRole))
      setSuccess('Role assigned successfully')
      setTimeout(() => router.back(), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error assigning role')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold">
          {loading ? 'Loading...' : `Assign Role - ${user?.username}`}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {!loading && user && (
        <>
          <div className="bg-white p-6 rounded shadow mb-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Username</p>
              <p className="text-lg font-semibold">{user.username}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Role</p>
              <p className="text-lg font-semibold">{user.role_name || 'No role assigned'}</p>
            </div>
          </div>

          <form onSubmit={handleAssignRole} className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Assign Role</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                <option value="">-- Select a role --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} {role.description ? ` - ${role.description}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Assigning a new role will replace the current role and all its associated permissions.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {submitting ? 'Assigning...' : 'Assign Role'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

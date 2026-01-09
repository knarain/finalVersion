'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  getUserById,
  changeUserPassword,
  resetUserPassword,
  AdminUser,
} from '@/lib/permission-service'

export default function UserPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const userId = Number(params.id)

  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [changeMode, setChangeMode] = useState<'change' | 'reset'>('change')
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadUser()
  }, [userId])

  const loadUser = async () => {
    try {
      setLoading(true)
      const userData = await getUserById(userId)
      setUser(userData)
      setError('')
    } catch (err) {
      setError('Failed to load user')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await changeUserPassword(userId, formData.oldPassword, formData.newPassword)
      setSuccess('Password changed successfully')
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => router.back(), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error changing password')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm('This will generate a temporary password for the user. Continue?')) return

    try {
      await resetUserPassword(userId, formData.newPassword)
      setSuccess('Password reset successfully')
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => router.back(), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error resetting password')
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
          {loading ? 'Loading...' : `Password Management - ${user?.username}`}
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
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setChangeMode('change')
                setError('')
                setSuccess('')
              }}
              className={`px-4 py-2 rounded font-medium ${
                changeMode === 'change'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => {
                setChangeMode('reset')
                setError('')
                setSuccess('')
              }}
              className={`px-4 py-2 rounded font-medium ${
                changeMode === 'reset'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Reset Password
            </button>
          </div>

          {changeMode === 'change' ? (
            <form onSubmit={handleChangePassword} className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.oldPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, oldPassword: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Change Password
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-bold mb-4">Reset Password</h2>
              <p className="text-gray-600 mb-6">
                This will generate a temporary password for the user. They will need to change it on their first login.
              </p>
              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Reset Password
              </button>
            </form>
          )}
        </>
      )}
    </div>
  )
}

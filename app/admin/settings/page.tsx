'use client'
import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type TabType = 'profile' | 'password' | '2fa'

interface AdminProfile {
  id: number
  username: string
  email?: string
  created_at?: string
  two_factor_enabled: boolean
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editEmail, setEditEmail] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)

  // Password change state
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  // 2FA state
  const [twoFALoading, setTwoFALoading] = useState(false)

  useEffect(() => {
    fetchAdminProfile()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')

      if (!token) {
        setError("Admin token not found")
        return
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/profile-settings`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      const data = res.data.results
      setProfile(data)
      setEditEmail(data.email || "")
      setError("")
    } catch (err) {
      console.error(err)
      setError("Failed to fetch profile")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editEmail.trim()) {
      setError("Email cannot be empty")
      return
    }

    if (!editEmail.includes("@")) {
      setError("Invalid email format")
      return
    }

    try {
      setProfileLoading(true)
      setError("")
      const token = localStorage.getItem('adminToken')

      if (!token) {
        setError("Admin token not found. Please log in again.")
        return
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/profile-update`,
        { email: editEmail },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      setSuccess("Profile updated successfully!")
      if (profile) {
        setProfile({ ...profile, email: editEmail })
      }
      setIsEditingProfile(false)

      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters")
      return
    }

    try {
      setPasswordLoading(true)
      setError("")
      const token = localStorage.getItem('adminToken')

      if (!token) {
        setError("Admin token not found. Please log in again.")
        return
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/change-password`,
        {
          currentPassword: oldPassword,
          newPassword: newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      setSuccess("Password changed successfully!")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to change password")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleToggle2FA = async (enable: boolean) => {
    try {
      setTwoFALoading(true)
      setError("")
      const token = localStorage.getItem('adminToken')

      if (!token) {
        setError("Admin token not found. Please log in again.")
        return
      }

      const endpoint = enable ? '/api/admin/2fa/enable' : '/api/admin/2fa/disable'

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      setSuccess(`2FA ${enable ? 'enabled' : 'disabled'} successfully!`)
      if (profile) {
        setProfile({ ...profile, two_factor_enabled: res.data.results.two_factor_enabled })
      }

      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || `Failed to ${enable ? 'enable' : 'disable'} 2FA`)
    } finally {
      setTwoFALoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-3 rounded-lg text-left transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`p-3 rounded-lg text-left transition-colors ${
              activeTab === 'password'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Change Password
          </button>
          <button
            onClick={() => setActiveTab('2fa')}
            className={`p-3 rounded-lg text-left transition-colors ${
              activeTab === '2fa'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Two-Factor Auth
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 max-w-2xl">
          {error && <p className="text-red-500 mb-4 p-3 bg-red-900/20 rounded">{error}</p>}
          {success && <p className="text-green-500 mb-4 p-3 bg-green-900/20 rounded">{success}</p>}

          {/* Profile Details Tab */}
          {activeTab === 'profile' && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Profile Details</h2>

              {loading ? (
                <p className="text-gray-400">Loading profile...</p>
              ) : profile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    {isEditingProfile ? (
                      <form onSubmit={handleProfileUpdate} className="space-y-2">
                        <Input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={profileLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {profileLoading ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setIsEditingProfile(false)
                              setEditEmail(profile.email || "")
                              setError("")
                            }}
                            className="bg-gray-700 hover:bg-gray-600"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex justify-between items-center">
                        <input
                          type="email"
                          value={profile.email || 'Not set'}
                          disabled
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-300 cursor-not-allowed"
                        />
                        <Button
                          onClick={() => setIsEditingProfile(true)}
                          className="ml-2 bg-blue-600 hover:bg-blue-700"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Member Since
                    </label>
                    <input
                      type="text"
                      value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                      disabled
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-red-500">Failed to load profile</p>
              )}
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </Button>
                </div>
              </form>

              <p className="text-sm text-gray-400 mt-4">
                ℹ️ Password must be at least 6 characters long
              </p>
            </div>
          )}

          {/* Two-Factor Auth Tab */}
          {activeTab === '2fa' && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>

              {loading ? (
                <p className="text-gray-400">Loading 2FA status...</p>
              ) : profile ? (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">2FA Status</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {profile.two_factor_enabled
                            ? 'Enabled - Your account is protected'
                            : 'Disabled - Enable for extra security'}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            profile.two_factor_enabled
                              ? 'bg-green-600/30 text-green-400'
                              : 'bg-gray-600/30 text-gray-300'
                          }`}
                        >
                          {profile.two_factor_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2 pt-2">
                      {profile.two_factor_enabled ? (
                        <Button
                          onClick={() => handleToggle2FA(false)}
                          disabled={twoFALoading}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          {twoFALoading ? 'Processing...' : 'Disable 2FA'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleToggle2FA(true)}
                          disabled={twoFALoading}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {twoFALoading ? 'Processing...' : 'Enable 2FA'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded">
                    <h4 className="font-semibold text-blue-300 mb-2">What is 2FA?</h4>
                    <p className="text-sm text-gray-300">
                      Two-Factor Authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password when logging in.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-red-500">Failed to load 2FA settings</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

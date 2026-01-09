'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut } from 'lucide-react'

export default function AdminHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [username, setUsername] = useState('')
  const profileRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Get admin username from localStorage
    const admin = localStorage.getItem('adminUsername')
    setUsername(admin || 'Admin')
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
    router.push('/login')
  }

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-end sticky top-0 z-30">
      <div ref={profileRef} className="relative">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <span className="text-sm font-medium">{username}</span>
        </button>

        {/* Profile Dropdown */}
        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-3 border-b border-gray-600 text-sm text-gray-300">
              <p className="font-medium">{username}</p>
              <p className="text-xs text-gray-400 mt-1">Administrator</p>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setIsProfileOpen(false)
                  router.push('/admin/settings')
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <User size={16} />
                <span>Profile Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-gray-600 rounded-lg transition-colors mt-1"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { getRolePermissions, getPermissionStructure, Role, PermissionStructure } from '@/lib/permission-service'
import { Lock } from 'lucide-react'

export default function AccessPrivilegesPage() {
  const [permData, setPermData] = useState<PermissionStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const data = await getPermissionStructure(token)
      setPermData(data)
      setError('')
    } catch (err) {
      setError('Failed to fetch permissions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Lock size={32} className="text-blue-500" />
        <h1 className="text-3xl font-bold">Access Privileges</h1>
      </div>

      <div className="space-y-6">
        {permData?.roles.map(role => (
          <div key={role.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4">{role.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permData.modules
                .filter(m => m.is_sub_module === 0)
                .map(module => (
                  <div key={module.id} className="bg-gray-700 p-4 rounded">
                    <h4 className="font-semibold mb-2">{module.name}</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      {permData.assigned[role.id]?.[module.id] ? (
                        <p className="text-green-400">✓ Has permissions</p>
                      ) : (
                        <p className="text-gray-500">No permissions assigned</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Save } from 'lucide-react'

interface Role {
  id: number
  name: string
}

interface Module {
  id: number
  name: string
  parent_id: number | null
  is_sub_module: boolean
  permissions: number[]
}

const PERMISSION_MAP: Record<number, string> = {
  1: 'READ',
  2: 'CREATE',
  3: 'UPDATE',
  4: 'DELETE'
}

export default function AccessPrivileges() {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [changes, setChanges] = useState<Record<number, number[]>>({})

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

  const handleRoleChange = async (roleId: string) => {
    setSelectedRoleId(roleId)
    setError('')
    setSuccess('')
    setChanges({})

    if (!roleId) {
      setModules([])
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/permissions/role/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setModules(res.data.results?.modules || [])
    } catch (err) {
      console.error('Failed to fetch role permissions:', err)
      setError('Failed to load permissions for this role')
    }
  }

  const togglePermission = (moduleId: number, permissionId: number) => {
    setChanges(prev => {
      const moduleChanges = prev[moduleId] !== undefined ? [...prev[moduleId]] : [...(modules.find(m => m.id === moduleId)?.permissions || [])]
      const idx = moduleChanges.indexOf(permissionId)
      if (idx > -1) {
        moduleChanges.splice(idx, 1)
      } else {
        moduleChanges.push(permissionId)
      }
      return { ...prev, [moduleId]: moduleChanges }
    })
  }

  const toggleSelectAll = (moduleId: number) => {
    const currentPerms = changes[moduleId] !== undefined ? changes[moduleId] : (modules.find(m => m.id === moduleId)?.permissions || [])
    setChanges(prev => ({
      ...prev,
      [moduleId]: currentPerms.length === 4 ? [] : [1, 2, 3, 4]
    }))
  }

  const handleSave = async () => {
    if (!selectedRoleId) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('adminToken')
      const assignments = Object.entries(changes).map(([moduleId, permissionIds]) => ({
        module_id: parseInt(moduleId),
        permission_ids: permissionIds
      }))

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/permissions/assign-bulk`,
        { role_id: parseInt(selectedRoleId), assignments },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccess('Permissions updated successfully')
      setChanges({})
      
      const roleId = localStorage.getItem('roleId')
      if (roleId === selectedRoleId) {
        const menuRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/permissions/menu/${roleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        localStorage.setItem('menu', JSON.stringify(menuRes.data.results || []))
        window.dispatchEvent(new Event('menuUpdated'))
      }
      
      handleRoleChange(selectedRoleId)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  const parentModules = modules.filter(m => !m.parent_id)
  const getSubmodules = (parentId: number) => modules.filter(m => m.parent_id === parentId)

  const renderRows = () => {
    const rows: JSX.Element[] = []
    
    parentModules.forEach((module, idx) => {
      const submodules = getSubmodules(module.id)
      
      rows.push(
        <tr key={`parent-${module.id}`} className={`border-b border-gray-700 ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
          <td className="px-6 py-4 font-semibold text-gray-200">{module.name}</td>
          <td className="px-6 py-4"></td>
        </tr>
      )
      
      if (submodules.length > 0) {
        submodules.forEach((sub, subIdx) => {
          const subPermissions = changes[sub.id] !== undefined ? changes[sub.id] : sub.permissions
          const isAllSelected = subPermissions.length === 4
          
          rows.push(
            <tr key={sub.id} className={`border-b border-gray-700 ${subIdx % 2 === 0 ? 'bg-gray-750' : 'bg-gray-800'}`}>
              <td className="px-6 py-4 pl-12 text-gray-300">↳ {sub.name}</td>
              <td className="px-6 py-4">
                <div className="flex gap-2 items-center">
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map(permId => (
                      <label key={permId} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={subPermissions.includes(permId)}
                          onChange={() => togglePermission(sub.id, permId)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 cursor-pointer"
                        />
                        <span className="text-sm text-gray-300">{PERMISSION_MAP[permId]}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => toggleSelectAll(sub.id)}
                    className={`text-xs px-2 py-1 rounded transition ${
                      isAllSelected
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isAllSelected ? 'Deselect' : 'Select'}
                  </button>
                </div>
              </td>
            </tr>
          )
        })
      } else {
        const modulePermissions = changes[module.id] !== undefined ? changes[module.id] : module.permissions
        const isAllSelected = modulePermissions.length === 4
        
        rows.push(
          <tr key={`child-${module.id}`} className="border-b border-gray-700 bg-gray-750">
            <td className="px-6 py-4 pl-12 text-gray-300">↳ {module.name}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2 items-center">
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map(permId => (
                    <label key={permId} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modulePermissions.includes(permId)}
                        onChange={() => togglePermission(module.id, permId)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-300">{PERMISSION_MAP[permId]}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => toggleSelectAll(module.id)}
                  className={`text-xs px-2 py-1 rounded transition ${
                    isAllSelected
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isAllSelected ? 'Deselect' : 'Select'}
                </button>
              </div>
            </td>
          </tr>
        )
      }
    })
    
    return rows
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Access Privileges</h1>

      {error && <div className="bg-red-900 text-red-200 p-4 rounded mb-4 border border-red-700">{error}</div>}
      {success && <div className="bg-green-900 text-green-200 p-4 rounded mb-4 border border-green-700">{success}</div>}

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-300">Select Role</label>
        <select
          value={selectedRoleId}
          onChange={e => handleRoleChange(e.target.value)}
          className="w-full max-w-xs bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Choose a role...</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </div>

      {selectedRoleId && modules.length > 0 && (
        <>
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto border border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Module</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Permissions & Actions</th>
                </tr>
              </thead>
              <tbody>
                {renderRows()}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(changes).length === 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Save size={20} /> Save Changes
            </button>
          </div>
        </>
      )}

      {selectedRoleId && modules.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No modules available for this role.
        </div>
      )}
    </div>
  )
}

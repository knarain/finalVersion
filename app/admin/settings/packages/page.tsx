'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, MoreVertical, X } from 'lucide-react'

interface Package {
  id: number
  category: string
  name: string
  price: number
  features: string[]
  is_active: boolean
}

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    price: '',
    features: '',
    is_active: true
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = res.data.results?.data || []
      const parsed = data.map((pkg: any) => ({
        ...pkg,
        features: typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features,
        is_active: pkg.is_active === 1 || pkg.is_active === '1' || pkg.is_active === true
      }))
      setPackages(parsed)
    } catch (err) {
      console.error('Failed to fetch packages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.category || !formData.name || !formData.price) return

    try {
      const token = localStorage.getItem('adminToken')
      const features = formData.features.split('\n').filter(f => f.trim())
      const payload = {
        category: formData.category,
        name: formData.name,
        price: parseFloat(formData.price),
        features,
        is_active: formData.is_active
      }

      if (editingId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/packages/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/packages`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }

      resetForm()
      fetchPackages()
    } catch (err) {
      console.error('Failed to save package:', err)
    }
  }

  const handleEdit = (pkg: Package) => {
    const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features
    setFormData({
      category: pkg.category,
      name: pkg.name,
      price: pkg.price.toString(),
      features: Array.isArray(features) ? features.join('\n') : '',
      is_active: pkg.is_active
    })
    setEditingId(pkg.id)
    setShowModal(true)
    setOpenMenuId(null)
  }

  const handleToggleStatus = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken')
      console.log('Toggling status for package:', id)
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/packages/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log('Toggle response:', res.data)
      setOpenMenuId(null)
      fetchPackages()
    } catch (err: any) {
      console.error('Failed to toggle status:', err.response?.data || err.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return

    try {
      const token = localStorage.getItem('adminToken')
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/packages/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setOpenMenuId(null)
      fetchPackages()
    } catch (err) {
      console.error('Failed to delete package:', err)
    }
  }

  const resetForm = () => {
    setFormData({ category: '', name: '', price: '', features: '', is_active: true })
    setEditingId(null)
    setShowModal(false)
  }

  if (loading) return <div className="p-6 text-gray-400">Loading packages...</div>

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Packages</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Add Package
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Package' : 'Add Package'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
              <input
                type="text"
                placeholder="Package Name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                Active
              </label>
            </div>
            <textarea
              placeholder="Features (one per line)"
              value={formData.features}
              onChange={e => setFormData({ ...formData, features: e.target.value })}
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{pkg.name} - ₹{pkg.price}</h3>
                <p className="text-sm text-gray-400">{pkg.category}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === pkg.id ? null : pkg.id)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <MoreVertical size={20} />
                </button>
                {openMenuId === pkg.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-10">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 rounded-t-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(pkg.id)}
                      className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600"
                    >
                      {pkg.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-600 rounded-b-lg"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <ul className="text-sm text-gray-300 space-y-1 mb-4">
              {(Array.isArray(pkg.features) ? pkg.features : typeof pkg.features === 'string' ? JSON.parse(pkg.features) : []).map((feature: string, idx: number) => (
                <li key={idx}>• {feature}</li>
              ))}
            </ul>
            <div className={`inline-block px-3 py-1 rounded text-sm font-semibold ${pkg.is_active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
              {pkg.is_active ? '✓ Active' : '✕ Inactive'}
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No packages found. Create one to get started.
        </div>
      )}
    </div>
  )
}

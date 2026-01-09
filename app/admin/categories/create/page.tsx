'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from '@/components/ui/button'

export default function CreateCategoryPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      )

      if (response.status === 201 || response.status === 200) {
        router.push('/admin/categories')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Category</h1>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Enter category name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Enter category description"
            rows={4}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </Button>
          <Button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-600"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

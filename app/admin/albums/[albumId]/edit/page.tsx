'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter, useParams } from 'next/navigation'

interface Album {
  id: number
  client_names: string
  event_date: string
  category_id: number
  cover_image: string
  is_locked: boolean
  is_active: boolean
}

interface Category {
  id: number
  name: string
}

export default function EditAlbum() {
  const [clientNames, setClientNames] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [album, setAlbum] = useState<Album | null>(null)
  const router = useRouter()
  const params = useParams()
  const albumId = params.albumId as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        
        // Fetch categories
        const catRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`
        )
        if (catRes.data.results) {
          setCategories(catRes.data.results)
        }

        // Fetch album details
        const albumRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums/${albumId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (albumRes.data.results) {
          const albumData = albumRes.data.results
          setAlbum(albumData)
          setClientNames(albumData.client_names || '')
          setEventDate(albumData.event_date || '')
          setCategoryId(albumData.category_id?.toString() || '')
          setIsLocked(albumData.is_locked || false)
          
          // Set cover image preview
          if (albumData.cover_image) {
            setCoverImagePreview(
              albumData.cover_image.startsWith('http')
                ? albumData.cover_image
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${albumData.cover_image}`
            )
          }
        }
      } catch (err: any) {
        console.error(err)
        setMessage(err.response?.data?.message || 'Failed to load album')
      } finally {
        setLoading(false)
      }
    }

    if (albumId) {
      fetchData()
    }
  }, [albumId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      // Show preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setCoverImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)

    try {
      let base64Image = null

      // Convert image to base64 if a new image is selected
      if (coverImage) {
        base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(coverImage)
        })
      }

      const payload: any = {
        clientNames,
        categoryId: parseInt(categoryId),
        eventDate: eventDate || null,
        isLocked: isLocked ? 1 : 0,
      }

      // Only include image if a new one was selected
      if (base64Image) {
        payload.image = base64Image
      }

      const token = localStorage.getItem('adminToken')
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums/${albumId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.status === 200 || res.data.results?.id) {
        setMessage('Album updated successfully!')
        // Redirect after 1.5 seconds
        setTimeout(() => {
          router.push('/admin/albums')
        }, 1500)
      } else {
        setMessage(res.data.message || 'Failed to update album')
      }
    } catch (err: any) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Server error. Try again.'
      setMessage(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Loading album details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-xl shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-4">Edit Album</h1>
      {message && (
        <p
          className={`mb-4 p-2 rounded ${
            message.includes('success')
              ? 'bg-green-900 text-green-200'
              : 'bg-red-900 text-red-200'
          }`}
        >
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client Name */}
        <div>
          <label className="block mb-1 text-gray-300">Client Names</label>
          <input
            type="text"
            value={clientNames}
            onChange={(e) => setClientNames(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block mb-1 text-gray-300">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Event Date */}
        <div>
          <label className="block mb-1 text-gray-300">Event Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block mb-1 text-gray-300">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-gray-300"
          />
          {coverImagePreview && (
            <div className="mt-3">
              <img
                src={coverImagePreview}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg border border-gray-700"
              />
            </div>
          )}
        </div>

        {/* Lock Album */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-gray-300">
            Lock Album (requires authentication)
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-yellow-500 text-black font-bold py-2 rounded-xl hover:bg-yellow-600 transition disabled:opacity-50"
        >
          {submitting ? 'Updating...' : 'Update Album'}
        </button>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full bg-gray-800 text-gray-300 font-semibold py-2 rounded-xl hover:bg-gray-700 transition"
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Image {
  id: number
  fileName: string
  fileUrl: string
  caption: string
  createdAt?: string
}

interface AlbumImagesClientProps {
  albumId: string
}

interface PaginationData {
  data: Image[]
  total: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export default function AlbumImagesClient({ albumId }: AlbumImagesClientProps) {
  const [images, setImages] = useState<Image[]>([])
  const [pagination, setPagination] = useState<Partial<PaginationData>>({})
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  const fetchImages = async (page: number = 1) => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums/${albumId}/images?page=${page}&page_size=12`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      )
      
      if (res.data.results) {
        setImages(res.data.results.data || [])
        setPagination({
          total: res.data.results.total,
          totalPages: res.data.results.totalPages,
          currentPage: res.data.results.currentPage,
          pageSize: res.data.results.pageSize,
        })
        setCurrentPage(page)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch images')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (albumId) {
      fetchImages(1)
    }
  }, [albumId])

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      setDeleting(imageId)
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/images/${imageId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      )
      
      // Remove from local state
      setImages(images.filter(img => img.id !== imageId))
      alert('Image deleted successfully')
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to delete image')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <p>Loading images...</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Album Images</h1>
        <button
          onClick={() => router.push(`/admin/albums/${albumId}/album-images/add`)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Add Images
        </button>
      </div>

      {error && <div className="bg-red-900 text-red-200 p-4 rounded mb-4">{error}</div>}

      {images.length === 0 ? (
        <p className="text-gray-400">No images found for this album.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {images.map((img) => (
              <div key={img.id} className="bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition group">
                <div className="relative h-40 overflow-hidden bg-gray-700">
                  <img
                    src={img.fileUrl}
                    alt={img.caption || 'Album image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400 mb-2 truncate">ID: {img.id}</p>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{img.caption || 'No caption'}</p>
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    disabled={deleting === img.id}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold transition disabled:opacity-50"
                  >
                    {deleting === img.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {(pagination.totalPages ?? 0) > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => fetchImages(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-400">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchImages(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

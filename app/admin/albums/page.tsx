'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Album {
  id: number
  clientNames: string
  eventDate: string
  categoryId: number
  coverImage: string
  isLocked: boolean
  isActive: boolean
}

export default function ListAlbums() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    try {
      let token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      if (!token) {
        token = localStorage.getItem('adminToken') || ''
      }
      if (!token) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )
      
      setAlbums(res.data.results?.data || [])
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.response?.data?.message || 'Failed to fetch albums')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLock = async (albumId: number, currentLocked: boolean) => {
    try {
      let token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      if (!token) {
        token = localStorage.getItem('adminToken') || ''
      }
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums/${albumId}/lock`,
        { is_locked: currentLocked ? 0 : 1 },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )

      setAlbums(albums.map(a => 
        a.id === albumId ? { ...a, isLocked: res.data.results?.is_locked ?? !currentLocked } : a
      ))
      setOpenMenuId(null)
    } catch (err: any) {
      console.error('Toggle lock error:', err)
      alert(err.response?.data?.message || 'Failed to toggle lock status')
    }
  }

  const handleToggleStatus = async (albumId: number, currentActive: boolean) => {
    try {
      let token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      if (!token) {
        token = localStorage.getItem('adminToken') || ''
      }
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums/${albumId}/status`,
        { is_active: currentActive ? 0 : 1 },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )

      setAlbums(albums.map(a => 
        a.id === albumId ? { ...a, isActive: res.data.results?.is_active ?? !currentActive } : a
      ))
      setOpenMenuId(null)
    } catch (err: any) {
      console.error('Toggle status error:', err)
      alert(err.response?.data?.message || 'Failed to toggle status')
    }
  }

  const handleDownloadQR = async (albumId: number) => {
    try {
      let token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      if (!token) {
        token = localStorage.getItem('adminToken') || ''
      }
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums/${albumId}/qr`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          responseType: 'blob',
          withCredentials: true,
        }
      )

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `album_qr_${albumId}.png`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      setOpenMenuId(null)
    } catch (err: any) {
      console.error('Download QR error:', err)
      alert(err.response?.data?.message || 'Failed to download QR code')
    }
  }

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return

    try {
      let token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      if (!token) {
        token = localStorage.getItem('adminToken') || ''
      }
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums/${deleteConfirmId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )

      setAlbums(albums.filter(a => a.id !== deleteConfirmId))
      setOpenMenuId(null)
      setDeleteConfirmId(null)
      alert('Album deleted successfully')
    } catch (err: any) {
      console.error('Delete error:', err)
      alert(err.response?.data?.message || 'Failed to delete album')
      setDeleteConfirmId(null)
    }
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Header with Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Albums</h1>
        <button
          onClick={() => router.push('/admin/albums/add')}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          + Add Album
        </button>
      </div>

      {loading && <p className="text-yellow-500">Loading albums...</p>}
      {error && <p className="text-red-500 bg-red-900 p-3 rounded mb-4">{error}</p>}

      {!loading && albums.length === 0 && <p className="text-gray-400">No albums found.</p>}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Delete Album</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this album? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Album Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            className="bg-gray-800 rounded-lg hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 border border-gray-700 hover:border-yellow-500"
          >
            {/* Card Header with Menu */}
            <div className="relative h-48 bg-gray-700 overflow-visible">
              {album.coverImage ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${album.coverImage}`}
                  alt={album.clientNames}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              {/* 3-Dot Menu Button */}
              <div className="absolute top-2 right-2 z-20">
                <button
                  onClick={() => setOpenMenuId(openMenuId === album.id ? null : album.id)}
                  className="bg-black/70 hover:bg-black p-2 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {openMenuId === album.id && (
                  <div className="absolute right-0 mt-1 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                    <button
                      onClick={() => handleToggleLock(album.id, album.isLocked)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        {album.isLocked ? (
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                        ) : (
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                        )}
                      </svg>
                      {album.isLocked ? 'Unlock Album' : 'Lock Album'}
                    </button>

                    <hr className="border-gray-700 my-1" />

                    <button
                      onClick={() => handleToggleStatus(album.id, album.isActive)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        {album.isActive ? (
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        ) : (
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                        )}
                      </svg>
                      {album.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <hr className="border-gray-700 my-1" />

                    <button
                      onClick={() => router.push(`/admin/albums/${album.id}/edit`)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                        <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                      Edit Album
                    </button>

                    <hr className="border-gray-700 my-1" />

                    <button
                      onClick={() => handleDownloadQR(album.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 17h4v4h-4z" />
                      </svg>
                      Download QR
                    </button>

                    <hr className="border-gray-700 my-1" />

                    <button
                      onClick={() => setDeleteConfirmId(album.id)}
                      className="w-full text-left px-4 py-2 hover:bg-red-900/20 transition-colors flex items-center gap-2 text-red-400 hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
                      </svg>
                      Delete Album
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 truncate">{album.clientNames}</h3>

              <div className="space-y-2 text-sm text-gray-300 mb-4">
                <p>
                  <span className="text-gray-400">Date:</span>{' '}
                  {new Date(album.eventDate).toLocaleDateString()}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    album.isLocked
                      ? 'bg-red-900/30 text-red-300'
                      : 'bg-green-900/30 text-green-300'
                  }`}
                >
                  {album.isLocked ? '🔒 Locked' : '🔓 Unlocked'}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    album.isActive
                      ? 'bg-blue-900/30 text-blue-300'
                      : 'bg-gray-700/50 text-gray-300'
                  }`}
                >
                  {album.isActive ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/albums/${album.id}/album-images`)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  Images
                </button>

                <button
                  onClick={() => router.push(`/admin/albums/${album.id}`)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  Auth
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

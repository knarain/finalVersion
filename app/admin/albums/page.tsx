'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function ListAlbums() {
  const [albums, setAlbums] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/albums`)
      .then((res) => {
        setAlbums(res.data.data?.items || [])
        console.log(res.data)
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Header with Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Albums</h1>
        <button
          onClick={() => router.push('/admin/albums/add')}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Add Album
        </button>
      </div>

      {/* Album List */}
      <div className="space-y-4">
        {albums.length === 0 && <p>No albums found.</p>}
        {albums.map((album) => (
          <div
            key={album.id}
            className="p-4 bg-gray-800 rounded-lg flex items-center justify-between gap-4"
          >
            {/* Cover Image + Details */}
            <div className="flex items-center gap-4">
              {album.coverImage && (
                <img
                  src={album.coverImage}
                  alt={album.clientNames}
                  className="w-24 h-24 object-cover rounded-md"
                />
              )}

              <div>
                <p>
                  <strong>Client:</strong> {album.clientNames}
                </p>
                <p>
                  <strong>Event:</strong> {album.eventType}
                </p>
                <p>
                  <strong>Date:</strong> {album.date}
                </p>
                <p>
                  <strong>Locked:</strong> {album.isLocked ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/albums/${album.id}/album-images`)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                View Images
              </button>

              <button
                onClick={() => router.push(`/admin/edit-album/${album.id}`)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Edit
              </button>

              <button
                onClick={() => router.push(`/admin/albums/${album.id}`)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Auth Credentials
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

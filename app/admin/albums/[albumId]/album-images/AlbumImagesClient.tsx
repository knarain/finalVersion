'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Image {
  id: number
  filename: string
  caption?: string
}

interface AlbumImagesClientProps {
  albumId: string
}

export default function AlbumImagesClient({ albumId }: AlbumImagesClientProps) {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchImages = async () => {
      try {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums/${albumId}/images`)
  setImages(res.data.data || [])
      } catch (err: any) {
        console.error(err)
        setError('Failed to fetch images')
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [albumId])

  if (loading) return <p>Loading images...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Album {albumId} - Images</h1>
        <button
          onClick={() => router.push(`/admin/albums/${albumId}/album-images/add`)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + Add Images
        </button>
      </div>

      {images.length === 0 ? (
        <p>No images found for this album.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition">
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/albums/${albumId}/${img.filename}`}
                alt={img.caption || 'Album Image'}
                className="w-full h-40 object-cover"
              />
              <div className="p-2 text-sm text-gray-300">
                {img.caption || 'No caption'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'

interface Image {
  id: number
  fileName: string
  fileUrl: string
  caption?: string
}

export default function AlbumPage() {
  const params = useParams()
  const code = params.code as string
  
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!code) return

    const loadImages = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get token from localStorage
        const stored = localStorage.getItem('authenticatedAlbums')
        let token = null

        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            // Handle both Map-like array format and object format
            if (Array.isArray(parsed)) {
              const albumData = parsed.find(([albumCode]: [string, any]) => albumCode === code)
              if (albumData && new Date(albumData[1].expiresAt).getTime() > Date.now()) {
                token = albumData[1].token
              }
            } else if (parsed[code]) {
              if (new Date(parsed[code].expiresAt).getTime() > Date.now()) {
                token = parsed[code].token
              }
            }
          } catch (err) {
            console.error('Failed to parse stored tokens:', err)
          }
        }

        const headers: any = {
          'Content-Type': 'application/json',
        }

        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/albums/code/${code}/images`,
          { headers }
        )

        if (res.data.results) {
          const mappedImages = (res.data.results as any[]).map((img: any) => ({
            id: img.id,
            fileName: img.fileName,
            fileUrl: img.fileUrl,
            caption: img.caption,
          }))
          setImages(mappedImages)
        } else {
          setError('Failed to load images')
        }
      } catch (err: any) {
        console.error('Error loading images:', err)
        setError(
          err.response?.data?.message || 
          'Failed to load album images. Please check your access.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [code])

  const openImage = (image: Image, index: number) => {
    setSelectedImage(image)
    setCurrentIndex(index)
  }

  const closeImage = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      const nextImg = images[currentIndex + 1]
      setSelectedImage(nextImg)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentIndex > 0) {
      const prevImg = images[currentIndex - 1]
      setSelectedImage(prevImg)
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading album images...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Unable to Load Album</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-amber-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-amber-500 transition-colors"
          >
            Back to Gallery
          </a>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-6">No images found in this album.</p>
          <a
            href="/"
            className="inline-block bg-amber-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-amber-500 transition-colors"
          >
            Back to Gallery
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 py-6 px-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-light tracking-wide text-amber-400">Album Gallery</h1>
          <a
            href="/"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Gallery
          </a>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openImage(image, index)}
              className="aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg hover:shadow-amber-400/20 transition-all duration-300 relative"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${image.fileUrl}`}
                alt={image.caption || `Image ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {image.caption && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-sm text-gray-200">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Image Counter */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          Total images: {images.length}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closeImage}
            className="absolute top-6 right-6 z-50 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Container */}
          <div className="flex items-center justify-center max-w-4xl max-h-screen">
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${selectedImage.fileUrl}`}
              alt={selectedImage.caption || 'Image'}
              className="max-w-full max-h-screen object-contain"
            />
          </div>

          {/* Navigation Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={prevImage}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {currentIndex < images.length - 1 && (
            <button
              onClick={nextImage}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image Counter in Lightbox */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded text-sm text-gray-300">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Caption */}
          {selectedImage.caption && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded text-sm text-gray-300 max-w-sm text-center">
              {selectedImage.caption}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

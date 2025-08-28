"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { fetchAlbumDetails, type AlbumWithImages } from "@/lib/api"

interface AlbumViewerProps {
  albumId: number
  isOpen: boolean
  onClose: () => void
}

export function AlbumViewer({ albumId, isOpen, onClose }: AlbumViewerProps) {
  const [album, setAlbum] = useState<AlbumWithImages | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // Load album data when viewer opens
  useEffect(() => {
    if (isOpen && albumId) {
      loadAlbum()
    }
  }, [isOpen, albumId])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen || !album) return

      switch (e.key) {
        case "Escape":
          if (isLightboxOpen) {
            setIsLightboxOpen(false)
          } else {
            onClose()
          }
          break
        case "ArrowLeft":
          e.preventDefault()
          navigateImage("prev")
          break
        case "ArrowRight":
          e.preventDefault()
          navigateImage("next")
          break
        case " ":
        case "Enter":
          e.preventDefault()
          setIsLightboxOpen(true)
          break
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyPress)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, album, isLightboxOpen, currentImageIndex])

  const loadAlbum = async () => {
    setIsLoading(true)
    setError(null)

    const result = await fetchAlbumDetails(albumId)

    if (result.success && result.data) {
      setAlbum(result.data)
      setCurrentImageIndex(0)
    } else {
      setError(result.error || "Failed to load album")
    }

    setIsLoading(false)
  }

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      if (!album || album.images.length === 0) return

      setCurrentImageIndex((prev) => {
        if (direction === "next") {
          return prev === album.images.length - 1 ? 0 : prev + 1
        } else {
          return prev === 0 ? album.images.length - 1 : prev - 1
        }
      })
    },
    [album],
  )

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
    setIsLightboxOpen(true)
  }

  const handleClose = () => {
    setIsLightboxOpen(false)
    setCurrentImageIndex(0)
    setAlbum(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            {album && (
              <div>
                <h1 className="text-2xl font-light text-white tracking-wide">{album.clientNames}</h1>
                <p className="text-gray-300 font-light">{album.eventType}</p>
              </div>
            )}
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 rounded-full w-10 h-10 p-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <span className="font-light">Loading album...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-lg font-light text-white">{error}</p>
            </div>
            <Button
              onClick={loadAlbum}
              variant="outline"
              className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-6 py-2 rounded-full bg-transparent font-light"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Album Content */}
      {album && album.images.length > 0 && (
        <div className="h-full pt-20 pb-32">
          {/* Main Image Grid */}
          <div className="h-full overflow-y-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
              {album.images.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => handleImageClick(index)}
                  className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-gray-900 transition-all duration-300 hover:scale-105"
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.title || `Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                  {/* Image overlay info */}
                  {image.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-light">{image.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {album && album.images.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-400 font-light">No images in this album yet.</p>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && album && album.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <Button
            onClick={() => setIsLightboxOpen(false)}
            variant="ghost"
            size="sm"
            className="absolute top-6 right-6 text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>

          {/* Navigation Buttons */}
          {album.images.length > 1 && (
            <>
              <Button
                onClick={() => navigateImage("prev")}
                variant="ghost"
                size="sm"
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button
                onClick={() => navigateImage("next")}
                variant="ghost"
                size="sm"
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </>
          )}

          {/* Main Image */}
          <div className="max-w-7xl max-h-full mx-auto px-20 py-16">
            <img
              src={album.images[currentImageIndex]?.url || "/placeholder.svg"}
              alt={album.images[currentImageIndex]?.title || `Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Image Info */}
          {album.images[currentImageIndex]?.title && (
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <p className="text-white font-light">{album.images[currentImageIndex].title}</p>
              <p className="text-gray-400 text-sm font-light mt-1">
                {currentImageIndex + 1} of {album.images.length}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

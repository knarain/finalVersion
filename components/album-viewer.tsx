"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Loader2, X, ZoomIn, ZoomOut } from "lucide-react"

interface AlbumImage {
  id: number
  albumId: number
  fileName: string
  fileUrl: string
  caption: string
}

interface AlbumViewerProps {
  albumId: number
  isOpen: boolean
  token: string | null
  onClose: () => void
}

// AlbumViewer takes token as prop for explicit control!
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export function AlbumViewer({ albumId, isOpen, token, onClose }: AlbumViewerProps) {
  const [images, setImages] = useState<AlbumImage[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({})
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})

  // Fetch images
  const loadAlbumImages = useCallback(async () => {
    if (!albumId) return
    setIsLoading(true)
    setError(null)
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.get(`${API_BASE}/user/albums/${albumId}/images`, { headers })
      if (!res.data.success) {
        setError(res.data.error || "Failed to load images")
        setImages([])
        return
      }
      setImages(res.data.data)
      setCurrentImageIndex(0)
      const loadingStates: { [key: number]: boolean } = {}
      res.data.data.forEach((img: AlbumImage) => (loadingStates[img.id] = true))
      setImageLoadingStates(loadingStates)
      setImageErrors({})
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || "An unexpected error occurred")
      setImages([])
    } finally {
      setIsLoading(false)
    }
  }, [albumId, token])

  useEffect(() => {
    if (isOpen) {
      setImages([])
      setCurrentImageIndex(0)
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setImageLoadingStates({})
      setImageErrors({})
      setError(null)
      loadAlbumImages()
    } else {
      setImages([])
      setCurrentImageIndex(0)
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setImageLoadingStates({})
      setImageErrors({})
      setError(null)
    }
  }, [isOpen, albumId, token, loadAlbumImages])

  // Image navigation
  const navigateImage = useCallback(
    (dir: "next" | "prev") => {
      if (!images.length) return
      setCurrentImageIndex((prev) =>
        dir === "next" ? (prev + 1) % images.length : (prev - 1 + images.length) % images.length
      )
    },
    [images.length]
  )

  // Zoom and Pan
  const handleZoom = (dir: "in" | "out") =>
    setScale((prev) => Math.min(Math.max(dir === "in" ? prev * 1.2 : prev / 1.2, 0.5), 3))
  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
    }
  }
  const handleMouseUp = () => setIsDragging(false)

  // Loading/error for <img>
  const handleImageLoad = (id: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [id]: false }))
    setImageErrors((prev) => ({ ...prev, [id]: false }))
  }
  const handleImageError = (id: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [id]: false }))
    setImageErrors((prev) => ({ ...prev, [id]: true }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="text-white">
          <h2 className="text-xl font-semibold">{images[currentImageIndex]?.caption || "Photo Gallery"}</h2>
          <p className="text-sm opacity-75">{`Image ${
            images.length > 0 ? currentImageIndex + 1 : 0
          } of ${images.length}`}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      {/* Main image area */}
      <div
        className="h-full flex items-center justify-center p-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isLoading ? (
          <Loader2 className="animate-spin h-8 w-8 text-white" />
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : images.length > 0 ? (
          <div className="relative w-full h-full max-w-6xl flex items-center justify-center overflow-hidden">
            {/* Navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/20"
              onClick={() => navigateImage("prev")}
              aria-label="Previous Image"
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/20"
              onClick={() => navigateImage("next")}
              aria-label="Next Image"
            >
              →
            </Button>
            {/* Big image */}
            <img
              src={`https://stg.rashmiphotography.com/backend/${images[currentImageIndex].fileUrl}`}
              alt={images[currentImageIndex].caption}
              onLoad={() => handleImageLoad(images[currentImageIndex].id)}
              onError={() => handleImageError(images[currentImageIndex].id)}
              className={`max-h-full max-w-full object-contain transition-all duration-200 ${
                imageLoadingStates[images[currentImageIndex].id] ? "opacity-0" : "opacity-100"
              }`}
              style={{ transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)` }}
            />
            {imageErrors[images[currentImageIndex].id] && (
              <div className="absolute inset-0 flex items-center justify-center text-red-400">
                Failed to load image
              </div>
            )}
            {/* Zoom controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <div className="bg-black/50 px-2 py-1 rounded text-white text-sm">{Math.round(scale * 100)}%</div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => handleZoom("in")}
                disabled={scale >= 3}
                aria-label="Zoom In"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => handleZoom("out")}
                disabled={scale <= 0.5}
                aria-label="Zoom Out"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              {scale !== 1 && (
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 text-sm"
                  onClick={resetZoom}
                  aria-label="Reset Zoom"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

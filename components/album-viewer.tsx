"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Loader2, X, ZoomIn, ZoomOut } from "lucide-react"
import { AlbumAuthModal } from "./album-auth-modal"

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
  onClose: () => void
}

const API_BASE = "http://localhost:8080" // <-- Replace with your PHP backend URL

export function AlbumViewer({ albumId, isOpen, onClose }: AlbumViewerProps) {
  const [images, setImages] = useState<AlbumImage[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({})
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})

  // Load album images
  const loadAlbumImages = useCallback(async () => {
    if (!albumId) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/api/albums/${albumId}/images`, {
        params: token ? { token } : undefined,
      })

      const data = res.data

      if (!data.success) {
        if (res.status === 401) {
          setShowAuthModal(true)
        } else {
          setError(data.error || "Failed to load images")
        }
        setIsLoading(false)
        return
      }

      setImages(data.data)
      const loadingStates: { [key: number]: boolean } = {}
      data.data.forEach((img: AlbumImage) => (loadingStates[img.id] = true))
      setImageLoadingStates(loadingStates)
      setImageErrors({})
    } catch (err: any) {
      if (err.response?.status === 401) {
        setShowAuthModal(true)
      } else {
        console.error(err)
        setError(err.message || "An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }, [albumId, token])

  useEffect(() => {
    if (isOpen) {
      loadAlbumImages()
    } else {
      setImages([])
      setCurrentImageIndex(0)
      setToken(null)
      setShowAuthModal(false)
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setImageLoadingStates({})
      setImageErrors({})
      setError(null)
    }
  }, [isOpen, loadAlbumImages])

  // Handle authentication
  const handleAuthenticate = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE}/api/albums/${albumId}/authenticate`, { email, password })
      const data = res.data
      if (data.success) {
        setToken(data.data.token)
        setShowAuthModal(false)
        loadAlbumImages()
        return true
      }
      return false
    } catch (err) {
      console.error(err)
      return false
    }
  }

  // Navigation & Zoom
  const navigateImage = useCallback(
    (dir: "next" | "prev") => {
      if (!images.length) return
      setCurrentImageIndex((prev) =>
        dir === "next" ? (prev + 1) % images.length : (prev - 1 + images.length) % images.length
      )
    },
    [images.length]
  )

  const handleZoom = (dir: "in" | "out") => setScale((prev) => Math.min(Math.max(dir === "in" ? prev * 1.2 : prev / 1.2, 0.5), 3))
  const resetZoom = () => { setScale(1); setPosition({ x: 0, y: 0 }) }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = -Math.sign(e.deltaY)
      const factor = 1.1
      setScale((prev) => Math.min(Math.max(delta > 0 ? prev * factor : prev / factor, 0.5), 3))
    }
  }

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    }
  }
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging && scale > 1) setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }) }
  const handleMouseUp = () => setIsDragging(false)
  const handleTouchStart = (e: React.TouchEvent) => { if (scale > 1 && e.touches.length === 1) { setIsDragging(true); dragStart.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y } } }
  const handleTouchMove = (e: React.TouchEvent) => { if (scale > 1 && isDragging && e.touches.length === 1) { e.preventDefault(); setPosition({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y }) } }

  const handleImageLoad = (id: number) => { setImageLoadingStates(prev => ({ ...prev, [id]: false })); setImageErrors(prev => ({ ...prev, [id]: false })) }
  const handleImageError = (id: number) => { setImageLoadingStates(prev => ({ ...prev, [id]: false })); setImageErrors(prev => ({ ...prev, [id]: true })) }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-hidden">
      <AlbumAuthModal
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false); onClose() }}
        onAuthenticate={handleAuthenticate}
        albumName={images[currentImageIndex]?.caption || "Private Album"}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="text-white">
          <h2 className="text-xl font-semibold">{images[currentImageIndex]?.caption || "Photo Gallery"}</h2>
          <p className="text-sm opacity-75">{`Image ${currentImageIndex + 1} of ${images.length}`}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Image viewer */}
      <div className="h-full flex items-center justify-center p-4"
           onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
           onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}>
        {isLoading ? <Loader2 className="animate-spin h-8 w-8 text-white"/> :
          error ? <div className="text-red-400 text-center">{error}</div> :
          images.length > 0 && (
            <div className="relative w-full h-full max-w-6xl flex items-center justify-center overflow-hidden">
              <Button variant="ghost" size="icon" className="absolute left-4 text-white hover:bg-white/20" onClick={() => navigateImage("prev")}>←</Button>
              <Button variant="ghost" size="icon" className="absolute right-4 text-white hover:bg-white/20" onClick={() => navigateImage("next")}>→</Button>
              <img
                src={images[currentImageIndex].fileUrl}
                alt={images[currentImageIndex].caption}
                onLoad={() => handleImageLoad(images[currentImageIndex].id)}
                onError={() => handleImageError(images[currentImageIndex].id)}
                className={`max-h-full max-w-full object-contain transition-all duration-200 ${imageLoadingStates[images[currentImageIndex].id] ? "opacity-0" : "opacity-100"}`}
                style={{ transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)` }}
              />
              {imageErrors[images[currentImageIndex].id] && <div className="absolute inset-0 flex items-center justify-center text-red-400">Failed to load image</div>}

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <div className="bg-black/50 px-2 py-1 rounded text-white text-sm">{Math.round(scale * 100)}%</div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => handleZoom("in")} disabled={scale >= 3}><ZoomIn className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => handleZoom("out")} disabled={scale <= 0.5}><ZoomOut className="h-5 w-5"/></Button>
                {scale !== 1 && <Button variant="ghost" className="text-white hover:bg-white/20 text-sm" onClick={resetZoom}>Reset</Button>}
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

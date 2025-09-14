"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { fetchAlbumImages, authenticateAlbum, type AlbumImage } from "@/lib/api"
import { Loader2, X, ZoomIn, ZoomOut } from "lucide-react"
import { AlbumAuthModal } from "./album-auth-modal"

interface AlbumViewerProps {
  albumId: number
  isOpen: boolean
  onClose: () => void
}

export function AlbumViewer({ albumId, isOpen, onClose }: AlbumViewerProps) {
  const [images, setImages] = useState<AlbumImage[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({})
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})
  const [scale, setScale] = useState(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragStart = useRef({ x: 0, y: 0 })

  // Preload adjacent images
  useEffect(() => {
    if (images.length > 0) {
      const preloadImage = (index: number) => {
        if (index >= 0 && index < images.length) {
          const img = new Image()
          img.src = images[index].src
        }
      }
      preloadImage(currentImageIndex - 1)
      preloadImage(currentImageIndex + 1)
    }
  }, [currentImageIndex, images])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen || images.length === 0) return

      switch (e.key) {
        case "Escape":
          if (scale > 1) {
            e.preventDefault()
            resetZoom()
          } else if (isLightboxOpen) {
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
          setIsLightboxOpen(!isLightboxOpen)
          break
        case "+":
        case "=":
          e.preventDefault()
          handleZoom("in")
          break
        case "-":
        case "_":
          e.preventDefault()
          handleZoom("out")
          break
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            resetZoom()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isOpen, isLightboxOpen, currentImageIndex, images.length, scale])

  // Check if album requires authentication
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const result = await fetchAlbumImages(albumId)
        if (result.success && Array.isArray(result.data)) {
          setIsAuthenticated(true)
          setImages(result.data)

          const loadingStates: { [key: number]: boolean } = result.data.reduce(
            (acc: { [key: number]: boolean }, img: AlbumImage) => {
              if (img.id !== undefined) {
                acc[img.id] = true
              }
              return acc
            },
            {}
          )
          setImageLoadingStates(loadingStates)
        } else {
          setShowAuthModal(true)
        }
      } catch (error) {
        setShowAuthModal(true)
      }
    }

    if (isOpen && albumId) {
      if (isAuthenticated) {
        loadAlbumImages()
      } else {
        checkAuthStatus()
      }
    }
    return () => {
      setImages([])
      setCurrentImageIndex(0)
      setError(null)
      setIsAuthenticated(false)
    }
  }, [isOpen, albumId, isAuthenticated])

  const loadAlbumImages = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchAlbumImages(albumId)
      if (result.success && Array.isArray(result.data)) {
        const sortedImages = [...result.data].sort(
          (a, b) => (a.display_order || 0) - (b.display_order || 0)
        )
        setImages(sortedImages)

        const loadingStates: { [key: number]: boolean } = sortedImages.reduce(
          (acc: { [key: number]: boolean }, img: AlbumImage) => {
            if (img.id !== undefined) {
              acc[img.id] = true
            }
            return acc
          },
          {}
        )
        setImageLoadingStates(loadingStates)
        setImageErrors({})
      } else {
        setError(result.error || "Failed to load album images")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      setError(errorMessage)
      console.error("Error loading album images:", error)
    }
    setIsLoading(false)
  }

  const navigateImage = useCallback(
    (direction: "next" | "prev") => {
      if (images.length === 0) return

      setCurrentImageIndex((prev) => {
        if (direction === "next") {
          return prev === images.length - 1 ? 0 : prev + 1
        } else {
          return prev === 0 ? images.length - 1 : prev - 1
        }
      })
    },
    [images.length]
  )

  const handleZoom = (direction: "in" | "out") => {
    setScale((prev) => {
      const newScale = direction === "in" ? prev * 1.2 : prev / 1.2
      return Math.min(Math.max(newScale, 0.5), 3)
    })
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = -Math.sign(e.deltaY)
      const zoomFactor = 1.1
      setScale((prev) => {
        const newScale = delta > 0 ? prev * zoomFactor : prev / zoomFactor
        return Math.min(Math.max(newScale, 0.5), 3)
      })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      })
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true)
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      e.preventDefault()
      setPosition({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleImageLoad = (imageId: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [imageId]: false }))
    setImageErrors((prev) => ({ ...prev, [imageId]: false }))
  }

  const handleImageError = (imageId: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [imageId]: false }))
    setImageErrors((prev) => ({ ...prev, [imageId]: true }))
  }

  useEffect(() => {
    resetZoom()
  }, [currentImageIndex])

  const handleAuthentication = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authenticateAlbum(albumId, email, password)
      if (result.success) {
        setIsAuthenticated(true)
        setShowAuthModal(false)
        return true
      }
      console.error("Authentication failed:", result.error)
      return false
    } catch (error) {
      console.error("Authentication error:", error)
      return false
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-hidden">
      <AlbumAuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
          onClose()
        }}
        onAuthenticate={handleAuthentication}
        albumName={images[currentImageIndex]?.caption || "Private Album"}
      />
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="text-white">
          <h2 className="text-xl font-semibold">
            {images[currentImageIndex]?.caption || "Photo Gallery"}
          </h2>
          <p className="text-sm opacity-75">
            {`Image ${currentImageIndex + 1} of ${images.length}`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main content */}
      <div className="h-full flex items-center justify-center p-4">
        {isLoading ? (
          <div className="text-white flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading images...</span>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4 text-white border-white hover:bg-white/20"
              onClick={loadAlbumImages}
            >
              Retry
            </Button>
          </div>
        ) : images.length > 0 ? (
          <div className="relative w-full h-full max-w-6xl mx-auto flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/20"
              onClick={() => navigateImage("prev")}
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/20"
              onClick={() => navigateImage("next")}
            >
              → 
            </Button>

            <div
              className="w-full h-full flex items-center justify-center overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              style={{ cursor: scale > 1 ? "grab" : "default" }}
            >
              {imageLoadingStates[images[currentImageIndex]?.id] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              <img
                src={images[currentImageIndex]?.src}
                alt={images[currentImageIndex]?.alt}
                className={`max-h-full max-w-full object-contain transition-all duration-200 ${
                  imageLoadingStates[images[currentImageIndex]?.id]
                    ? "opacity-0"
                    : "opacity-100"
                }`}
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  cursor: isDragging ? "grabbing" : "inherit",
                }}
                onLoad={() => handleImageLoad(images[currentImageIndex].id)}
                onError={() => handleImageError(images[currentImageIndex].id)}
              />
              {imageErrors[images[currentImageIndex]?.id] && (
                <div className="absolute inset-0 flex items-center justify-center text-red-400">
                  Failed to load image
                </div>
              )}

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <div className="bg-black/50 px-2 py-1 rounded text-white text-sm">
                  {Math.round(scale * 100)}%
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleZoom("in")}
                    disabled={scale >= 3}
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleZoom("out")}
                    disabled={scale <= 0.5}
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </Button>
                  {scale !== 1 && (
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-white/20 text-sm"
                      onClick={resetZoom}
                      title="Reset Zoom (Ctrl/⌘ + 0)"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-white text-center">
            <p>No images found in this album</p>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { X, Loader2, Download } from "lucide-react"

// Define watermark image
const WATERMARK_IMAGE = "/watermark.png" // Path in your public folder, e.g. /public/watermark.png

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export function AlbumViewer({ albumId, isOpen, token, onClose }: AlbumViewerProps) {
  const [images, setImages] = useState<AlbumImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({})
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})
  const [selectedImage, setSelectedImage] = useState<AlbumImage | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  // Fetch images from backend
  const loadAlbumImages = useCallback(async () => {
    if (!albumId) return
    setIsLoading(true)
    setError(null)
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.get(`${API_BASE}/api/user/albums/${albumId}/images`, { headers })
      if (!res.data.success) {
        setError(res.data.error || "Failed to load images")
        setImages([])
        return
      }
      setImages(res.data.data)
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
      setError(null)
      setSelectedImage(null)
      setDownloadError(null)
      loadAlbumImages()
    }
  }, [isOpen, albumId, token, loadAlbumImages])

  const handleImageLoad = (id: number) => setImageLoadingStates((prev) => ({ ...prev, [id]: false }))
  const handleImageError = (id: number) => setImageErrors((prev) => ({ ...prev, [id]: true }))

  const goToPrevImage = () => {
    if (!selectedImage) return
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id)
    const prevIndex = (currentIndex - 1 + images.length) % images.length
    setSelectedImage(images[prevIndex])
  }

  const goToNextImage = () => {
    if (!selectedImage) return
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id)
    const nextIndex = (currentIndex + 1) % images.length
    setSelectedImage(images[nextIndex])
  }

  // Download image with watermark in bottom-right
  const handleDownload = async (img: AlbumImage) => {
    setDownloadError(null)
    try {
      if (!token) throw new Error("No authorization token provided for download")

      const imageUrl = `${API_BASE}/${img.fileUrl}`
      const res = await axios.get(imageUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })

      const blob = res.data
      const baseImage = await createImageBitmap(blob)

      // Load watermark image
      const watermarkResponse = await fetch(WATERMARK_IMAGE)
      const watermarkBlob = await watermarkResponse.blob()
      const watermarkImage = await createImageBitmap(watermarkBlob)

      const canvas = document.createElement("canvas")
      canvas.width = baseImage.width
      canvas.height = baseImage.height
      const ctx = canvas.getContext("2d")

      if (!ctx) throw new Error("Could not get canvas context")
      ctx.drawImage(baseImage, 0, 0)
      ctx.globalAlpha = 0.6 // watermark transparency

      // position watermark bottom-right
      const watermarkWidth = baseImage.width * 0.25 // 25% of base image width
      const watermarkHeight = (watermarkImage.height / watermarkImage.width) * watermarkWidth
      const x = baseImage.width - watermarkWidth - 20
      const y = baseImage.height - watermarkHeight - 20

      ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight)
      ctx.globalAlpha = 1.0

      const jpgBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.95)
      })

      if (jpgBlob) {
        const blobUrl = URL.createObjectURL(jpgBlob)
        const link = document.createElement("a")
        link.download = img.fileName.replace(/\.[^/.]+$/, "") + "_wm.jpg"
        link.href = blobUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      } else throw new Error("Could not convert image to JPG")
    } catch (error: any) {
      setDownloadError("Failed to download image. " + (error?.message || ""))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 left-0 right-0 bg-black/80 p-4 flex justify-between items-center z-10">
        <h2 className="text-white text-xl font-semibold">Album Gallery</h2>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Photo Grid */}
      <div className="p-6 flex flex-col items-center">
        {isLoading ? (
          <Loader2 className="animate-spin h-8 w-8 text-white mt-12" />
        ) : error ? (
          <div className="text-red-400 text-center mt-12">{error}</div>
        ) : images.length === 0 ? (
          <div className="text-gray-400 mt-12">No images found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-7xl">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="relative group overflow-hidden rounded-lg border border-white/10 bg-black/30 cursor-pointer hover:ring-2 hover:ring-white/40 transition-all"
              >
                <img
                  src={`${API_BASE}/${img.fileUrl}`}
                  alt={img.caption}
                  onLoad={() => handleImageLoad(img.id)}
                  onError={() => handleImageError(img.id)}
                  className={`object-cover w-full h-48 transition-opacity duration-300 ${
                    imageLoadingStates[img.id] ? "opacity-50" : "opacity-100"
                  }`}
                />
                {imageErrors[img.id] && (
                  <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm bg-black/50">
                    Failed to load
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.caption || "Untitled"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-5xl flex flex-col items-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Download button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-16 text-white hover:bg-white/20"
              onClick={() => handleDownload(selectedImage)}
            >
              <Download className="h-6 w-6" />
            </Button>

            {/* Left navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-4 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={goToPrevImage}
              aria-label="Previous Image"
            >
              ←
            </Button>

            {/* Right navigation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={goToNextImage}
              aria-label="Next Image"
            >
              →
            </Button>

            <img
              src={`${API_BASE}/${selectedImage.fileUrl}`}
              alt={selectedImage.caption}
              className="max-h-[85vh] max-w-full object-contain mt-6"
            />
            <div className="text-white text-center mt-4 opacity-75">{selectedImage.caption}</div>
            {downloadError && <div className="text-red-400 text-center mt-4">{downloadError}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { AlbumAuthModal } from "./album-auth-modal"
import { AlbumViewer } from "./album-viewer"
import axios from "axios"

export interface Album {
  id: number
  clientNames: string
  eventType: string
  date?: string
  coverImage?: string
  isLocked: boolean
}

const categories = [
  { id: "all", name: "All" },
  { id: "engagement", name: "engagement" },
  { id: "wedding", name: "wedding" },
  { id: "sreemantham", name: "sreemantham" },
  { id: "cradle ceremony", name: "cradle ceremony" },
  { id: "pre-birthday", name: "pre-birthday" },
  { id: "birthday", name: "birthday" },
  { id: "dothi ceremony", name: "dothi ceremony" },
  { id: "house warming", name: "house warming" },
  { id: "photoshoot", name: "photoshoot" },
  { id: "anniversary", name: "anniversary" },
  { id: "pre-wedding", name: "pre-wedding" },
]

export function Gallery() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [authenticatedAlbums, setAuthenticatedAlbums] = useState<Set<number>>(new Set())
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAlbumViewerOpen, setIsAlbumViewerOpen] = useState(false)
  const [viewingAlbumId, setViewingAlbumId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 🔹 Fetch Albums
  const loadAlbums = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await axios.get("http://localhost:8080/api/albums", {
        params: {
          category: activeCategory === "all" ? undefined : activeCategory,
          page: currentPage,
          limit: 12,
        },
      })

      if (res.data.success && res.data.data) {
        setAlbums(res.data.data.items)
        setTotalPages(res.data.data.totalPages)
      } else {
        setError(res.data.error || "Failed to load albums")
      }
    } catch (err) {
      setError("An unexpected error occurred while loading albums")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [activeCategory, currentPage])

  useEffect(() => {
    loadAlbums()
  }, [loadAlbums])

  // 🔹 Fetch Album Images
  const handleAlbumClick = useCallback(
    async (album: Album) => {
      if (album.isLocked && !authenticatedAlbums.has(album.id)) {
        setSelectedAlbum(album)
        setIsAuthModalOpen(true)
        return
      }
      try {
        const res = await axios.get(`http://localhost:8080/api/albums/${album.id}/images`)
        if (res.data.success) {
          setViewingAlbumId(album.id)
          setIsAlbumViewerOpen(true)
        } else {
          console.error("Failed to load album images:", res.data.error)
        }
      } catch (error) {
        console.error("Error loading album images:", error)
      }
    },
    [authenticatedAlbums]
  )

  // 🔹 Authenticate Album
  const handleAuthenticate = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (!selectedAlbum) return false
      try {
        const res = await axios.post(`http://localhost:8080/api/albums/${selectedAlbum.id}/authenticate`, {
          email,
          password,
        })

        if (res.data.success && res.data.data?.token) {
          setAuthenticatedAlbums((prev) => new Set([...prev, selectedAlbum.id]))
          setIsAuthModalOpen(false)
          setViewingAlbumId(selectedAlbum.id)
          setIsAlbumViewerOpen(true)
          return true
        }
        return false
      } catch (error) {
        console.error("Authentication error:", error)
        return false
      }
    },
    [selectedAlbum]
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setCurrentPage(1)
  }

  // ================== JSX Rendering ==================
  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-light text-amber-400 tracking-wider">CLIENT GALLERY</h2>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
            <span className="font-light">Loading albums...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-light text-amber-400 tracking-wider">CLIENT GALLERY</h2>
        </div>
        <div className="text-center py-20">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-lg font-light">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline"
            className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-6 py-2 rounded-full bg-transparent font-light">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 container mx-auto px-4">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-light text-amber-400 tracking-wider">CLIENT GALLERY</h2>
      </div>

      {/* Category Navigation */}
      <div className="overflow-x-auto">
        <div className="flex gap-8 pb-4 min-w-max justify-center">
          {categories.map((category) => (
            <button key={category.id} onClick={() => handleCategoryChange(category.id)}
              className={`text-sm font-light tracking-wide transition-all duration-300 whitespace-nowrap pb-2 border-b-2 ${
                activeCategory === category.id
                  ? "text-amber-400 border-amber-400"
                  : "text-gray-400 border-transparent hover:text-amber-400 hover:border-amber-400/50"
              }`}>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Albums Display */}
      {!albums || albums.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-light">
            {isLoading ? "Loading albums..." : "No albums found."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {albums.map((album) => (
            <div key={album.id} onClick={() => handleAlbumClick(album)}
              className="group relative overflow-hidden rounded-lg bg-gray-900 cursor-pointer transition-all duration-300 hover:scale-105 w-full hover:shadow-xl"
              style={{ aspectRatio: "3/4" }}>
              <img src={album.coverImage || "/placeholder.svg"}
                alt={`${album.clientNames} - ${album.eventType}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300" />

              {/* Lock/Unlock Icons */}
              {album.isLocked && !authenticatedAlbums.has(album.id) && (
                <div className="absolute top-4 left-4 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}

              {album.isLocked && authenticatedAlbums.has(album.id) && (
                <div className="absolute top-4 left-4 w-8 h-8 bg-green-600/80 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {!album.isLocked && (
                <div className="absolute top-4 left-4 w-8 h-8 bg-amber-400/80 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-light text-lg tracking-wide mb-1">{album.clientNames}</h3>
                {album.date && <p className="text-gray-300 text-sm font-light">{album.date}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1} className="px-4 py-2">
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => handlePageChange(i + 1)}
              className={`px-4 py-2 ${currentPage === i + 1 ? "bg-amber-400 text-black" : ""}`}>
              {i + 1}
            </Button>
          ))}
          <Button variant="outline" onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages} className="px-4 py-2">
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <AlbumAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false)
          setSelectedAlbum(null)
        }}
        onAuthenticate={handleAuthenticate}
        albumName={selectedAlbum?.clientNames || ""}
      />

      {viewingAlbumId && (
        <AlbumViewer
          albumId={viewingAlbumId}
          isOpen={isAlbumViewerOpen}
          onClose={() => {
            setIsAlbumViewerOpen(false)
            setViewingAlbumId(null)
          }}
        />
      )}
    </div>
  )
}

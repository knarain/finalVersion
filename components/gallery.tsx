"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlbumAuthModal } from "./album-auth-modal"
import { AlbumViewer } from "./album-viewer"
import { fetchAlbums, type Album } from "@/lib/api"

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

  useEffect(() => {
    const loadAlbums = async () => {
      setIsLoading(true)
      setError(null)

      const result = await fetchAlbums()

      if (result.success && result.data) {
        setAlbums(result.data)
      } else {
        setError(result.error || "Failed to load albums")
        console.error("Failed to fetch albums:", result.error)
      }

      setIsLoading(false)
    }

    loadAlbums()
  }, [])

  const filteredAlbums = activeCategory === "all" ? albums : albums.filter((album) => album.category === activeCategory)

  const handleAlbumClick = (album: Album) => {
    if (album.isLocked && !authenticatedAlbums.has(album.id)) {
      setSelectedAlbum(album)
      setIsAuthModalOpen(true)
    } else {
      console.log("[v0] Opening album:", album.clientNames)
      setViewingAlbumId(album.id)
      setIsAlbumViewerOpen(true)
    }
  }

  const handleAuthenticate = async (email: string, password: string): Promise<boolean> => {
    if (!selectedAlbum) return false

    console.log("[v0] Authenticating album:", selectedAlbum.id, "with email:", email)

    try {
      const { authenticateAlbum } = await import("@/lib/api")
      const result = await authenticateAlbum(selectedAlbum.id, email, password)

      if (result.success) {
        setAuthenticatedAlbums((prev) => new Set([...prev, selectedAlbum.id]))
        console.log("[v0] Authentication successful for album:", selectedAlbum.id)
        setViewingAlbumId(selectedAlbum.id)
        setIsAlbumViewerOpen(true)
        return true
      } else {
        console.log("[v0] Authentication failed:", result.error)
        return false
      }
    } catch (error) {
      console.error("[v0] Authentication error:", error)
      return false
    }
  }

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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-lg font-light">{error}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-6 py-2 rounded-full bg-transparent font-light"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-light text-amber-400 tracking-wider">CLIENT GALLERY</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-8 pb-4 min-w-max justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`text-sm font-light tracking-wide transition-all duration-300 whitespace-nowrap pb-2 border-b-2 ${
                activeCategory === category.id
                  ? "text-amber-400 border-amber-400"
                  : "text-gray-400 border-transparent hover:text-amber-400 hover:border-amber-400/50"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {filteredAlbums.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-light">No albums found in this category.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-0">
          {filteredAlbums.map((album) => (
            <div
              key={album.id}
              onClick={() => handleAlbumClick(album)}
              className="group relative overflow-hidden rounded-lg bg-gray-900 cursor-pointer transition-all duration-300 hover:scale-105 break-inside-avoid mb-6 inline-block w-full"
              style={{
                aspectRatio: album.id % 3 === 0 ? "4/5" : album.id % 2 === 0 ? "4/3" : "3/4",
              }}
            >
              <img
                src={album.coverImage || "/placeholder.svg"}
                alt={`${album.clientNames} - ${album.eventType}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300"></div>

              {album.isLocked && !authenticatedAlbums.has(album.id) && (
                <div className="absolute top-4 left-4 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
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

      <div className="text-center pt-8">
        <Button
          variant="outline"
          className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-3 rounded-full bg-transparent font-light tracking-wide"
        >
          Load More Albums
        </Button>
      </div>

      <AlbumAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false)
          setSelectedAlbum(null)
        }}
        onAuthenticate={handleAuthenticate}
        albumName={selectedAlbum?.clientNames || ""}
      />

      <AlbumViewer
        albumId={viewingAlbumId || 0}
        isOpen={isAlbumViewerOpen}
        onClose={() => {
          setIsAlbumViewerOpen(false)
          setViewingAlbumId(null)
        }}
      />
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlbumAuthModal } from "./album-auth-modal"

export interface Album {
  id: number
  clientNames: string
  albumCode?: string
  eventType?: string
  eventDate?: string
  date?: string
  coverImage?: string
  isLocked: boolean
}

export interface Category {
  id: number
  name: string
}

interface StoredToken {
  token: string
  expiresAt: string // ISO string
}

export function Gallery() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [authenticatedAlbums, setAuthenticatedAlbums] = useState<Map<string, StoredToken>>(new Map())
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Load tokens from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("authenticatedAlbums")
    if (stored) {
      try {
        const parsed: [string, StoredToken][] = JSON.parse(stored)
        const filtered: [string, StoredToken][] = parsed.filter(([_, data]) => {
          return new Date(data.expiresAt).getTime() > Date.now()
        })
        setAuthenticatedAlbums(new Map(filtered))
      } catch {
        localStorage.removeItem("authenticatedAlbums")
      }
    }
  }, [])

  // Save tokens to localStorage on every authenticatedAlbums change
  useEffect(() => {
    // Remove expired tokens before saving
    const validEntries = Array.from(authenticatedAlbums.entries()).filter(
      ([_, data]) => new Date(data.expiresAt).getTime() > Date.now()
    )
    localStorage.setItem("authenticatedAlbums", JSON.stringify(validEntries))
  }, [authenticatedAlbums])

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`
        )
        
        if (res.data.results) {
          const cats = res.data.results as Category[]
          
          // Filter categories that have albums
          const categoriesWithAlbums: Category[] = []
          
          for (const cat of cats) {
            try {
              const albumRes = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/albums/category/${cat.id}`,
                {
                  params: { page: 1, page_size: 1 }
                }
              )
              
              // If category has albums, include it
              if (albumRes.data.results?.albums && albumRes.data.results.albums.length > 0) {
                categoriesWithAlbums.push(cat)
              }
            } catch (err) {
              // Skip categories with errors
              console.error(`Failed to check albums for category ${cat.id}:`, err)
            }
          }
          
          // Add "All" category at the beginning
          const allCategory: Category = { id: 0, name: "All" }
          const finalCategories = [allCategory, ...categoriesWithAlbums]
          
          setCategories(finalCategories)
          // Set "All" as active by default
          setActiveCategory(0)
        }
      } catch (err) {
        console.error("Failed to load categories:", err)
        setError("Failed to load categories")
      }
    }

    loadCategories()
  }, [])

  // Load albums according to current filter and page
  const loadAlbums = useCallback(async () => {
    if (activeCategory === null) return

    setIsLoading(true)
    setError(null)
    try {
      let albumsData: Album[] = []
      let totalPagesData = 1
      
      if (activeCategory === 0) {
        // Fetch all albums from all categories
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`
        )
        
        if (res.data.results) {
          const allCats = res.data.results as Category[]
          const allAlbums: Album[] = []
          let maxPages = 1
          
          // Fetch albums from each category
          for (const cat of allCats) {
            try {
              const albumRes = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/albums/category/${cat.id}`,
                {
                  params: {
                    page: currentPage,
                    page_size: 12,
                  },
                }
              )
              
              if (albumRes.data.results?.albums) {
                const mappedAlbums = albumRes.data.results.albums.map((a: any) => ({
                  id: a.id,
                  clientNames: a.clientNames,
                  albumCode: a.albumCode,
                  eventDate: a.eventDate,
                  date: a.eventDate ? new Date(a.eventDate).toLocaleDateString() : undefined,
                  coverImage: a.coverImage,
                  isLocked: a.isLocked,
                }))
                allAlbums.push(...mappedAlbums)
                maxPages = Math.max(maxPages, albumRes.data.results.pagination?.totalPages || 1)
              }
            } catch (err) {
              console.error(`Failed to fetch albums for category ${cat.id}:`, err)
            }
          }
          
          albumsData = allAlbums
          totalPagesData = maxPages
        }
      } else {
        // Fetch albums for specific category
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/albums/category/${activeCategory}`,
          {
            params: {
              page: currentPage,
              page_size: 12,
            },
          }
        )

        if (res.data.results) {
          const result = res.data.results
          albumsData = (result.albums || []).map((a: any) => ({
            id: a.id,
            clientNames: a.clientNames,
            albumCode: a.albumCode,
            eventDate: a.eventDate,
            date: a.eventDate ? new Date(a.eventDate).toLocaleDateString() : undefined,
            coverImage: a.coverImage,
            isLocked: a.isLocked,
          }))
          
          totalPagesData = result.pagination?.totalPages || 1
        }
      }
      
      setAlbums(albumsData)
      setTotalPages(totalPagesData)
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

  // Album click handler (navigate to album or prompt auth)
  const handleAlbumClick = useCallback(
    async (album: Album) => {
      if (!album.albumCode) return

      const storedToken = authenticatedAlbums.get(album.albumCode)
      const hasValidToken =
        storedToken && new Date(storedToken.expiresAt).getTime() > Date.now()

      if (album.isLocked && !hasValidToken) {
        setSelectedAlbum(album)
        setIsAuthModalOpen(true)
        return
      }

      // Navigate to album page with code
      router.push(`/albums/${album.albumCode}`)
    },
    [authenticatedAlbums, router]
  )

  // Called after successful login in modal
  const handleAuthenticate = useCallback(
    async (email: string, password: string, captchaId: string, captchaText: string): Promise<boolean> => {
      if (!selectedAlbum?.albumCode) return false
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/albums/code/${selectedAlbum.albumCode}/authenticate`,
          { 
            email, 
            password,
            captcha_id: captchaId,
            captcha_text: captchaText
          }
        )

        if (res.data.results) {
          const newToken: StoredToken = {
            token: res.data.results.token,
            expiresAt: res.data.results.expiresAt
          }
          setAuthenticatedAlbums((prev) => {
            const updated = new Map(prev)
            updated.set(selectedAlbum.albumCode!, newToken)
            return updated
          })

          // Navigate to album page
          setIsAuthModalOpen(false)
          router.push(`/albums/${selectedAlbum.albumCode}`)
          return true
        }
        return false
      } catch (error) {
        console.error("Authentication error:", error)
        return false
      }
    },
    [selectedAlbum, router]
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCategoryChange = (categoryId: number) => {
    setActiveCategory(categoryId)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-12 container mx-auto px-4">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-light text-amber-400 tracking-wider">CLIENT GALLERY</h2>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-8 pb-4 min-w-max justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
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
      )}

      {/* Albums grid */}
      {!albums || albums.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 font-light">{isLoading ? "Loading albums..." : "No albums found."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {albums.map((album) => {
            const storedToken = album.albumCode ? authenticatedAlbums.get(album.albumCode) : undefined
            const isAuthed = storedToken && new Date(storedToken.expiresAt).getTime() > Date.now()
            return (
              <div
                key={album.id}
                onClick={() => handleAlbumClick(album)}
                className="group relative overflow-hidden rounded-lg bg-gray-900 cursor-pointer transition-all duration-300 hover:scale-105 w-full hover:shadow-xl"
                style={{ aspectRatio: "3/4" }}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${album.coverImage || "/placeholder.svg"}`}
                  alt={`${album.clientNames}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300" />
                {album.isLocked && !isAuthed && (
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
                {album.isLocked && isAuthed && (
                  <div className="absolute top-4 left-4 w-8 h-8 bg-green-600/80 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {!album.isLocked && (
                  <div className="absolute top-4 left-4 w-8 h-8 bg-amber-400/80 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300" />
                {album.isLocked && !isAuthed && (
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
                {album.isLocked && isAuthed && (
                  <div className="absolute top-4 left-4 w-8 h-8 bg-green-600/80 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {!album.isLocked && (
                  <div className="absolute top-4 left-4 w-8 h-8 bg-amber-400/80 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2"
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => handlePageChange(i + 1)}
              className={`px-4 py-2 ${currentPage === i + 1 ? "bg-amber-400 text-black" : ""}`}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2"
          >
            Next
          </Button>
        </div>
      )}

      {/* Auth Modal */}
      <AlbumAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false)
          setSelectedAlbum(null)
        }}
        onAuthenticate={handleAuthenticate}
        albumName={selectedAlbum?.clientNames || ""}
        albumCode={selectedAlbum?.albumCode}
      />
    </div>
  )
}

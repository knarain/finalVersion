// lib/api.ts

// ------------------ Interfaces ------------------

export interface Album {
  id: number
  coverImage: string
  clientNames: string
  eventType: string
  date: string
  category: string
  isLocked: boolean
  imageCount: number
}

export interface AlbumImage {
  id: number
  src: string
  alt: string
  caption: string
  display_order: number
}

export interface CreateAlbumData {
  clientNames: string
  eventType: string
  date: string
  category: string
  coverImage?: File
  isLocked: boolean
  albumAccess?: {
    email: string
    password: string
    expiresAt?: string
  }[]
}

export interface AlbumQueryParams {
  category?: string
  search?: string
  sortBy?: 'date' | 'name' | 'category'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data?: {
    items: T[]
    total: number
    page: number
    totalPages: number
  }
  error?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// ------------------ Config ------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

// Helper to build query string
function buildQueryString(params: AlbumQueryParams): string {
  const validParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')
  return validParams ? `?${validParams}` : ''
}

// Cache options for Next.js fetch
const CACHE_OPTIONS = {
  public: {
    next: { revalidate: 60 }, // Cache for 60s
  },
  private: {
    cache: 'no-store', // No cache for private
  },
}

// ------------------ API Functions ------------------

// Fetch all albums
export async function fetchAlbums(params: AlbumQueryParams = {}): Promise<PaginatedResponse<Album>> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const queryString = buildQueryString(params)
    const url = `${API_BASE_URL}/rashmi-backend/gallery/get_albums.php${queryString}`

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      ...CACHE_OPTIONS.public,
    })

    clearTimeout(timeoutId)

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const result = await response.json()
    if (!result.success) throw new Error(result.error || 'Server error')

    return result
  } catch (error) {
    console.error("Error fetching albums:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load albums",
      data: { items: [], total: 0, page: 1, totalPages: 0 },
    }
  }
}

// Authenticate album
export async function authenticateAlbum(
  albumId: number,
  email: string,
  password: string
): Promise<ApiResponse<{ albumId: number; message: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/rashmi-backend/gallery/authenticate.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albumId, email, password }),
    })

    const result = await response.json()
    if (result.success) {
      return { success: true, data: { albumId, message: "Access granted" } }
    } else {
      return { success: false, error: result.error || "Invalid credentials" }
    }
  } catch (error) {
    console.error("Error authenticating album:", error)
    return { success: false, error: "Failed to authenticate album" }
  }
}

// Fetch album images
export async function fetchAlbumImages(albumId: number, password?: string): Promise<ApiResponse<AlbumImage[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/rashmi-backend/gallery/album_images.php`)
    url.searchParams.append('album_id', albumId.toString())
    if (password) url.searchParams.append('password', password)

    const response = await fetch(url.toString())
    const result = await response.json()

    if (!result.success) throw new Error(result.error)

    return result
  } catch (error) {
    console.error("Error fetching album images:", error)
    return { success: false, error: "Failed to load album images" }
  }
}

// Create new album
export async function createAlbum(data: CreateAlbumData): Promise<ApiResponse<Album>> {
  try {
    const formData = new FormData()

    // flat fields
    const flatFields: (keyof CreateAlbumData)[] = ['clientNames', 'eventType', 'date', 'category', 'isLocked']
    flatFields.forEach((key) => {
      if (data[key] !== undefined) formData.append(key, String(data[key]))
    })

    // cover image
    if (data.coverImage instanceof File) {
      formData.append('coverImage', data.coverImage)
    }

    // album access
    if (data.albumAccess?.length) {
      formData.append('albumAccess', JSON.stringify(data.albumAccess))
    }

    const response = await fetch(`${API_BASE_URL}/rashmi-backend/gallery/create_album.php`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const result = await response.json()
    if (!result.success) throw new Error(result.error || 'Failed to create album')

    return result
  } catch (error) {
    console.error("Error creating album:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create album" }
  }
}

// API utilities for frontend communication with static JSON (no backend)

export interface Album {
  id: number
  coverImage: string
  clientNames: string
  eventType: string
  date: string
  category: string
  isLocked: boolean
}

export interface AlbumWithImages extends Album {
  password?: string
  images: {
    id: number
    url: string
    title: string | null
    description: string | null
  }[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string[]
}

// Fetch all albums
export async function fetchAlbums(): Promise<ApiResponse<Album[]>> {
  try {
    const response = await fetch("/data/albums.json")
    const albums: AlbumWithImages[] = await response.json()

    return { success: true, data: albums }
  } catch (error) {
    console.error("Error fetching albums:", error)
    return { success: false, error: "Failed to load albums" }
  }
}

// Fetch album details by ID
export async function fetchAlbumDetails(albumId: number): Promise<ApiResponse<AlbumWithImages>> {
  try {
    const response = await fetch("/data/albums.json")
    const albums: AlbumWithImages[] = await response.json()

    const album = albums.find((a) => a.id === albumId)
    if (!album) return { success: false, error: "Album not found" }

    return { success: true, data: album }
  } catch (error) {
    console.error("Error fetching album details:", error)
    return { success: false, error: "Failed to load album details" }
  }
}

// Authenticate album access (client-side check against JSON password)
export async function authenticateAlbum(
  albumId: number,
  email: string,
  password: string,
): Promise<ApiResponse<{ albumId: number; message: string }>> {
  try {
    const details = await fetchAlbumDetails(albumId)
    if (!details.success || !details.data) {
      return { success: false, error: "Album not found" }
    }

    const album = details.data
    if (album.isLocked) {
      if (album.password === password) {
        return { success: true, data: { albumId, message: "Access granted" } }
      }
      return { success: false, error: "Invalid password" }
    }

    return { success: true, data: { albumId, message: "Album is public" } }
  } catch (error) {
    console.error("Error authenticating album:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}

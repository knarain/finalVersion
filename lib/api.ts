// API utilities for frontend-backend communication

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
    const response = await fetch("/api/albums", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch albums",
      }
    }

    return {
      success: true,
      data: data.albums,
    }
  } catch (error) {
    console.error("Error fetching albums:", error)
    return {
      success: false,
      error: "Network error. Please check your connection.",
    }
  }
}

// Fetch album details with images
export async function fetchAlbumDetails(albumId: number): Promise<ApiResponse<AlbumWithImages>> {
  try {
    const response = await fetch(`/api/albums/${albumId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch album details",
      }
    }

    return {
      success: true,
      data: data.album,
    }
  } catch (error) {
    console.error("Error fetching album details:", error)
    return {
      success: false,
      error: "Network error. Please check your connection.",
    }
  }
}

// Authenticate album access
export async function authenticateAlbum(
  albumId: number,
  email: string,
  password: string,
): Promise<ApiResponse<{ albumId: number; message: string }>> {
  try {
    const response = await fetch("/api/albums/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        albumId,
        email,
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Authentication failed",
        details: data.details,
      }
    }

    return {
      success: true,
      data: {
        albumId: data.albumId,
        message: data.message,
      },
    }
  } catch (error) {
    console.error("Error authenticating album:", error)
    return {
      success: false,
      error: "Network error. Please check your connection.",
    }
  }
}

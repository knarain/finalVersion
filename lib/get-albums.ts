const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost"

interface Album {
  id: number
  client_names: string
  event_type: string
  event_date: string | null
  category: string
  cover_image: string | null
  is_locked: boolean
  created_at: string
  updated_at: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function getAlbums(): Promise<Album[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/rashmi-backend/gallery/albums.php`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<Album[]> = await response.json()
    if (!result.success || !result.data) {
      console.error("Failed to fetch albums:", result.error)
      return []
    }

    return result.data
  } catch (error) {
    console.error("Error fetching albums:", error)
    return []
  }
}

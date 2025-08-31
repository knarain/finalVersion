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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

// Fetch all albums
export async function fetchAlbums(): Promise<ApiResponse<Album[]>> {
  try {
    const { getAllAlbums } = await import('./database')
    const albums = await getAllAlbums()
    const transformedAlbums = albums.map(album => ({
      id: album.id,
      coverImage: album.cover_image || '', // Ensure string type
      clientNames: album.client_names,
      eventType: album.event_type,
      date: album.event_date || '',
      category: album.category,
      isLocked: album.is_locked
    }))
    return { success: true, data: transformedAlbums }
  } catch (error) {
    console.error("Error fetching albums:", error)
    return { success: false, error: "Failed to load albums" }
  }
}

// Fetch album details by ID
export async function fetchAlbumDetails(albumId: number): Promise<ApiResponse<AlbumWithImages>> {
  try {
    const { getAlbumById } = await import('./database')
    const album = await getAlbumById(albumId)
    if (!album) return { success: false, error: "Album not found" }
    // Add password and images for compatibility with AlbumWithImages
    let password = '';
  if (album.is_locked) {
      const { mockAlbumAccess } = await import('./database');
      const access = mockAlbumAccess.find(a => a.album_id === album.id);
      password = access ? access.password_hash : '';
    }
    const { getAlbumImages } = await import('./database');
    const imagesRaw = await getAlbumImages(album.id);
    const images = imagesRaw.map(img => ({
      id: img.id,
      url: img.image_url,
      title: img.image_title,
      description: img.image_description
    }));
    const transformedAlbum: AlbumWithImages = {
      id: album.id,
  coverImage: album.cover_image || '',
  clientNames: album.client_names,
  eventType: album.event_type,
  date: album.event_date || '',
      category: album.category,
  isLocked: album.is_locked,
      password,
      images
    }
    return { success: true, data: transformedAlbum }
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
    const response = await fetch(`${API_BASE_URL}/authenticate-album`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albumId, email, password })
    })
    const result = await response.json()
    if (result.success) {
      return { success: true, data: { albumId, message: "Access granted" } }
    } else {
      return { success: false, error: result.error || "Invalid credentials" }
    }
  } catch (error) {
    console.error("Error authenticating album:", error)
    return { success: false, error: "Unexpected error occurred" }
  }
}

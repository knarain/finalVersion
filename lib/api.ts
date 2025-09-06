// API utilities for backend communication

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

export interface CreateAlbumData {
  clientNames: string
  eventType: string
  date: string
  category: string
  isLocked: boolean
  password?: string
  coverImage?: File
  albumAccess?: {
    email: string
    password: string
    expiresAt?: string
  }[]
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

export interface AlbumQueryParams {
  category?: string
  search?: string
  sortBy?: 'date' | 'name' | 'category'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface AlbumImage {
  id: number
  src: string
  alt: string
  caption: string
  display_order: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost";

// Helper to build query string
function buildQueryString(params: AlbumQueryParams): string {
  const validParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')
  return validParams ? `?${validParams}` : ''
}

// Add caching headers to fetch options
const CACHE_OPTIONS = {
  public: {
    next: { revalidate: 60 }, // Cache for 60 seconds
  },
  private: {
    cache: 'no-store', // Don't cache private data
  },
}

// Fetch all albums with filtering, sorting, and pagination
export async function fetchAlbums(params: AlbumQueryParams = {}): Promise<PaginatedResponse<Album>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const queryString = buildQueryString(params);
    const url = `${API_BASE_URL}/rashmi-backend/gallery/get_albums.php${queryString}`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      ...CACHE_OPTIONS.public,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Server returned an unsuccessful response');
    }

    return result;
  } catch (error) {
    console.error("Error fetching albums:", error);
    let errorMessage = "Failed to load albums";
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. Please try again.";
      } else if ((error as any).cause?.code === 'ECONNREFUSED') {
        errorMessage = "Could not connect to the server. Please check your connection.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    return { 
      success: false, 
      error: errorMessage,
      data: {
        items: [],
        total: 0,
        page: 1,
        totalPages: 0
      }
    };
  }
}

// Authenticate album access
export async function authenticateAlbum(
  albumId: number,
  email: string,
  password: string
): Promise<ApiResponse<{ albumId: number; message: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/rashmi-backend/gallery/authenticate.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ albumId, email, password }),
    });
    const result = await response.json();
    if (result.success) {
      return { success: true, data: { albumId, message: "Access granted" } };
    } else {
      return { success: false, error: result.error || "Invalid credentials" };
    }
  } catch (error) {
    console.error("Error authenticating album:", error);
    return { 
      success: false, 
      error: "Failed to authenticate album" 
    };
  }
}

// Fetch album images
export async function fetchAlbumImages(albumId: number, password?: string): Promise<ApiResponse<AlbumImage[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/rashmi-backend/gallery/album_images.php`);
    url.searchParams.append('album_id', albumId.toString());
    if (password) {
      url.searchParams.append('password', password);
    }

    const response = await fetch(url.toString());
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error("Error fetching album images:", error);
    return { 
      success: false, 
      error: "Failed to load album images" 
    };
  }
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

export async function createAlbum(data: CreateAlbumData): Promise<ApiResponse<Album>> {
  try {
    const formData = new FormData();
    
    // Handle flat fields
    const flatFields = ['clientNames', 'eventType', 'date', 'category', 'isLocked'];
    flatFields.forEach(key => {
      if (data[key as keyof typeof data] !== undefined) {
        formData.append(key, String(data[key as keyof typeof data]));
      }
    });

    // Handle cover image
    if (data.coverImage instanceof File) {
      formData.append('coverImage', data.coverImage);
    }

    // Handle album access data
    if (data.albumAccess && data.albumAccess.length > 0) {
      formData.append('albumAccess', JSON.stringify(data.albumAccess));
    }

    const response = await fetch(`${API_BASE_URL}/rashmi-backend/gallery/create_album.php`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create album');
    }

    return result;
  } catch (error) {
    console.error("Error creating album:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create album" 
    };
  }
}

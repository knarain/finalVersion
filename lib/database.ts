// Mock database implementation for v0 environment
// In production, replace this with actual MySQL connection

export interface Album {
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

export interface AlbumImage {
  id: number
  album_id: number
  image_url: string
  image_title: string | null
  image_description: string | null
  sort_order: number
  created_at: string
}

export interface AlbumAccess {
  id: number
  album_id: number
  email: string
  password_hash: string
  access_granted_at: string | null
  expires_at: string | null
  created_at: string
}

// Mock data - replace with actual database in production
const mockAlbums: Album[] = [
  {
    id: 1,
    client_names: "SUSHANTH & JOSHNIKA",
    event_type: "Wedding",
    event_date: "2024-12-15",
    category: "wedding",
    cover_image: "/wedding-couple-romantic-portrait.png",
    is_locked: true,
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-01T10:00:00Z",
  },
  {
    id: 2,
    client_names: "MANI & HARSHITHA WEDDING",
    event_type: "Wedding",
    event_date: "2024-11-20",
    category: "wedding",
    cover_image: "/bride-portrait-natural-light.png",
    is_locked: true,
    created_at: "2024-11-15T10:00:00Z",
    updated_at: "2024-11-15T10:00:00Z",
  },
  {
    id: 3,
    client_names: "AADARSH'S HOUSE WARMING",
    event_type: "House Warming",
    event_date: "2025-08-07",
    category: "house warming",
    cover_image: "/family-portrait-outdoor-session.png",
    is_locked: true,
    created_at: "2025-08-01T10:00:00Z",
    updated_at: "2025-08-01T10:00:00Z",
  },
  {
    id: 4,
    client_names: "PRIYA & ARJUN ENGAGEMENT",
    event_type: "Engagement",
    event_date: "2024-10-10",
    category: "engagement",
    cover_image: "/wedding-ceremony-candid-moment.png",
    is_locked: false,
    created_at: "2024-10-05T10:00:00Z",
    updated_at: "2024-10-05T10:00:00Z",
  },
  {
    id: 5,
    client_names: "LANDSCAPE PORTFOLIO",
    event_type: "Portfolio",
    event_date: "2024-09-15",
    category: "photoshoot",
    cover_image: "/mountain-landscape-golden-hour.png",
    is_locked: false,
    created_at: "2024-09-10T10:00:00Z",
    updated_at: "2024-09-10T10:00:00Z",
  },
  {
    id: 6,
    client_names: "RAVI'S BIRTHDAY CELEBRATION",
    event_type: "Birthday",
    event_date: "2024-08-25",
    category: "birthday",
    cover_image: "/coastal-cliffs-ocean-view.png",
    is_locked: true,
    created_at: "2024-08-20T10:00:00Z",
    updated_at: "2024-08-20T10:00:00Z",
  },
]

const mockAlbumImages: AlbumImage[] = [
  // Album 1 images
  {
    id: 1,
    album_id: 1,
    image_url: "/wedding-couple-romantic-portrait.png",
    image_title: "Romantic Portrait",
    image_description: "Beautiful couple portrait",
    sort_order: 1,
    created_at: "2024-12-01T10:00:00Z",
  },
  {
    id: 2,
    album_id: 1,
    image_url: "/wedding-ceremony-candid-moment.png",
    image_title: "Ceremony Moment",
    image_description: "Candid ceremony shot",
    sort_order: 2,
    created_at: "2024-12-01T10:00:00Z",
  },
  {
    id: 3,
    album_id: 1,
    image_url: "/bride-portrait-natural-light.png",
    image_title: "Bride Portrait",
    image_description: "Natural light portrait",
    sort_order: 3,
    created_at: "2024-12-01T10:00:00Z",
  },

  // Album 2 images
  {
    id: 4,
    album_id: 2,
    image_url: "/bride-portrait-natural-light.png",
    image_title: "Bridal Beauty",
    image_description: "Stunning bridal portrait",
    sort_order: 1,
    created_at: "2024-11-15T10:00:00Z",
  },
  {
    id: 5,
    album_id: 2,
    image_url: "/wedding-couple-romantic-portrait.png",
    image_title: "Couple Goals",
    image_description: "Perfect couple moment",
    sort_order: 2,
    created_at: "2024-11-15T10:00:00Z",
  },

  // Album 3 images
  {
    id: 6,
    album_id: 3,
    image_url: "/family-portrait-outdoor-session.png",
    image_title: "Family Joy",
    image_description: "Happy family moment",
    sort_order: 1,
    created_at: "2025-08-01T10:00:00Z",
  },
  {
    id: 7,
    album_id: 3,
    image_url: "/coastal-cliffs-ocean-view.png",
    image_title: "House Blessing",
    image_description: "Traditional ceremony",
    sort_order: 2,
    created_at: "2025-08-01T10:00:00Z",
  },

  // Album 4 images (public)
  {
    id: 8,
    album_id: 4,
    image_url: "/wedding-ceremony-candid-moment.png",
    image_title: "Engagement Bliss",
    image_description: "Engagement ceremony",
    sort_order: 1,
    created_at: "2024-10-05T10:00:00Z",
  },
  {
    id: 9,
    album_id: 4,
    image_url: "/bride-portrait-natural-light.png",
    image_title: "Ring Ceremony",
    image_description: "Beautiful ring exchange",
    sort_order: 2,
    created_at: "2024-10-05T10:00:00Z",
  },

  // Album 5 images (public)
  {
    id: 10,
    album_id: 5,
    image_url: "/mountain-landscape-golden-hour.png",
    image_title: "Golden Mountains",
    image_description: "Sunset over mountains",
    sort_order: 1,
    created_at: "2024-09-10T10:00:00Z",
  },
  {
    id: 11,
    album_id: 5,
    image_url: "/coastal-cliffs-ocean-view.png",
    image_title: "Ocean Cliffs",
    image_description: "Dramatic coastal view",
    sort_order: 2,
    created_at: "2024-09-10T10:00:00Z",
  },
  {
    id: 12,
    album_id: 5,
    image_url: "/forest-path-misty-morning.png",
    image_title: "Misty Forest",
    image_description: "Morning mist in forest",
    sort_order: 3,
    created_at: "2024-09-10T10:00:00Z",
  },

  // Album 6 images
  {
    id: 13,
    album_id: 6,
    image_url: "/coastal-cliffs-ocean-view.png",
    image_title: "Birthday Celebration",
    image_description: "Happy birthday moment",
    sort_order: 1,
    created_at: "2024-08-20T10:00:00Z",
  },
  {
    id: 14,
    album_id: 6,
    image_url: "/family-portrait-outdoor-session.png",
    image_title: "Family Fun",
    image_description: "Family enjoying the party",
    sort_order: 2,
    created_at: "2024-08-20T10:00:00Z",
  },
]

const mockAlbumAccess: AlbumAccess[] = [
  {
    id: 1,
    album_id: 1,
    email: "sushanth@example.com",
    password_hash: "wedding123", // In production, this would be properly hashed
    access_granted_at: null,
    expires_at: null,
    created_at: "2024-12-01T10:00:00Z",
  },
  {
    id: 2,
    album_id: 2,
    email: "mani@example.com",
    password_hash: "harshitha2024", // In production, this would be properly hashed
    access_granted_at: null,
    expires_at: null,
    created_at: "2024-11-15T10:00:00Z",
  },
  {
    id: 3,
    album_id: 3,
    email: "aadarsh@example.com",
    password_hash: "housewarming", // In production, this would be properly hashed
    access_granted_at: null,
    expires_at: null,
    created_at: "2025-08-01T10:00:00Z",
  },
  {
    id: 4,
    album_id: 6,
    email: "ravi@example.com",
    password_hash: "birthday25", // In production, this would be properly hashed
    access_granted_at: null,
    expires_at: null,
    created_at: "2024-08-20T10:00:00Z",
  },
]

// Simulate async delay for realistic API behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Get all albums
export async function getAllAlbums(): Promise<Album[]> {
  await delay(100) // Simulate network delay
  console.log("[v0] Getting all albums from mock data")
  return [...mockAlbums]
}

// Get album by ID
export async function getAlbumById(id: number): Promise<Album | null> {
  await delay(50)
  console.log("[v0] Getting album by ID:", id)
  const album = mockAlbums.find((album) => album.id === id)
  return album || null
}

// Get album images
export async function getAlbumImages(albumId: number): Promise<AlbumImage[]> {
  await delay(100)
  console.log("[v0] Getting images for album:", albumId)
  return mockAlbumImages.filter((image) => image.album_id === albumId)
}

// Authenticate album access
export async function authenticateAlbumAccess(
  albumId: number,
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ success: boolean; message: string }> {
  await delay(200) // Simulate authentication delay

  console.log("[v0] Authenticating album access:", { albumId, email })

  // Find access record
  const accessRecord = mockAlbumAccess.find((access) => access.album_id === albumId && access.email === email)

  if (!accessRecord) {
    console.log("[v0] No access record found")
    return { success: false, message: "Invalid email or password" }
  }

  // Simple password check (in production, use proper hashing)
  if (password !== accessRecord.password_hash) {
    console.log("[v0] Invalid password")
    return { success: false, message: "Invalid email or password" }
  }

  // Update access granted timestamp (simulate)
  accessRecord.access_granted_at = new Date().toISOString()

  console.log("[v0] Authentication successful")
  return { success: true, message: "Access granted" }
}

// Hash password utility (simplified for mock)
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or similar
  return password
}

// Close database connection (no-op for mock)
export async function closeDatabase(): Promise<void> {
  console.log("[v0] Database connection closed (mock)")
}

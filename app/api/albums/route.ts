import { type NextRequest, NextResponse } from "next/server"
import { getAllAlbums } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const albums = await getAllAlbums()

    // Transform database format to frontend format
    const transformedAlbums = albums.map((album) => ({
      id: album.id,
      coverImage: album.cover_image,
      clientNames: album.client_names,
      eventType: album.event_type,
      date: album.event_date
        ? new Date(album.event_date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "",
      category: album.category,
      isLocked: album.is_locked,
    }))

    return NextResponse.json({
      success: true,
      albums: transformedAlbums,
    })
  } catch (error) {
    console.error("Albums API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch albums",
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

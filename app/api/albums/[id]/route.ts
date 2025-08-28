import { type NextRequest, NextResponse } from "next/server"
import { getAlbumById, getAlbumImages } from "@/lib/database"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const albumId = Number.parseInt(params.id)

    if (isNaN(albumId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid album ID",
        },
        { status: 400 },
      )
    }

    // Get album details
    const album = await getAlbumById(albumId)

    if (!album) {
      return NextResponse.json(
        {
          success: false,
          error: "Album not found",
        },
        { status: 404 },
      )
    }

    // Get album images
    const images = await getAlbumImages(albumId)

    // Transform to frontend format
    const transformedAlbum = {
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
      images: images.map((img) => ({
        id: img.id,
        url: img.image_url,
        title: img.image_title,
        description: img.image_description,
      })),
    }

    return NextResponse.json({
      success: true,
      album: transformedAlbum,
    })
  } catch (error) {
    console.error("Album details API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch album details",
      },
      { status: 500 },
    )
  }
}

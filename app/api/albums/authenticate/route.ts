import { type NextRequest, NextResponse } from "next/server"
import { authenticateAlbumAccess, getAlbumById } from "@/lib/database"

interface AuthenticationRequest {
  albumId: number
  email: string
  password: string
}

// Validation function
function validateAuthData(data: AuthenticationRequest): string[] {
  const errors: string[] = []

  if (!data.albumId || isNaN(data.albumId)) {
    errors.push("Valid album ID is required")
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Valid email address is required")
  }

  if (!data.password || data.password.length < 1) {
    errors.push("Password is required")
  }

  return errors
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authData: AuthenticationRequest = body

    // Validate request data
    const validationErrors = validateAuthData(authData)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 },
      )
    }

    // Check if album exists
    const album = await getAlbumById(authData.albumId)
    if (!album) {
      return NextResponse.json(
        {
          success: false,
          error: "Album not found",
        },
        { status: 404 },
      )
    }

    // Check if album is locked
    if (!album.is_locked) {
      return NextResponse.json({
        success: true,
        message: "Album is public, no authentication required",
      })
    }

    // Get client IP and user agent for logging
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Authenticate access
    const authResult = await authenticateAlbumAccess(
      authData.albumId,
      authData.email,
      authData.password,
      clientIP,
      userAgent,
    )

    if (authResult.success) {
      return NextResponse.json({
        success: true,
        message: authResult.message,
        albumId: authData.albumId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: authResult.message,
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Album authentication error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed. Please try again.",
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

import { type NextRequest, NextResponse } from "next/server"

interface ContactFormData {
  name: string
  email: string
  phone: string
  eventType: string
  eventDate: string
  message: string
}

// Validation function
function validateFormData(data: ContactFormData): string[] {
  const errors: string[] = []

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long")
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Please provide a valid email address")
  }

  if (!data.eventType) {
    errors.push("Please select an event type")
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push("Message must be at least 10 characters long")
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push("Please provide a valid phone number")
  }

  return errors
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
}

// Format date for display
function formatDate(dateString: string): string {
  if (!dateString) return "Not specified"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Email template
function createEmailTemplate(data: ContactFormData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #1f2937; color: white; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; color: #f59e0b;">New Contact Form Submission</h1>
        <p style="margin: 10px 0 0 0; color: #d1d5db;">Rashmi Photography</p>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f2937; margin-top: 0;">Contact Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Name:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${data.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Phone:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${data.phone || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Event Type:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; text-transform: capitalize;">${data.eventType}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Event Date:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${formatDate(data.eventDate)}</td>
          </tr>
        </table>
        
        <h3 style="color: #1f2937; margin-top: 30px; margin-bottom: 15px;">Message:</h3>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #374151; line-height: 1.6;">${data.message.replace(/\n/g, "<br>")}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            This message was sent from the contact form on rohgantsphotography.com
          </p>
        </div>
      </div>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const formData: ContactFormData = body

    // Validate form data
    const validationErrors = validateFormData(formData)
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

    // Log the submission (in production, you'd save to database)
    console.log("New contact form submission:", {
      name: formData.name,
      email: formData.email,
      eventType: formData.eventType,
      timestamp: new Date().toISOString(),
    })

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Send auto-reply to customer

    // For now, we'll simulate email sending
    const emailTemplate = createEmailTemplate(formData)

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In production, you would use a service like:
    // - Resend
    // - SendGrid
    // - Nodemailer with SMTP
    // - AWS SES

    /*
    Example with Resend:
    
    import { Resend } from 'resend'
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: 'contact@rohgantsphotography.com',
      to: 'hello@rohgantsphotography.com',
      subject: `New Contact: ${formData.eventType} - ${formData.name}`,
      html: emailTemplate,
    })
    
    // Send auto-reply
    await resend.emails.send({
      from: 'hello@rohgantsphotography.com',
      to: formData.email,
      subject: 'Thank you for contacting Rohgant\'s Photography',
      html: autoReplyTemplate,
    })
    */

    return NextResponse.json({
      success: true,
      message: "Thank you for your message! I'll get back to you within 24 hours.",
    })
  } catch (error) {
    console.error("Contact form error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again or contact me directly.",
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

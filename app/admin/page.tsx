'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"

interface Enquiry {
  id: number
  name: string
  email: string
  phone: string
  event_type: string
  event_date: string
  message: string
  created_at: string
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    try {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/enquiries`)
      setEnquiries(res.data.data || [])
    } catch (err) {
      console.error(err)
      setError("Failed to fetch enquiries")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Enquiries</h1>

      {loading && <p>Loading enquiries...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && enquiries.length === 0 && <p>No enquiries found.</p>}

      <div className="space-y-4">
        {enquiries.map((enquiry) => (
          <div key={enquiry.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p><strong>Name:</strong> {enquiry.name}</p>
            <p><strong>Email:</strong> {enquiry.email}</p>
            <p><strong>Phone:</strong> {enquiry.phone || "-"}</p>
            <p><strong>Event Type:</strong> {enquiry.event_type}</p>
            <p><strong>Event Date:</strong> {enquiry.event_date || "-"}</p>
            <p><strong>Message:</strong> {enquiry.message}</p>
            <p className="text-gray-400 text-sm mt-2">
              <strong>Submitted At:</strong> {new Date(enquiry.created_at).toLocaleString()}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => alert("Feature not implemented: Reply to enquiry")}
                variant="outline"
                className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
              >
                Reply
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

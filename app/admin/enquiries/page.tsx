'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"

interface Enquiry {
  id: number
  name: string
  email: string
  phone: string
  eventType: string
  eventDate: string | null
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
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setError("Not authenticated. Please login first.")
        setLoading(false)
        return
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/enquiries`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )
      
      // Backend returns data in res.data.results
      setEnquiries(res.data.results || [])
    } catch (err: any) {
      console.error('Fetch error:', err)
      const errorMsg = err.response?.data?.message || "Failed to fetch enquiries"
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Enquiries</h1>
        <Button 
          onClick={fetchEnquiries} 
          className="bg-yellow-500 text-black hover:bg-yellow-600"
        >
          Refresh
        </Button>
      </div>

      {loading && <p className="text-yellow-500">Loading enquiries...</p>}
      {error && <p className="text-red-500 bg-red-900 p-3 rounded mb-4">{error}</p>}

      {!loading && enquiries.length === 0 && <p className="text-gray-400">No enquiries found.</p>}

      <div className="space-y-4">
        {enquiries.map((enquiry) => (
          <div key={enquiry.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-500 transition">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong className="text-yellow-400">Name:</strong> {enquiry.name}</p>
                <p><strong className="text-yellow-400">Email:</strong> <a href={`mailto:${enquiry.email}`} className="text-blue-400 hover:underline">{enquiry.email}</a></p>
                <p><strong className="text-yellow-400">Phone:</strong> {enquiry.phone || "-"}</p>
              </div>
              <div>
                <p><strong className="text-yellow-400">Event Type:</strong> {enquiry.eventType}</p>
                <p><strong className="text-yellow-400">Event Date:</strong> {enquiry.eventDate ? new Date(enquiry.eventDate).toLocaleDateString() : "-"}</p>
              </div>
            </div>
            <p className="mt-3"><strong className="text-yellow-400">Message:</strong></p>
            <p className="bg-gray-700 p-3 rounded mt-1 text-gray-100">{enquiry.message}</p>
            <p className="text-gray-400 text-sm mt-3">
              <strong>Submitted:</strong> {new Date(enquiry.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

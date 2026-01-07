'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface AddImagesClientProps {
  albumId: string
}

export default function AddImagesClient({ albumId }: AddImagesClientProps) {
  const [files, setFiles] = useState<File[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)

    if (selectedFiles.length > 0) {
      const previews = selectedFiles.map((file) => URL.createObjectURL(file))
      setPreviewUrls(previews)
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Please select files')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // Convert all files to base64
      const base64Images: string[] = []

      for (const file of files) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        base64Images.push(base64)
      }

      const payload = {
        images: base64Images,
      }

      const token = localStorage.getItem('adminToken')
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums/${albumId}/images`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )

      if (res.status === 200 || res.data.results?.uploaded) {
        setMessage(`✅ ${files.length} image(s) uploaded successfully!`)
        setFiles([])
        setPreviewUrls([])
        
        // Redirect back after 1.5 seconds
        setTimeout(() => {
          router.push(`/admin/albums/${albumId}/album-images`)
        }, 1500)
      } else {
        setMessage(res.data.message || 'Failed to upload images')
      }
    } catch (err: any) {
      console.error(err)
      const errorMsg = err.response?.data?.message || 'Upload failed'
      setMessage(`❌ ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-900 rounded-xl shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-4">Add Images to Album</h1>

      {message && (
        <p className={`mb-4 p-2 rounded ${message.includes('✅') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {message}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-gray-300 font-semibold">Select Images *</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-600 cursor-pointer"
          />
          <p className="text-xs text-gray-400 mt-1">Selected: {files.length} image(s)</p>
        </div>

        {/* Preview Section */}
        {previewUrls.length > 0 && (
          <div>
            <label className="block mb-2 text-gray-300 font-semibold">Preview ({previewUrls.length})</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`preview-${index}`}
                    className="w-full h-32 object-cover"
                  />
                  <p className="text-xs text-gray-400 p-2 truncate">{files[index]?.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={loading || files.length === 0}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Uploading...' : `Upload (${files.length})`}
          </button>

          <button
            onClick={() => router.back()}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}


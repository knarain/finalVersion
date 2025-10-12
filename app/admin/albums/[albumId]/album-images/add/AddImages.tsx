'use client'

import { useState } from 'react'
import axios from 'axios'

interface AddImagesClientProps {
  albumId: string
}

export default function AddImagesClient({ albumId }: AddImagesClientProps) {
  const [files, setFiles] = useState<FileList | null>(null)
  const [message, setMessage] = useState('')
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    setFiles(selectedFiles)

    if (selectedFiles) {
      const previews = Array.from(selectedFiles).map((file) =>
        URL.createObjectURL(file)
      )
      setPreviewUrls(previews)
    }
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Please select files')
      return
    }

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('images[]', files[i])
    }

    try {
      const token = localStorage.getItem('adminToken')

      await axios.post(
        `https://stg.rashmiphotography.com/backend/api/admin/albums/${albumId}/images`,
        formData,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )

      setMessage('✅ Images uploaded successfully!')
      setFiles(null)
      setPreviewUrls([])
    } catch (err) {
      console.error(err)
      setMessage('❌ Upload failed')
    }
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Add Images to Album {albumId}</h1>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="mb-4 block"
      />

      {/* Preview Section */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {previewUrls.map((url, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg overflow-hidden shadow"
            >
              <img
                src={url}
                alt={`preview-${index}`}
                className="w-full h-40 object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
      >
        Upload
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}

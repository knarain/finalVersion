"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createAlbum, type CreateAlbumData } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Select } from "@/components/ui/select"

export function CreateAlbumForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Main album data
  const [formData, setFormData] = useState<CreateAlbumData>({
    clientNames: "",
    eventType: "",
    date: new Date().toISOString().split("T")[0],
    category: "wedding",
    isLocked: false,
    albumAccess: [{
      email: "",
      password: "",
      expiresAt: ""
    }]
  })
  
  // UI state
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showAccessForm, setShowAccessForm] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAccessInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      albumAccess: [{
        ...prev.albumAccess![0],
        [name]: value
      }]
    }))
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCoverImage(e.target.files[0])
    }
  }

  const validateForm = (): boolean => {
    if (!formData.clientNames || !formData.eventType || !formData.date) {
      setError("Please fill in all required fields")
      return false
    }

    if (formData.isLocked) {
      const access = formData.albumAccess?.[0]
      if (!access?.email || !access?.password) {
        setError("Email and password are required for private albums")
        return false
      }
      if (access.password !== confirmPassword) {
        setError("Passwords do not match")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const albumData: CreateAlbumData = {
        ...formData,
        coverImage: coverImage || undefined,
      }

      const result = await createAlbum(albumData)

      if (result.success) {
        router.refresh() // Refresh the page to show the new album
        resetForm()
      } else {
        setError(result.error || "Failed to create album")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      clientNames: "",
      eventType: "",
      date: new Date().toISOString().split("T")[0],
      category: "wedding",
      isLocked: false,
      albumAccess: [{
        email: "",
        password: "",
        expiresAt: ""
      }]
    })
    setCoverImage(null)
    setConfirmPassword("")
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Create New Album</h2>
        
        {/* Basic Album Information */}
        <div className="grid gap-4">
          <div>
            <Label htmlFor="clientNames">Client Names *</Label>
            <Input
              id="clientNames"
              name="clientNames"
              value={formData.clientNames}
              onChange={handleInputChange}
              required
              placeholder="Enter client names"
            />
          </div>

          <div>
            <Label htmlFor="eventType">Event Type *</Label>
            <Input
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              required
              placeholder="Wedding, Engagement, etc."
            />
          </div>

          <div>
            <Label htmlFor="date">Event Date *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="wedding">Wedding</option>
              <option value="engagement">Engagement</option>
              <option value="pre-wedding">Pre-Wedding</option>
              <option value="reception">Reception</option>
            </select>
          </div>

          <div>
            <Label htmlFor="coverImage">Cover Image</Label>
            <Input
              id="coverImage"
              name="coverImage"
              type="file"
              onChange={handleCoverImageChange}
              accept="image/*"
            />
          </div>
        </div>

        {/* Album Access Control */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isLocked"
              checked={formData.isLocked}
              onCheckedChange={(checked) => {
                setFormData(prev => ({
                  ...prev,
                  isLocked: checked as boolean
                }))
                setShowAccessForm(checked as boolean)
              }}
            />
            <Label htmlFor="isLocked">Make this album private</Label>
          </div>

          {showAccessForm && (
            <div className="space-y-4 pl-6">
              <div>
                <Label htmlFor="email">Access Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.albumAccess?.[0]?.email}
                  onChange={handleAccessInputChange}
                  required={formData.isLocked}
                  placeholder="Enter client's email"
                />
              </div>

              <div>
                <Label htmlFor="password">Access Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.albumAccess?.[0]?.password}
                  onChange={handleAccessInputChange}
                  required={formData.isLocked}
                  placeholder="Create a password"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={formData.isLocked}
                  placeholder="Confirm password"
                />
              </div>

              <div>
                <Label htmlFor="expiresAt">Access Expiry Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="date"
                  value={formData.albumAccess?.[0]?.expiresAt}
                  onChange={handleAccessInputChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Creating Album...
              </div>
            ) : (
              "Create Album"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
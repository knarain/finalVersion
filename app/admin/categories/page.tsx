'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Category {
  id: number
  name: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      setCategories(res.data.results || [])
      setError("")
    } catch (err) {
      console.error(err)
      setError("Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCategoryName.trim()) {
      setError("Category name cannot be empty")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      const token = localStorage.getItem('adminToken')

      if (!token) {
        setError("Admin token not found. Please log in again.")
        return
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/categories`,
        { name: newCategoryName },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      setSuccess("Category added successfully!")
      setNewCategoryName("")
      setIsDialogOpen(false)
      fetchCategories()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to add category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return
    }

    try {
      setDeleteLoading(id)
      setError("")
      const token = localStorage.getItem('adminToken')

      if (!token) {
        setError("Admin token not found. Please log in again.")
        setDeleteLoading(null)
        return
      }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      setSuccess("Category deleted successfully!")
      fetchCategories()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to delete category")
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-gray-400 text-sm mt-2">Manage all album categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <Input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Wedding, Portrait, Event"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Adding..." : "Add Category"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setNewCategoryName("")
                    setError("")
                  }}
                  className="bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p className="text-center text-gray-400">Loading categories...</p>}
      {error && <p className="text-red-500 mb-4 p-3 bg-red-900/20 rounded">{error}</p>}
      {success && <p className="text-green-500 mb-4 p-3 bg-green-900/20 rounded">{success}</p>}

      {!loading && categories.length === 0 && (
        <p className="text-center text-gray-400">No categories found. Create one to get started!</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between hover:border-blue-500 transition"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                {category.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-semibold">{category.name}</p>
            </div>
            <Button
              onClick={() => handleDeleteCategory(category.id)}
              disabled={deleteLoading === category.id}
              className="bg-red-600 hover:bg-red-700 text-sm"
            >
              {deleteLoading === category.id ? "Deleting..." : "Delete"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

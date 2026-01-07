'use client'
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleLogout = () => {
    // Clear admin info from localStorage
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')

    // Redirect to login page
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 flex items-center justify-between shadow-md">
        <div className="flex gap-6">
          {/* Dashboard */}
          <Link href="/admin" className="hover:text-yellow-400 transition-colors">
            Dashboard
          </Link>

          {/* Enquiries */}
          <Link href="/admin/enquiries" className="hover:text-yellow-400 transition-colors">
            Enquiries
          </Link>

          {/* Albums (Gallery Management) */}
          <Link href="/admin/albums" className="hover:text-yellow-400 transition-colors">
            Albums
          </Link>

          {/* Categories */}
          <Link href="/admin/categories" className="hover:text-yellow-400 transition-colors">
            Categories
          </Link>

          {/* Settings */}
          <Link href="/admin/settings" className="hover:text-yellow-400 transition-colors">
            Settings
          </Link>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Logout
        </button>
      </nav>

      {/* Page Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

'use client';
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  const handleLogout = () => {
    // Clear admin info from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    window.location.href = '/login/login'; // redirect to login page
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <nav className="bg-gray-800 p-4 flex items-center justify-between shadow-md">
        <div className="flex gap-6">
          <Link href="/admin/admin-dashboard" className="hover:text-yellow-400 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/add-album" className="hover:text-yellow-400 transition-colors">
            Add Album
          </Link>
          <Link href="/admin/add-images" className="hover:text-yellow-400 transition-colors">
            Add Images
          </Link>
          <Link href="/admin/list-albums" className="hover:text-yellow-400 transition-colors">
            View Albums
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Logout
        </button>
      </nav>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

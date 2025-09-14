'use client';
import Link from 'next/link';

export default function AdminDashboard() {
  const username = localStorage.getItem('adminUsername');

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Welcome, {username}</h1>
      <div className="space-y-4">
        <Link href="/admin/add-album" className="block p-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600">
          Add Album
        </Link>
        <Link href="/admin/add-images" className="block p-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600">
          Add Images
        </Link>
        <Link href="/admin/list-albums" className="block p-4 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600">
          View Albums
        </Link>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('adminUsername');
    setUsername(storedUsername);
  }, []);

  return (
    <div className="bg-gray-900 text-white flex flex-col items-center justify-center p-6" style={{ minHeight: '80vh' }}>
      <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
        Welcome, {username || 'Admin'}
      </h1>
      <p className="text-gray-300 text-xl">
        You are now logged in to the admin panel.
      </p>
    </div>
  );
}

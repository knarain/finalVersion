'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/login`, {
        username,
        password,
      });

      if (res.data.success && res.data.token) {
        // ✅ Save credentials
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminUsername', res.data.admin.username);

        // ✅ Redirect to /admin (this will automatically send to dashboard)
        router.push('/admin');
      } else {
        setError(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
        <h1 className="text-3xl font-extrabold mb-6 text-center">Admin Login</h1>

        {error && <div className="bg-red-900 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-600 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

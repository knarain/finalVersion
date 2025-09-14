'use client';
import { useState } from 'react';
import axios from 'axios';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:8080/api/admin/login', {
        username,
        password,
      });

      if (res.data.success && res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminUsername', res.data.admin.username);
        window.location.href = '/admin/dashboard';
      } else {
        setError(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
        <h1 className="text-3xl font-extrabold mb-6 text-center">Admin Login</h1>
        {error && <div className="bg-red-900 px-4 py-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
              required
            />
          </div>
          <div>
            <label>Password</label>
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
            className="w-full py-2 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

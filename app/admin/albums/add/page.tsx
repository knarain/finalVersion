'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AddAlbum() {
  const [clientNames, setClientNames] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      let token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
      if (!token) {
        token = localStorage.getItem('adminToken') || ''
      }
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/albums/categories`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        withCredentials: true,
      });
      if (res.data.results) {
        setCategories(res.data.results);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!clientNames || !categoryId || !coverImage) {
      setMessage('Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result as string;

        const payload = {
          clientNames,
          categoryId: parseInt(categoryId),
          eventDate: eventDate || null,
          isLocked: isLocked ? 1 : 0,
          image: base64Image,
        };

        let token = document.cookie.split('; ').find(row => row.startsWith('adminToken='))?.split('=')[1]
        if (!token) {
          token = localStorage.getItem('adminToken') || ''
        }
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/albums`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            withCredentials: true,
          }
        );

        if (res.status === 201 || res.data.results?.id) {
          setMessage('Album created successfully!');
          setClientNames('');
          setCategoryId('');
          setEventDate('');
          setCoverImage(null);
          setCoverImagePreview('');
          setIsLocked(false);
          setTimeout(() => {
            router.push('/admin/albums');
          }, 1500);
        } else {
          setMessage(res.data.message || 'Failed to create album.');
        }
      };
      reader.readAsDataURL(coverImage);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setMessage('You do not have permission');
      } else {
        const errorMsg = err.response?.data?.message || 'Server error. Try again.';
        setMessage(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-xl shadow-lg text-white">
      <h1 className="text-3xl font-bold mb-6">Create New Album</h1>
      
      {message && (
        <p className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 text-gray-300 font-medium">Client Names *</label>
          <input
            type="text"
            value={clientNames}
            onChange={(e) => setClientNames(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-yellow-500 focus:outline-none"
            placeholder="Enter client names"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-300 font-medium">Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-yellow-500 focus:outline-none"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-gray-300 font-medium">Event Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-yellow-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-2 text-gray-300 font-medium">Cover Image *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 focus:border-yellow-500 focus:outline-none"
            required
          />
          {coverImagePreview && (
            <div className="mt-4">
              <img
                src={coverImagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-700"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
          <input
            type="checkbox"
            id="isLocked"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
          <label htmlFor="isLocked" className="text-gray-300 cursor-pointer">
            Lock Album (requires authentication)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Album...' : 'Create Album'}
        </button>
      </form>
    </div>
  );
}

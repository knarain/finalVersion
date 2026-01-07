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

  const loadCategories = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`);
      if (res.data.results) {
        setCategories(res.data.results);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      // Show preview
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
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result as string;

        const payload = {
          clientNames,
          categoryId: parseInt(categoryId),
          eventDate: eventDate || null,
          isLocked: isLocked ? 1 : 0,
          image: base64Image, // Send as base64
        };

        const token = localStorage.getItem('adminToken');
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/albums`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (res.status === 201 || res.data.results?.id) {
          setMessage('Album created successfully!');
          // Reset form
          setClientNames('');
          setCategoryId('');
          setEventDate('');
          setCoverImage(null);
          setCoverImagePreview('');
          setIsLocked(false);
          // Redirect after 1.5 seconds
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
      const errorMsg = err.response?.data?.message || 'Server error. Try again.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-xl shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-4">Add New Album</h1>
      {message && (
        <p className={`mb-4 p-2 rounded ${message.includes('success') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client Name */}
        <div>
          <label className="block mb-1 text-gray-300">Client Names *</label>
          <input
            type="text"
            value={clientNames}
            onChange={(e) => setClientNames(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
            required
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block mb-1 text-gray-300">Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
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

        {/* Event Date */}
        <div>
          <label className="block mb-1 text-gray-300">Event Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block mb-1 text-gray-300">Cover Image *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-gray-300"
            required
          />
          {coverImagePreview && (
            <div className="mt-3">
              <img
                src={coverImagePreview}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg border border-gray-700"
              />
            </div>
          )}
        </div>

        {/* Lock Album */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-gray-300">
            Lock Album (requires authentication)
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 text-black font-bold py-2 rounded-xl hover:bg-yellow-600 transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Album'}
        </button>
      </form>
    </div>
  );
}

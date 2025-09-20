'use client'
import { useState } from 'react';
import axios from 'axios';

export default function AddAlbum() {
  const [clientNames, setClientNames] = useState('');
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!clientNames || !eventType) {
      setMessage('Please fill all required fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('client_names', clientNames);
      formData.append('event_type', eventType);
      if (date) formData.append('date', date);
      if (coverImage) formData.append('cover_image', coverImage);
      formData.append('is_locked', isLocked ? '1' : '0');

      const res = await axios.post('http://localhost:8080/api/admin/add-album.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setMessage('Album added successfully!');
        setClientNames('');
        setEventType('');
        setDate('');
        setCoverImage(null);
        setIsLocked(false);
      } else {
        setMessage(res.data.message || 'Failed to add album.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error. Try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-xl shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-4">Add New Album</h1>
      {message && <p className="mb-4 text-yellow-400">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-300">Client Names *</label>
          <input
            type="text"
            value={clientNames}
            onChange={e => setClientNames(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-300">Event Type *</label>
          <input
            type="text"
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-300">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-300">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setCoverImage(e.target.files?.[0] ?? null)}
            className="w-full text-gray-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isLocked}
            onChange={e => setIsLocked(e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-gray-300">Lock Album (requires authentication)</label>
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-500 text-black font-bold py-2 rounded-xl hover:bg-yellow-600 transition"
        >
          Add Album
        </button>
      </form>
    </div>
  );
}

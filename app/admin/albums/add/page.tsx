'use client';
import { useState } from 'react';
import axios from 'axios';

export default function AddAlbum() {
  const [clientNames, setClientNames] = useState('');
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState('');

  const eventTypes = [
    { id: 'engagement', name: 'Engagement' },
    { id: 'wedding', name: 'Wedding' },
    { id: 'sreemantham', name: 'Sreemantham' },
    { id: 'cradle ceremony', name: 'Cradle Ceremony' },
    { id: 'pre-birthday', name: 'Pre-Birthday' },
    { id: 'birthday', name: 'Birthday' },
    { id: 'dothi ceremony', name: 'Dothi Ceremony' },
    { id: 'house warming', name: 'House Warming' },
    { id: 'photoshoot', name: 'Photoshoot' },
    { id: 'anniversary', name: 'Anniversary' },
    { id: 'pre-wedding', name: 'Pre-Wedding' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!clientNames || !eventType) {
      setMessage('Please fill all required fields.');
      return;
    }

    try {
      let coverImageBase64 = null;
      if (coverImage) {
        coverImageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(coverImage);
        });
      }

      const payload = {
        clientNames,
        eventType,
        date,
        isLocked: isLocked ? 1 : 0,
        coverImage: coverImageBase64,
      };

      const token = localStorage.getItem('adminToken');
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/albums`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

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

        {/* Event Type Dropdown */}
        <div>
          <label className="block mb-1 text-gray-300">Event Type *</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            required
          >
            <option value="">Select Event Type</option>
            {eventTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 text-gray-300">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block mb-1 text-gray-300">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
            className="w-full text-gray-300"
          />
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
          className="w-full bg-yellow-500 text-black font-bold py-2 rounded-xl hover:bg-yellow-600 transition"
        >
          Add Album
        </button>
      </form>
    </div>
  );
}

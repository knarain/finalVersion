'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddImages() {
  const [albums, setAlbums] = useState<{id:number, client_names:string}[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<number | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // fetch albums to select
    axios.get('http://localhost:8080/api/admin/list-albums.php')
      .then(res => setAlbums(res.data.data || []))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!selectedAlbum || !images) {
      setMessage('Please select an album and images.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('album_id', selectedAlbum.toString());
      Array.from(images).forEach(file => formData.append('images[]', file));

      const res = await axios.post('http://localhost:8080/api/admin/add-album-images.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setMessage('Images uploaded successfully!');
        setImages(null);
      } else {
        setMessage(res.data.message || 'Failed to upload images.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error. Try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 rounded-xl shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-4">Add Images to Album</h1>
      {message && <p className="mb-4 text-yellow-400">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-300">Select Album</label>
          <select
            value={selectedAlbum ?? ''}
            onChange={e => setSelectedAlbum(parseInt(e.target.value))}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
            required
          >
            <option value="">-- Select Album --</option>
            {albums.map(a => (
              <option key={a.id} value={a.id}>{a.client_names}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-300">Select Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setImages(e.target.files)}
            className="w-full text-gray-300"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-yellow-500 text-black font-bold py-2 rounded-xl hover:bg-yellow-600 transition"
        >
          Upload Images
        </button>
      </form>
    </div>
  );
}

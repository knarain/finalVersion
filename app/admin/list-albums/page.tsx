'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ListAlbums() {
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/admin/list-albums.php')
      .then(res => setAlbums(res.data.data || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Albums</h1>
      <div className="space-y-4">
        {albums.length === 0 && <p>No albums found.</p>}
        {albums.map(album => (
          <div key={album.id} className="p-4 bg-gray-800 rounded-lg">
            <p><strong>Client:</strong> {album.client_names}</p>
            <p><strong>Event:</strong> {album.event_type}</p>
            <p><strong>Date:</strong> {album.date}</p>
            <p><strong>Locked:</strong> {album.is_locked ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

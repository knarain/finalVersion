'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export function ListImages({ albumId }: { albumId: number }) {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/albums/${albumId}/images`)
      .then(res => setImages(res.data.data || []))
      .catch(err => console.error(err));
  }, [albumId]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Album Images</h1>
      <div className="grid grid-cols-3 gap-4">
        {images.map(img => (
          <div key={img.id} className="bg-gray-800 rounded-lg overflow-hidden">
            <img src={img.fileUrl} alt={img.caption} className="w-full h-48 object-cover"/>
            <p className="p-2 text-sm">{img.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

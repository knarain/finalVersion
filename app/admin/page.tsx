
'use client';
import { useState, useEffect } from 'react';
import { jwtDecode, JwtPayload } from 'jwt-decode'; // ✅ Correct import

interface Album {
  id: number;
  clientNames: string;
}

interface MyJwtPayload extends JwtPayload {
  email: string;
}

export default function AdminPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');

  // --------------------------
  // AUTH CHECK & GET EMAIL
  // --------------------------
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        setUserEmail(decoded.email);

        const res = await fetch('http://localhost/rashmi-backend/admin/verify-token.php', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } catch {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    };

    checkAuth();
  }, []);

  // --------------------------
  // FETCH ALBUMS
  // --------------------------
  useEffect(() => {
    const fetchAlbums = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost/rashmi-backend/albums/list.php', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setAlbums(data.albums || []);
        } else {
          setError(data.message || 'Failed to load albums');
        }
      } catch {
        setError('Error fetching albums');
      }
    };

    fetchAlbums();
  }, []);

  // --------------------------
  // LOGOUT
  // --------------------------
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // --------------------------
  // FILE & CAPTION HANDLERS
  // --------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
      setCaptions(new Array(e.target.files.length).fill(''));
    }
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setCaptions(prev => {
      const newCaptions = [...prev];
      newCaptions[index] = caption;
      return newCaptions;
    });
  };

  // --------------------------
  // UPLOAD IMAGES
  // --------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || !selectedAlbumId) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('album_id', selectedAlbumId.toString());
      Array.from(files).forEach((file, i) => {
        formData.append('images[]', file);
        formData.append(`captions[${i}]`, captions[i] || '');
      });

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost/rashmi-backend/admin/upload-images.php', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setFiles(null);
        setCaptions([]);
        alert('Images uploaded successfully');
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div className="min-h-screen p-8 bg-black text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {userEmail && <span className="text-gray-300">Welcome, {userEmail}</span>}
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-700 hover:bg-red-800 rounded-lg text-white font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 shadow-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-800">
          {/* Album Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Album</label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500"
              value={selectedAlbumId || ''}
              onChange={e => setSelectedAlbumId(Number(e.target.value))}
              required
            >
              <option value="">Choose an album</option>
              {albums.map(album => (
                <option key={album.id} value={album.id}>
                  {album.clientNames}
                </option>
              ))}
            </select>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="mt-1 block w-full text-white file:bg-gray-700 file:text-white file:border file:border-gray-600 file:rounded-lg file:px-3 file:py-2 file:mr-2 hover:file:bg-gray-600"
            />
          </div>

          {/* Image Previews */}
          {files && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {Array.from(files).map((file, index) => {
                const url = URL.createObjectURL(file);
                return (
                  <div key={file.name} className="bg-gray-800 rounded-lg p-2 shadow-lg flex flex-col items-center">
                    <img src={url} alt={file.name} className="w-full h-32 object-cover rounded-md mb-2" />
                    <p className="text-sm text-gray-300 truncate w-full text-center">{file.name}</p>
                    <input
                      type="text"
                      placeholder="Add caption (optional)"
                      value={captions[index]}
                      onChange={e => handleCaptionChange(index, e.target.value)}
                      disabled={isUploading}
                      className="mt-1 block w-full shadow-sm sm:text-sm border border-gray-700 rounded-lg bg-gray-900 text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!files || !selectedAlbumId || isUploading}
            className="w-full py-3 px-4 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 disabled:bg-gray-700 shadow-lg transition-colors duration-200"
          >
            {isUploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </form>
      </div>
    </div>
  );
}

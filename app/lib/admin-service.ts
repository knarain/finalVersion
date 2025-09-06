// admin-service.ts
export const adminService = {
  login: async (email: string, password: string) => {
    // existing login logic
  },

  uploadImages: async (albumId: number, imageFiles: FileList, captions: string[], token: string) => {
    const formData = new FormData();
    formData.append('album_id', albumId.toString());

    // ✅ Use 'images' instead of 'images[]' to match PHP
    Array.from(imageFiles).forEach((file, i) => {
      formData.append('images', file);
      formData.append(`captions[${i}]`, captions[i] || '');
    });

    const res = await fetch('http://localhost/rashmi-backend/admin/upload-images.php', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    return res.json();
  },

  // ✅ Add this method
  getAlbumImages: async (albumId: number, token: string) => {
    const res = await fetch(`http://localhost/rashmi-backend/admin/get-album-images.php?album_id=${albumId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // ✅ PHP returns { success: true, data: [...] }
    return res.json(); 
  },
};

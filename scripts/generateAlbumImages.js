// Usage: node scripts/generateAlbumImages.js <albumId> <folderName>
// Example: node scripts/generateAlbumImages.js 7 Akhil-Engagement

const fs = require('fs');
const path = require('path');

const albumId = process.argv[2] || 1;
const folderName = process.argv[3] || 'Akhil-Engagement';
const imagesDir = path.join(__dirname, '..', 'public', 'images', folderName);

let files = [];
try {
  files = fs.readdirSync(imagesDir);
} catch (err) {
  console.error('Error reading images folder:', err);
  process.exit(1);
}

const now = new Date().toISOString();
const albumImages = files.map((file, idx) => ({
  id: Date.now() + idx, // Unique ID
  album_id: Number(albumId),
  image_url: `/images/${folderName}/${file}`,
  image_title: path.parse(file).name,
  image_description: '',
  sort_order: idx + 1,
  created_at: now,
}));

console.log(JSON.stringify(albumImages, null, 2));
// Copy the output and paste into your mockAlbumImages array in lib/database.ts

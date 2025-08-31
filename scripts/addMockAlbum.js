// Usage: node scripts/addMockAlbum.js
// This script will prompt for album details, scan an image folder, and output code snippets for mockAlbums and mockAlbumImages.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

(async () => {
  console.log('--- Add New Mock Album Automation ---');
  const albumId = await ask('Album ID (number): ');
  const clientNames = await ask('Client Names: ');
  const eventType = await ask('Event Type: ');
  const eventDate = await ask('Event Date (YYYY-MM-DD): ');
  const category = await ask('Category: ');
  const folderName = await ask('Image Folder (in public/images/): ');
  const isLocked = await ask('Is Locked? (true/false): ');

  const imagesDir = path.join(__dirname, '..', 'public', 'images', folderName);
  let files = [];
  try {
    files = fs.readdirSync(imagesDir);
  } catch (err) {
    console.error('Error reading images folder:', err);
    rl.close();
    process.exit(1);
  }

  const now = new Date().toISOString();
  const albumImages = files.map((file, idx) => ({
    id: Date.now() + idx,
    album_id: Number(albumId),
    image_url: `/images/${folderName}/${file}`,
    image_title: path.parse(file).name,
    image_description: '',
    sort_order: idx + 1,
    created_at: now,
  }));

  const albumCode = `{
  id: ${albumId},
  client_names: "${clientNames}",
  event_type: "${eventType}",
  event_date: "${eventDate}",
  category: "${category}",
  cover_image: "${albumImages.length > 0 ? albumImages[0].image_url : ''}",
  is_locked: ${isLocked === 'true'},
  created_at: "${now}",
  updated_at: "${now}"
}`;

  console.log('\n--- Paste this into mockAlbums ---\n');
  console.log(albumCode);
  console.log('\n--- Paste these into mockAlbumImages ---\n');
  console.log(JSON.stringify(albumImages, null, 2));

  rl.close();
})();

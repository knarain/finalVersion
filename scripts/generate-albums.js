import fs from "fs";
import path from "path";
import sharp from "sharp";

const INPUT_DIR = path.join(process.cwd(), "public", "images");
const OUTPUT_DIR = path.join(process.cwd(), "public", "generated");
const DATA_DIR = path.join(process.cwd(), "public", "data");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const albums = [];

const generateAlbums = async () => {
  const albumFolders = fs.readdirSync(INPUT_DIR);

  for (const [albumIndex, albumName] of albumFolders.entries()) {
    const albumPath = path.join(INPUT_DIR, albumName);
    if (!fs.statSync(albumPath).isDirectory()) continue;

    const outputAlbumPath = path.join(OUTPUT_DIR, albumName);
    if (!fs.existsSync(outputAlbumPath)) fs.mkdirSync(outputAlbumPath, { recursive: true });

    const files = fs.readdirSync(albumPath).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
    if (files.length === 0) continue;

    const images = [];

    for (const [imageIndex, file] of files.entries()) {
      const inputFile = path.join(albumPath, file);
      const baseName = path.parse(file).name;

      const webpFile = path.join(outputAlbumPath, `${baseName}.webp`);
      const compressedFile = path.join(outputAlbumPath, `${baseName}-compressed.jpg`);

      // Generate WebP (mobile version)
      await sharp(inputFile).webp({ quality: 70 }).toFile(webpFile);

      // Generate compressed JPG (high quality download)
      await sharp(inputFile).jpeg({ quality: 70 }).toFile(compressedFile);

      // Push only WebP into JSON
      images.push({
        id: imageIndex + 1,
        url: `/generated/${albumName}/${baseName}.webp`,
        title: `${albumName} - ${imageIndex + 1}`,
        description: albumName
      });
    }

    albums.push({
      id: albumIndex + 1,
      coverImage: images[0].url, // First image as cover
      clientNames: albumName,    // Album folder name as clientNames
      eventType: albumName,      // Can be customized later
      date: new Date().toDateString(), // Default to today
      category: albumName.toLowerCase(),
      isLocked: false,
      images
    });
  }

  fs.writeFileSync(path.join(DATA_DIR, "albums.json"), JSON.stringify(albums, null, 2));
  console.log("✅ albums.json generated in /public/data/");
};

generateAlbums();

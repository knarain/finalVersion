// scripts/generate-albums.js
import fs from "fs";
import path from "path";
import sharp from "sharp";

const INPUT_DIR = path.join(process.cwd(), "public", "albums"); // raw albums
const OUTPUT_DIR = path.join(process.cwd(), "public", "generated"); // compressed
const DATA_FILE = path.join(process.cwd(), "public", "data", "albums.json");

function titleFromFilename(file) {
  return path.basename(file, path.extname(file)).replace(/[-_]/g, " ");
}

async function processImage(albumName, file) {
  const inputPath = path.join(INPUT_DIR, albumName, file);
  const baseName = path.parse(file).name;

  const albumOutputDir = path.join(OUTPUT_DIR, albumName);
  if (!fs.existsSync(albumOutputDir)) fs.mkdirSync(albumOutputDir, { recursive: true });

  const jpgFile = `${baseName}.jpg`;
  const webpFile = `${baseName}.webp`;

  const jpgOutput = path.join(albumOutputDir, jpgFile);
  const webpOutput = path.join(albumOutputDir, webpFile);

  // 70% JPG
  await sharp(inputPath).jpeg({ quality: 70 }).toFile(jpgOutput);
  // WebP
  await sharp(inputPath).webp({ quality: 70 }).toFile(webpOutput);

  return {
    displayUrl: `/generated/${albumName}/${webpFile}`, // always display webp
    download: {
      high: `/generated/${albumName}/${jpgFile}`, // 70% jpg
      mobile: `/generated/${albumName}/${webpFile}`, // webp
    },
    title: titleFromFilename(file),
    description: `${titleFromFilename(file)} from ${albumName}`,
  };
}

async function main() {
  const albums = [];
  let albumId = 1;

  for (const albumName of fs.readdirSync(INPUT_DIR)) {
    const albumPath = path.join(INPUT_DIR, albumName);
    if (!fs.lstatSync(albumPath).isDirectory()) continue;

    const files = fs.readdirSync(albumPath).filter(f => /\.(jpe?g|png)$/i.test(f));
    const images = [];

    for (let i = 0; i < files.length; i++) {
      const processed = await processImage(albumName, files[i]);
      images.push({ id: i + 1, ...processed });
    }

    if (images.length === 0) continue;

    albums.push({
      id: albumId++,
      coverImage: images[0].displayUrl,
      clientNames: albumName.replace(/[-_]/g, " "),
      eventType: "event",
      date: new Date().toDateString(),
      category: "general",
      isLocked: false,
      images,
    });
  }

  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(albums, null, 2));

  console.log("✅ albums.json generated with compression + webp!");
}

main();

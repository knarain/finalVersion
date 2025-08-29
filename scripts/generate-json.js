import fs from "fs";
import path from "path";

// Dummy static data (replace with real later)
const albums = [
  {
    id: 1,
    coverImage: "/images/album1.jpg",
    clientNames: "John & Jane",
    eventType: "Wedding",
    date: "August 12, 2023",
    category: "wedding",
    isLocked: false,
    images: [
      { id: 1, url: "/images/a1.jpg", title: "Photo 1", description: "Beautiful moment" },
      { id: 2, url: "/images/a2.jpg", title: "Photo 2", description: "Family portrait" },
    ],
  },
  {
    id: 2,
    coverImage: "/images/album2.jpg",
    clientNames: "Alex & Mary",
    eventType: "Birthday",
    date: "May 5, 2023",
    category: "birthday",
    isLocked: false,
    images: [
      { id: 1, url: "/images/b1.jpg", title: "Cake", description: "Birthday cake" },
      { id: 2, url: "/images/b2.jpg", title: "Party", description: "Friends having fun" },
    ],
  },
];

const dir = path.join(process.cwd(), "public", "data");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(path.join(dir, "albums.json"), JSON.stringify(albums, null, 2));

console.log("✅ albums.json generated in /public/data/");

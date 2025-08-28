import fs from "fs"
import path from "path"

export async function getAlbums() {
  if (typeof window !== "undefined") {
    // Stop running on the client
    return []
  }

  const imagesDir = path.join(process.cwd(), "public/images")
  const files = fs.readdirSync(imagesDir)

  return files.map((file) => ({
    id: file,
    title: file.split(".")[0],
    url: `/images/${file}`,
  }))
}

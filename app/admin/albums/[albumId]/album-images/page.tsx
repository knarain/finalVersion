// app/albums/[albumId]/album-images/page.tsx
import AlbumImagesClient from './AlbumImagesClient'

interface PageProps {
  params: {
    albumId: string
  }
}

// This function tells Next.js which album pages to pre-render
export async function generateStaticParams() {
  const res = await fetch('http://localhost:8080/api/albums') // fetch all albums
  const data = await res.json()

  return data.items.map((album: any) => ({
    albumId: album.id.toString()
  }))
}

export default function Page({ params }: PageProps) {
  return <AlbumImagesClient albumId={params.albumId} />
}

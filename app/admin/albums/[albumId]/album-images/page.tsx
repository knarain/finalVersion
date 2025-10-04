import AlbumImagesClient from './AlbumImagesClient'
import { generateStaticParams } from './generateStaticParams'

interface PageProps {
  params: {
    albumId: string
  }
}

export { generateStaticParams }





export default async function Page({ params }: { params: Promise<{ albumId: string }> }) {
  const resolvedParams = await params;
  return <AlbumImagesClient albumId={resolvedParams.albumId} />;
}

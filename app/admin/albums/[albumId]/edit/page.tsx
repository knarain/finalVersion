import EditAlbumClient from './edit-client'
import { generateStaticParams } from './generateStaticParams'

export { generateStaticParams }

export default async function Page({ params }: { params: Promise<{ albumId: string }> }) {
  const resolvedParams = await params
  return <EditAlbumClient />
}
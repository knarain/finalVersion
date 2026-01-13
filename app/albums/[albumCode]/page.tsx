import AlbumClient from './album-client'
import { generateStaticParams } from './generateStaticParams'

export { generateStaticParams }

export default async function Page({ params }: { params: Promise<{ albumCode: string }> }) {
  const resolvedParams = await params
  return <AlbumClient />
}
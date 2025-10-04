import AddImages from './AddImages'
import { generateStaticParams as staticParams } from './generateStaticParams'

// Props from Next.js App Router
interface AddImagesPageProps {
  params: { albumId: string }
}

// Pre-generate static album pages
export { staticParams as generateStaticParams }

export default function AddImagesPage({ params }: AddImagesPageProps) {
  return <AddImages albumId={params.albumId} />
}

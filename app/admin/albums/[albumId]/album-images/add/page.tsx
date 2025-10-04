import AddImages from './AddImages'
import { generateStaticParams as staticParams } from './generateStaticParams'

// ✅ Re-export generateStaticParams
export { staticParams as generateStaticParams }

// ✅ Correct typing for params
export default function AddImagesPage({
  params,
}: {
  params: Promise<{ albumId: string }>; // Adjusted to match the expected Promise type
}) {
  return (
    <>
      {params.then(({ albumId }) => (
        <AddImages albumId={albumId} />
      ))}
    </>
  );
}

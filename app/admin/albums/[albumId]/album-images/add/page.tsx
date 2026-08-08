import AddImages from "./AddImages";
import { generateStaticParams } from "./generateStaticParams";

export { generateStaticParams };

export default async function AddImagesPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;

  return (
    <main className="min-h-screen p-6">
      <AddImages albumId={albumId} />
    </main>
  );
}

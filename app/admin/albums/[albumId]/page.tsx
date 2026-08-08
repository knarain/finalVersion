import { AdminAlbumAuthForm } from "./AdminAlbumAuthForm";
import { generateStaticParams } from "./generateStaticParams";

export { generateStaticParams };

export default async function Page({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;

  return (
    <main className="min-h-screen p-6">
      <AdminAlbumAuthForm albumId={Number(albumId)} />
    </main>
  );
}

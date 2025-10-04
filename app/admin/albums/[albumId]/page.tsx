import { useParams } from "next/navigation";
import { AdminAlbumAuthForm } from "./AdminAlbumAuthForm";

import { generateStaticParams } from "./generateStaticParams";

interface PageProps {
  params: {
    albumId: string;
  };
}

export { generateStaticParams };

export default async function Page({ params }: { params: Promise<{ albumId: string }> }) {
  const resolvedParams = await params;
  return <AdminAlbumAuthForm albumId={Number(resolvedParams.albumId)} />;
}


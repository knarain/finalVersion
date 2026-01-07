import { useParams } from "next/navigation";
import { AdminAlbumAuthForm } from "./AdminAlbumAuthForm";
import { AlbumCredentialsManager } from "./AlbumCredentialsManager";

import { generateStaticParams } from "./generateStaticParams";

interface PageProps {
  params: {
    albumId: string;
  };
}

export { generateStaticParams };

export default async function Page({ params }: { params: Promise<{ albumId: string }> }) {
  const resolvedParams = await params;
  return <AlbumCredentialsManager albumId={Number(resolvedParams.albumId)} />;
}


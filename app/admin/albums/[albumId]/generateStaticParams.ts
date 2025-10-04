export async function generateStaticParams() {
  // Hardcoded for static export. Replace with API call for production.
  return [
    { albumId: '1' },
    { albumId: '2' },
    { albumId: '3' },
    { albumId: '4' }
  ];
}

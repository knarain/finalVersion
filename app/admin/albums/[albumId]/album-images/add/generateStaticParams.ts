export async function generateStaticParams() {
  // Hardcoded for static export. Add more albumIds as needed.
  return [
    { albumId: '1' },
    { albumId: '2' },
    { albumId: '3' },
    { albumId: '4' }
  ];
}

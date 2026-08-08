export function generateStaticParams() {
  // Admin pages use authenticated client-side API requests.
  // Do not call protected admin APIs during a static build.
  //
  // These IDs preserve the existing static-export behavior.
  return Array.from({ length: 50 }, (_, i) => ({
    albumId: String(i + 1),
  }));
}

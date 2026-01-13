export async function generateStaticParams() {
  const defaultIds = Array.from({ length: 10 }, (_, i) => String(i + 1))
  return defaultIds.map((id) => ({ id }))
}
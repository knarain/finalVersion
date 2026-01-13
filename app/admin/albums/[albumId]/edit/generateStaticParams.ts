export async function generateStaticParams() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
  const defaultIds = Array.from({ length: 50 }, (_, i) => String(i + 1))

  try {
    let res = await fetch(`${apiBase}/admin/albums`)
    if (!res.ok) res = await fetch(`${apiBase}/albums`)
    if (res.ok) {
      const json = await res.json()
      const albums = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.albums)
        ? json.albums
        : []

      if (albums.length > 0) {
        const ids = Array.from(new Set(albums.map((a: any) => String(a.id)))) as string[]
        const finalIds = Array.from(new Set([...ids, ...defaultIds]))
        return finalIds.map((albumId: string) => ({ albumId }))
      }
    } else {
      console.warn('generateStaticParams (edit): API responded with status', res.status)
    }
  } catch (err) {
    console.error('generateStaticParams (edit): failed to fetch from API', err)
  }

  console.warn('generateStaticParams (edit): using fallback static params')
  return defaultIds.map((albumId) => ({ albumId }))
}
export async function generateStaticParams() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
  const defaultIds = ['1', '2', '3', '4', '5']

  // Try to fetch album list from API
  try {
    const res = await fetch(`${apiBase}/admin/albums`)
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
      console.warn('generateStaticParams: API responded with status', res.status)
    }
  } catch (err) {
    console.error('generateStaticParams: failed to fetch from API', err)
  }

  // Fallback: try to read local public/albums.json
  try {
    const fs = await import('fs')
    const path = await import('path')
    const p = path.join(process.cwd(), 'public', 'albums.json')
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8')
      const json = JSON.parse(raw)
      const albums = Array.isArray(json.albums) ? json.albums : Array.isArray(json.data) ? json.data : []
      if (albums.length > 0) {
        const ids = Array.from(new Set(albums.map((a: any) => String(a.id)))) as string[]
        const finalIds = Array.from(new Set([...ids, ...defaultIds]))
        return finalIds.map((albumId: string) => ({ albumId }))
      }
    }
  } catch (err) {
    console.error('generateStaticParams: failed to read public/albums.json', err)
  }

  // Last-resort fallback: include default ids so static export won't fail
  console.warn('generateStaticParams: using fallback static params')
  return defaultIds.map((albumId) => ({ albumId }))
}

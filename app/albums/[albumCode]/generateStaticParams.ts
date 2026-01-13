export async function generateStaticParams() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
  const defaultCodes = ['sample1', 'sample2', 'sample3']

  try {
    // Try to fetch album codes from API
    let res = await fetch(`${apiBase}/albums`)
    if (res.ok) {
      const json = await res.json()
      const albums = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.albums)
        ? json.albums
        : []

      if (albums.length > 0) {
        const codes = Array.from(new Set(albums.map((a: any) => String(a.code || a.id)))) as string[]
        const finalCodes = Array.from(new Set([...codes, ...defaultCodes]))
        return finalCodes.map((albumCode: string) => ({ albumCode }))
      }
    } else {
      console.warn('generateStaticParams: API responded with status', res.status)
    }
  } catch (err) {
    console.error('generateStaticParams: failed to fetch from API', err)
  }

  // Fallback: return default codes
  console.warn('generateStaticParams: using fallback static params')
  return defaultCodes.map((albumCode) => ({ albumCode }))
}
import UserPasswordClient from './password-client'
import { generateStaticParams } from './generateStaticParams'

export { generateStaticParams }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return <UserPasswordClient />
}
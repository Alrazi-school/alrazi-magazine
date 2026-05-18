import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminClient from '@/components/admin/AdminClient'

export default async function AdminPage() {
  const session = await getSession()
  if (!session.isLoggedIn || session.role !== 'ADMIN') redirect('/login')
  return <AdminClient userName={session.name!} />
}

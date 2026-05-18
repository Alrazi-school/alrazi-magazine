import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import EditorClient from '@/components/home/EditorClient'

export default async function EditorPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')
  if (session.role === 'ADMIN') redirect('/admin')

  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
  const user = { name: session.name!, role: session.role!, id: session.userId! }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="pt-16">
        <EditorClient categories={categories} />
      </div>
      <Footer />
    </div>
  )
}

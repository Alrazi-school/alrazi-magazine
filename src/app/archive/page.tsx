import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArchiveClient from '@/components/home/ArchiveClient'

export default async function ArchivePage({ searchParams }: { searchParams: any }) {
  const session = await getSession()
  const cat = (await searchParams)?.cat || ''

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED', ...(cat ? { category: { slug: cat } } : {}) },
      include: { author: { select: { name: true } }, category: true, _count: { select: { likes: true, comments: true } } },
      orderBy: { publishedAt: 'desc' }
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } })
  ])

  const user = session.isLoggedIn ? { name: session.name!, role: session.role!, id: session.userId! } : null

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="pt-16">
        <ArchiveClient articles={articles} categories={categories} activeCat={cat} />
      </div>
      <Footer />
    </div>
  )
}

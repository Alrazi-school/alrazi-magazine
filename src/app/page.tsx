import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomeClient from '@/components/home/HomeClient'

export default async function HomePage() {
  const session = await getSession()

  const [banners, articles, categories, media] = await Promise.all([
    prisma.banner.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { author: { select: { name: true } }, category: true, _count: { select: { likes: true, comments: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 9
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { articles: { where: { status: 'PUBLISHED' } } } } } }),
    prisma.mediaItem.findMany({ orderBy: { createdAt: 'desc' }, take: 12 })
  ])

  const user = session.isLoggedIn ? { name: session.name!, role: session.role!, id: session.userId! } : null

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="pt-16">
        <HomeClient banners={banners} articles={articles} categories={categories} media={media} user={user} />
      </div>
      <Footer />
    </div>
  )
}

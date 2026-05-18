import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleClient from '@/components/home/ArticleClient'

export default async function ArticlePage({ params }: any) {
  const session = await getSession()
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: { select: { name: true, role: true, bio: true } }, category: true, _count: { select: { likes: true, comments: true } } }
  })
  if (!article || article.status !== 'PUBLISHED') notFound()

  const [comments, liked, related] = await Promise.all([
    prisma.comment.findMany({ where: { articleId: article.id }, include: { author: { select: { name: true, role: true } } }, orderBy: { createdAt: 'desc' } }),
    session.userId ? prisma.like.findUnique({ where: { articleId_userId: { articleId: article.id, userId: session.userId } } }).then(l => !!l) : false,
    prisma.article.findMany({ where: { status: 'PUBLISHED', categoryId: article.categoryId, id: { not: article.id } }, include: { author: { select: { name: true } }, category: true }, take: 3, orderBy: { publishedAt: 'desc' } })
  ])

  await prisma.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } })

  const user = session.isLoggedIn ? { name: session.name!, role: session.role!, id: session.userId! } : null

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <div className="pt-16">
        <ArticleClient article={article} comments={comments} related={related} userLiked={liked} isLoggedIn={!!session.isLoggedIn} />
      </div>
      <Footer />
    </div>
  )
}

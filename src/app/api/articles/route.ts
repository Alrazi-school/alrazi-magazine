import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cat = searchParams.get('cat')
  const status = searchParams.get('status') || 'PUBLISHED'
  const all = searchParams.get('all')
  const session = await getSession()
  const where: any = (all && session.role === 'ADMIN') ? {} : { status }
  if (cat) where.category = { slug: cat }
  const articles = await prisma.article.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, role: true } },
      category: true,
      _count: { select: { likes: true, comments: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json({ articles })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const body = await req.json()
  const { title, excerpt, content, coverImage, coverEmoji, categoryId, readTime } = body
  if (!title || !content || !categoryId) return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 })
  const isAdmin = session.role === 'ADMIN'
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'settings' } })
  const autoPublish = settings?.autoPublish && session.role === 'TEACHER'
  const shouldPublish = isAdmin || autoPublish
  const article = await prisma.article.create({
    data: {
      title,
      excerpt: excerpt || title.slice(0, 120),
      content,
      coverImage: coverImage || null,
      coverEmoji: coverEmoji || '📝',
      slug: slugify(title),
      status: shouldPublish ? 'PUBLISHED' : 'REVIEW',
      publishedAt: shouldPublish ? new Date() : null,
      readTime: readTime || 3,
      authorId: session.userId!,
      categoryId,
    }
  })
  return NextResponse.json({ ok: true, article, published: shouldPublish }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn || session.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { id, action, title, excerpt, content, coverImage, coverEmoji, categoryId, readTime, featured } = await req.json()
  if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 })
  if (action === 'approve') {
    await prisma.article.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: new Date() } })
  } else if (action === 'reject') {
    await prisma.article.update({ where: { id }, data: { status: 'REJECTED' } })
  } else if (action === 'featured') {
    await prisma.article.update({ where: { id }, data: { featured: featured ?? true } })
  } else if (action === 'update') {
    const data: any = {}
    if (title) data.title = title
    if (excerpt) data.excerpt = excerpt
    if (content) data.content = content
    if (coverImage !== undefined) data.coverImage = coverImage
    if (coverEmoji) data.coverEmoji = coverEmoji
    if (categoryId) data.categoryId = categoryId
    if (readTime) data.readTime = readTime
    await prisma.article.update({ where: { id }, data })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn || session.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { id } = await req.json()
  await prisma.article.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

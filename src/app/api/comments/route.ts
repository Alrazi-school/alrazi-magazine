import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const articleId = searchParams.get('articleId')
  if (!articleId) return NextResponse.json({ error: 'مطلوب' }, { status: 400 })
  const comments = await prisma.comment.findMany({
    where: { articleId },
    include: { author: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json({ comments })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'سجّل الدخول أولاً' }, { status: 401 })
  const { articleId, content, action } = await req.json()

  if (action === 'like') {
    try {
      await prisma.like.create({ data: { articleId, userId: session.userId! } })
      return NextResponse.json({ liked: true })
    } catch { return NextResponse.json({ liked: false }) }
  }

  if (action === 'unlike') {
    await prisma.like.deleteMany({ where: { articleId, userId: session.userId! } })
    return NextResponse.json({ liked: false })
  }

  if (!content?.trim()) return NextResponse.json({ error: 'اكتب تعليقاً' }, { status: 400 })
  const comment = await prisma.comment.create({
    data: { articleId, content: content.trim(), authorId: session.userId! },
    include: { author: { select: { name: true, role: true } } }
  })
  await prisma.article.update({ where: { id: articleId }, data: { views: { increment: 1 } } })
  return NextResponse.json({ ok: true, comment }, { status: 201 })
}

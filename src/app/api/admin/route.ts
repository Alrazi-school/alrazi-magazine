import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

async function checkAdmin(session: any) {
  return session.isLoggedIn && session.role === 'ADMIN'
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!await checkAdmin(session)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'stats') {
    const [total, published, review, users, banners] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'REVIEW' } }),
      prisma.user.count(),
      prisma.banner.count(),
    ])
    return NextResponse.json({ total, published, review, users, banners })
  }

  if (type === 'users') {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true, _count: { select: { articles: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ users })
  }

  if (type === 'banners') {
    const banners = await prisma.banner.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ banners })
  }

  if (type === 'media') {
    const media = await prisma.mediaItem.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ media })
  }

  if (type === 'articles') {
    const status = searchParams.get('status')
    const articles = await prisma.article.findMany({
      where: status ? { status: status as any } : {},
      include: { author: { select: { name: true } }, category: true, _count: { select: { likes: true, comments: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ articles })
  }

  return NextResponse.json({ error: 'نوع غير صحيح' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!await checkAdmin(session)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { type } = body

  // Add user
  if (type === 'user') {
    const { name, email, password, role } = body
    if (!name || !email || !password) return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 })
    const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (exists) return NextResponse.json({ error: 'البريد مستخدم بالفعل' }, { status: 400 })
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, email: email.toLowerCase(), password: hash, role: role || 'STUDENT' } })
    return NextResponse.json({ ok: true, user })
  }

  // Add banner
  if (type === 'banner') {
    const { imageUrl, title, subtitle, order } = body
    if (!imageUrl) return NextResponse.json({ error: 'الصورة مطلوبة' }, { status: 400 })
    const banner = await prisma.banner.create({ data: { imageUrl, title, subtitle, order: order || 0 } })
    return NextResponse.json({ ok: true, banner })
  }

  // Add media
  if (type === 'media') {
    const { mediaType, url, title } = body
    if (!url) return NextResponse.json({ error: 'الرابط مطلوب' }, { status: 400 })
    const item = await prisma.mediaItem.create({ data: { type: mediaType || 'image', url, title } })
    return NextResponse.json({ ok: true, item })
  }

  return NextResponse.json({ error: 'نوع غير صحيح' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!await checkAdmin(session)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { type, id } = body

  if (type === 'user') {
    const { role, active, password } = body
    const data: any = {}
    if (role) data.role = role
    if (active !== undefined) data.active = active
    if (password) data.password = await bcrypt.hash(password, 10)
    await prisma.user.update({ where: { id }, data })
    return NextResponse.json({ ok: true })
  }

  if (type === 'banner') {
    const { active, order, title, subtitle } = body
    await prisma.banner.update({ where: { id }, data: { active, order, title, subtitle } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'نوع غير صحيح' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!await checkAdmin(session)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { type, id } = body

  if (type === 'user') { await prisma.user.delete({ where: { id } }); return NextResponse.json({ ok: true }) }
  if (type === 'banner') { await prisma.banner.delete({ where: { id } }); return NextResponse.json({ ok: true }) }
  if (type === 'media') { await prisma.mediaItem.delete({ where: { id } }); return NextResponse.json({ ok: true }) }

  return NextResponse.json({ error: 'نوع غير صحيح' }, { status: 400 })
}

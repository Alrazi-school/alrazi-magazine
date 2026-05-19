import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const articles = await prisma.article.findMany()
  let fixed = 0
  for (const a of articles) {
    const hasArabic = /[\u0600-\u06FF]/.test(a.slug)
    if (hasArabic) {
      const newSlug = `article-${a.id.slice(0, 8)}-${Date.now()}`
      await prisma.article.update({ where: { id: a.id }, data: { slug: newSlug } })
      fixed++
    }
  }
  return NextResponse.json({ fixed, message: `تم إصلاح ${fixed} مقال` })
}
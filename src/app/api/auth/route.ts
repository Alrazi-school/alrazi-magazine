import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'البيانات ناقصة' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user || !user.active) return NextResponse.json({ error: 'البريد أو كلمة السر غير صحيحة' }, { status: 401 })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return NextResponse.json({ error: 'البريد أو كلمة السر غير صحيحة' }, { status: 401 })
    const session = await getSession()
    session.userId = user.id; session.name = user.name; session.email = user.email; session.role = user.role; session.isLoggedIn = true
    await session.save()
    return NextResponse.json({ ok: true, role: user.role, name: user.name })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'خطأ' }, { status: 500 }) }
}

export async function DELETE() {
  const session = await getSession(); session.destroy()
  return NextResponse.json({ ok: true })
}

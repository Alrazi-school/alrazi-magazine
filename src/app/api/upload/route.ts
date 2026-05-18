import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    const { image, folder } = await req.json()
    if (!image) return NextResponse.json({ error: 'لا توجد صورة' }, { status: 400 })
    const url = await uploadImage(image, folder || 'alrazi')
    return NextResponse.json({ url })
  } catch (e) { console.error(e); return NextResponse.json({ error: 'فشل رفع الصورة' }, { status: 500 }) }
}

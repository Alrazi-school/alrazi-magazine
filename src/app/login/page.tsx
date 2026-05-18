'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    if (data.role === 'ADMIN') router.push('/admin')
    else router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl" style={{ background: 'linear-gradient(135deg,#C9A227,#F0C040)', color: '#0A3D7A' }}>ر</div>
            <div className="text-xl font-black text-white">مجلة الرازي المدرسية</div>
          </Link>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h1 className="text-xl font-black mb-1">تسجيل الدخول</h1>
          <p className="text-sm text-gray-500 mb-6">للأعضاء المسجلين فقط</p>
          {error && <div className="mb-4 p-3 rounded-xl text-sm font-medium text-red-700" style={{ background: '#FFEBEE' }}>⚠️ {error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">البريد الإلكتروني</label>
              <input type="email" className="inp" placeholder="example@moe.sch.ae" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">كلمة السر</label>
              <input type="password" className="inp" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required dir="ltr" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-p w-full justify-center py-3 text-base mt-2">
              {loading ? 'جاري الدخول...' : '🔑 دخول'}
            </button>
          </form>
          <div className="mt-5 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:underline">← العودة للمجلة</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

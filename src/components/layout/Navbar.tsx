'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'

export default function Navbar({ user }: { user: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/'); router.refresh()
  }

  const links = [
    { href: '/', label: 'الرئيسية' },
    { href: '/archive', label: 'المقالات' },
    { href: '/archive?cat=national', label: 'الهوية الوطنية' },
    { href: '/archive?cat=achievements', label: 'الإنجازات' },
  ]

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 z-50 h-16 flex items-center justify-between px-6"
        style={{ background: 'rgba(10,61,122,.97)', backdropFilter: 'blur(16px)', borderBottom: '2px solid rgba(201,162,39,.35)' }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
            style={{ background: 'linear-gradient(135deg,#C9A227,#F0C040)', color: '#0A3D7A' }}>ر</div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold" style={{ color: '#F0C040' }}>مجلة الرازي</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>الحلقة الثانية • بنين</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:block text-xs text-white/70">{user.name}</span>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="btn btn-a btn-sm">⚙️ لوحة التحكم</Link>
              )}
              {user.role !== 'ADMIN' && (
                <Link href="/editor" className="btn btn-a btn-sm">✍️ مقال</Link>
              )}
              <button onClick={logout} className="text-white/60 hover:text-white p-2 transition-all"><LogOut size={16} /></button>
            </>
          ) : (
            <Link href="/login" className="btn btn-a btn-sm">🔑 دخول</Link>
          )}
          <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute top-16 right-0 left-0 p-4 space-y-1"
            style={{ background: '#0A3D7A', borderBottom: '2px solid #C9A227' }}
            onClick={e => e.stopPropagation()}>
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm text-white/80 hover:bg-white/10 transition-all">{l.label}</Link>
            ))}
            {!user && <Link href="/login" onClick={() => setOpen(false)} className="block btn btn-a text-center mt-2">🔑 تسجيل الدخول</Link>}
          </div>
        </div>
      )}
    </>
  )
}

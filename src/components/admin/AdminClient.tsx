'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Clock, Users, Image as ImgIcon, LogOut, Upload, Trash2, CheckCircle, XCircle, Eye, Plus, X, Settings } from 'lucide-react'
import { getRoleLabel, getStatusLabel, getInitials, formatDate } from '@/lib/utils'
import toast, { Toaster } from 'react-hot-toast'

const TABS = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'review', label: 'المراجعة', icon: Clock, alert: true },
  { id: 'articles', label: 'المقالات', icon: FileText },
  { id: 'editor', label: 'إضافة مقال', icon: Plus },
  { id: 'users', label: 'الأعضاء', icon: Users },
  { id: 'banners', label: 'البانر', icon: ImgIcon },
  { id: 'media', label: 'الصور والفيديو', icon: ImgIcon },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
]

const STATUS_CLS: Record<string, string> = { PUBLISHED: 'b-pub', REVIEW: 'b-rev', DRAFT: 'b-drf', REJECTED: 'b-rej' }

export default function AdminClient({ userName }: { userName: string }) {
  const router = useRouter()
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState<any>({})
  const [articles, setArticles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Add user modal
  const [userModal, setUserModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STUDENT' })

  // Banner modal
  const [bannerModal, setBannerModal] = useState(false)
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', imageUrl: '', order: '0' })
  const [bannerUploading, setBannerUploading] = useState(false)
  const bannerFileRef = useRef<HTMLInputElement>(null)

  // Media modal
  const [mediaModal, setMediaModal] = useState(false)
  const [newMedia, setNewMedia] = useState({ type: 'image', url: '', title: '' })
  const [mediaUploading, setMediaUploading] = useState(false)
  const mediaFileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    if (tab === 'dashboard') {
      const [s, a] = await Promise.all([
        fetch('/api/admin?type=stats').then(r => r.json()),
        fetch('/api/admin?type=articles').then(r => r.json()),
      ])
      setStats(s); setArticles(a.articles || [])
    } else if (tab === 'review' || tab === 'articles') {
      const url = tab === 'review' ? '/api/admin?type=articles&status=REVIEW' : `/api/admin?type=articles${statusFilter ? `&status=${statusFilter}` : ''}`
      const d = await fetch(url).then(r => r.json())
      setArticles(d.articles || [])
    } else if (tab === 'users') {
      const d = await fetch('/api/admin?type=users').then(r => r.json())
      setUsers(d.users || [])
    } else if (tab === 'banners') {
      const d = await fetch('/api/admin?type=banners').then(r => r.json())
      setBanners(d.banners || [])
    } else if (tab === 'media') {
      const d = await fetch('/api/admin?type=media').then(r => r.json())
      setMedia(d.media || [])
    }
    setLoading(false)
  }, [tab, statusFilter])

  useEffect(() => { load() }, [load])

  const articleAction = async (action: string, id: string) => {
    await fetch('/api/articles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
    toast.success(action === 'approve' ? '✅ تم النشر!' : '❌ تم الرفض')
    load()
  }

  const deleteArticle = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المقال نهائياً؟')) return
    await fetch('/api/articles', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('🗑️ تم الحذف'); load()
  }

  const changeUserRole = async (id: string, role: string) => {
    await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'user', id, role }) })
    toast.success(`✅ تم تغيير الدور`); load()
  }

  const toggleUserActive = async (id: string, active: boolean) => {
    await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'user', id, active }) })
    toast.success(active ? '✅ تم تفعيل الحساب' : '⛔ تم إيقاف الحساب'); load()
  }

  const deleteUser = async (id: string) => {
    if (!confirm('هل تريد حذف هذا العضو نهائياً؟')) return
    await fetch('/api/admin', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'user', id }) })
    toast.success('🗑️ تم حذف العضو'); load()
  }

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) { toast.error('أكمل جميع الحقول'); return }
    const res = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'user', ...newUser }) })
    const d = await res.json()
    if (!res.ok) { toast.error(d.error); return }
    toast.success('✅ تم إضافة العضو!')
    setUserModal(false); setNewUser({ name: '', email: '', password: '', role: 'STUDENT' }); load()
  }

  const uploadBannerImage = async (file: File) => {
    setBannerUploading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: e.target?.result, folder: 'alrazi/banners' }) })
      const d = await res.json()
      if (d.url) { setNewBanner(b => ({ ...b, imageUrl: d.url })); toast.success('✅ تم رفع الصورة!') }
      setBannerUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const addBanner = async () => {
    if (!newBanner.imageUrl) { toast.error('ارفع صورة أولاً'); return }
    await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'banner', ...newBanner, order: parseInt(newBanner.order) || 0 }) })
    toast.success('✅ تم إضافة البانر!'); setBannerModal(false); setNewBanner({ title: '', subtitle: '', imageUrl: '', order: '0' }); load()
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('حذف هذا البانر؟')) return
    await fetch('/api/admin', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'banner', id }) })
    toast.success('🗑️ تم الحذف'); load()
  }

  const uploadMediaImage = async (file: File) => {
    setMediaUploading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: e.target?.result, folder: 'alrazi/media' }) })
      const d = await res.json()
      if (d.url) { setNewMedia(m => ({ ...m, url: d.url, type: 'image' })); toast.success('✅ تم رفع الصورة!') }
      setMediaUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const addMedia = async () => {
    if (!newMedia.url) { toast.error('أدخل رابط أو ارفع صورة'); return }
    await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'media', mediaType: newMedia.type, url: newMedia.url, title: newMedia.title }) })
    toast.success('✅ تم الإضافة!'); setMediaModal(false); setNewMedia({ type: 'image', url: '', title: '' }); load()
  }

  const deleteMedia = async (id: string) => {
    if (!confirm('حذف هذا العنصر؟')) return
    await fetch('/api/admin', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'media', id }) })
    toast.success('🗑️ تم الحذف'); load()
  }

  const logout = async () => { await fetch('/api/auth', { method: 'DELETE' }); router.push('/'); router.refresh() }

  const reviewCount = tab !== 'review' ? (stats.review || 0) : articles.length

  const modalStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }
  const modalBox: React.CSSProperties = { background: '#fff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px', position: 'relative' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7FC' }}>
      <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: 'Cairo,sans-serif', direction: 'rtl' } }} />

      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? '220px' : '60px', background: '#0A3D7A', flexShrink: 0, display: 'flex', flexDirection: 'column', transition: 'width .3s', overflow: 'hidden', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '1.2rem', borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#C9A227,#F0C040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: '#0A3D7A', flexShrink: 0 }}>ر</div>
          {sidebarOpen && <span style={{ color: '#F0C040', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>لوحة التحكم</span>}
        </div>

        {/* User */}
        {sidebarOpen && (
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#C9A227,#F0C040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0A3D7A', fontSize: '13px', marginBottom: '6px' }}>{getInitials(userName)}</div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '12px' }}>{userName}</div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '11px' }}>مدير المجلة</div>
          </div>
        )}

        {/* Menu */}
        <nav style={{ padding: '8px', flex: 1 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: sidebarOpen ? '10px 12px' : '10px', borderRadius: '10px', marginBottom: '2px', background: tab === t.id ? 'rgba(255,255,255,.12)' : 'transparent', color: tab === t.id ? '#F0C040' : 'rgba(255,255,255,.7)', border: 'none', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: '13px', fontWeight: 500, transition: 'all .2s', justifyContent: sidebarOpen ? 'flex-start' : 'center', position: 'relative', borderRight: tab === t.id ? '3px solid #C9A227' : '3px solid transparent' }}>
              <t.icon size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span style={{ flex: 1, textAlign: 'right' }}>{t.label}</span>}
              {t.alert && stats.review > 0 && (
                <span style={{ background: '#e53935', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{stats.review}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: '12px', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
            🏠 {sidebarOpen && 'الموقع'}
          </Link>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'none', border: 'none', color: '#ef9a9a', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: '12px', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
            <LogOut size={15} /> {sidebarOpen && 'خروج'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1A1A2E' }}>لوحة المعلومات</h1>
              <p style={{ fontSize: '13px', color: '#5A6A8A', marginTop: '2px' }}>مرحباً، {userName} 👋</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px', marginBottom: '1.5rem' }}>
              {[
                { label: 'إجمالي المقالات', val: stats.total || 0, icon: '📝', bg: '#E3F2FD', c: '#0A3D7A' },
                { label: 'منشور', val: stats.published || 0, icon: '✅', bg: '#E8F5E9', c: '#2E7D32' },
                { label: 'بانتظار المراجعة', val: stats.review || 0, icon: '⏳', bg: '#FFF3E0', c: '#E65100' },
                { label: 'الأعضاء', val: stats.users || 0, icon: '👥', bg: '#E0F2F1', c: '#00695C' },
                { label: 'البانر', val: stats.banners || 0, icon: '🖼️', bg: '#F3E5F5', c: '#6A1B9A' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: '16px', padding: '1.2rem', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '10px' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.c }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: '#5A6A8A', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {stats.review > 0 && (
              <div style={{ background: '#FFF3E0', border: '1px solid #FFB74D', borderRadius: '14px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>⏳</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#E65100' }}>يوجد {stats.review} مقال بانتظار مراجعتك</div>
                    <div style={{ fontSize: '12px', color: '#F57C00' }}>راجعها وانشرها الآن</div>
                  </div>
                </div>
                <button onClick={() => setTab('review')} className="btn btn-p btn-sm">مراجعة الآن</button>
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(10,61,122,.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>أحدث المقالات</span>
                <button onClick={() => setTab('articles')} style={{ fontSize: '12px', color: '#1565C0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>عرض الكل</button>
              </div>
              <table className="tbl">
                <thead><tr><th>العنوان</th><th>الكاتب</th><th>القسم</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {articles.slice(0, 5).map(a => (
                    <tr key={a.id}>
                      <td style={{ maxWidth: '200px' }}><span style={{ fontWeight: 600, fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</span></td>
                      <td style={{ fontSize: '12px', color: '#5A6A8A' }}>{a.author?.name}</td>
                      <td><span className="badge b-blue">{a.category?.name}</span></td>
                      <td><span className={`badge ${STATUS_CLS[a.status]}`}>{getStatusLabel(a.status)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <Link href={`/article/${a.slug}`} className="btn btn-sm" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', padding: '5px 10px' }}><Eye size={12} /></Link>
                          {a.status === 'REVIEW' && <>
                            <button onClick={() => articleAction('approve', a.id)} className="btn btn-success btn-sm">قبول</button>
                            <button onClick={() => articleAction('reject', a.id)} className="btn btn-danger btn-sm">رفض</button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {articles.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontSize: '13px' }}>لا توجد مقالات</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REVIEW ── */}
        {tab === 'review' && (
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '1.5rem' }}>المقالات بانتظار المراجعة</h1>
            {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>جاري التحميل...</div>
              : articles.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '16px', padding: '4rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <p style={{ fontWeight: 700, color: '#5A6A8A' }}>لا توجد مقالات بانتظار المراجعة</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {articles.map(a => (
                    <div key={a.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', padding: '1.5rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <span className="badge b-blue">{a.category?.icon} {a.category?.name}</span>
                            <span style={{ fontSize: '12px', color: '#5A6A8A' }}>✍️ {a.author?.name} • {formatDate(a.createdAt)}</span>
                          </div>
                          <h3 style={{ fontWeight: 700, marginBottom: '6px' }}>{a.title}</h3>
                          <p style={{ fontSize: '13px', color: '#5A6A8A', lineHeight: 1.7 }}>{a.excerpt}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <Link href={`/article/${a.slug}`} className="btn btn-sm" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', padding: '6px 12px' }}><Eye size={13} /> معاينة</Link>
                          <button onClick={() => articleAction('approve', a.id)} className="btn btn-success"><CheckCircle size={14} /> قبول ونشر</button>
                          <button onClick={() => articleAction('reject', a.id)} className="btn btn-danger"><XCircle size={14} /> رفض</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ── ARTICLES ── */}
        {tab === 'articles' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900 }}>إدارة المقالات</h1>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
              {[['', 'الكل'], ['PUBLISHED', 'منشور'], ['REVIEW', 'مراجعة'], ['DRAFT', 'مسودة'], ['REJECTED', 'مرفوض']].map(([v, l]) => (
                <button key={v} onClick={() => setStatusFilter(v)}
                  style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: '1px solid', borderColor: statusFilter === v ? '#0A3D7A' : '#e2e8f0', background: statusFilter === v ? '#0A3D7A' : '#fff', color: statusFilter === v ? '#fff' : '#5A6A8A', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'all .2s' }}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)', overflow: 'hidden' }}>
              {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>جاري التحميل...</div> : (
                <table className="tbl">
                  <thead><tr><th>العنوان</th><th>الكاتب</th><th>القسم</th><th>مشاهدات</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                  <tbody>
                    {articles.map(a => (
                      <tr key={a.id}>
                        <td style={{ maxWidth: '200px' }}><span style={{ fontWeight: 600, fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</span></td>
                        <td style={{ fontSize: '12px', color: '#5A6A8A' }}>{a.author?.name}</td>
                        <td><span className="badge b-blue">{a.category?.name}</span></td>
                        <td style={{ fontSize: '12px' }}>{a.views}</td>
                        <td><span className={`badge ${STATUS_CLS[a.status]}`}>{getStatusLabel(a.status)}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <Link href={`/article/${a.slug}`} className="btn btn-sm" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', padding: '5px 10px' }}><Eye size={12} /></Link>
                            {a.status === 'REVIEW' && <>
                              <button onClick={() => articleAction('approve', a.id)} className="btn btn-success btn-sm">قبول</button>
                              <button onClick={() => articleAction('reject', a.id)} className="btn btn-danger btn-sm">رفض</button>
                            </>}
                            <button onClick={() => deleteArticle(a.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {articles.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontSize: '13px' }}>لا توجد مقالات</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900 }}>إدارة الأعضاء</h1>
              <button onClick={() => setUserModal(true)} className="btn btn-p"><Plus size={15} /> إضافة عضو</button>
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)', overflow: 'hidden' }}>
              <table className="tbl">
                <thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>المقالات</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0A3D7A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{getInitials(u.name)}</div>
                          <span style={{ fontWeight: 600, fontSize: '12px' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '11px', color: '#5A6A8A' }}>{u.email}</td>
                      <td>
                        <select value={u.role}
                          onChange={e => changeUserRole(u.id, e.target.value)}
                          style={{ fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', background: '#fff' }}
                          disabled={u.role === 'ADMIN'}>
                          <option value="STUDENT">طالب</option>
                          <option value="TEACHER">معلم</option>
                          <option value="ADMIN">مدير</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '12px' }}>{u._count?.articles || 0}</td>
                      <td><span className={`badge ${u.active ? 'b-pub' : 'b-rej'}`}>{u.active ? 'نشط' : 'موقوف'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {u.role !== 'ADMIN' && <>
                            <button onClick={() => toggleUserActive(u.id, !u.active)}
                              className="btn btn-sm" style={{ background: u.active ? 'rgba(198,40,40,.1)' : 'rgba(46,125,50,.1)', color: u.active ? '#C62828' : '#2E7D32', padding: '5px 10px', fontSize: '11px' }}>
                              {u.active ? 'إيقاف' : 'تفعيل'}
                            </button>
                            <button onClick={() => deleteUser(u.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontSize: '13px' }}>لا توجد أعضاء</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BANNERS ── */}
        {tab === 'banners' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900 }}>إدارة البانر</h1>
              <button onClick={() => setBannerModal(true)} className="btn btn-p"><Plus size={15} /> إضافة صورة</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '16px' }}>
              {banners.map(b => (
                <div key={b.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                  <div style={{ position: 'relative', height: '160px' }}>
                    <Image src={b.imageUrl} alt={b.title || 'banner'} fill className="object-cover" />
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{b.title || 'بدون عنوان'}</div>
                    <div style={{ fontSize: '11px', color: '#5A6A8A', marginBottom: '10px' }}>{b.subtitle}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className={`badge ${b.active ? 'b-pub' : 'b-drf'}`}>{b.active ? 'نشط' : 'مخفي'}</span>
                      <button onClick={() => fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'banner', id: b.id, active: !b.active }) }).then(() => load())}
                        className="btn btn-sm" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', padding: '3px 10px', fontSize: '11px' }}>
                        {b.active ? 'إخفاء' : 'إظهار'}
                      </button>
                      <button onClick={() => deleteBanner(b.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>لا توجد صور في البانر — أضف صورة الآن!</div>}
            </div>
          </div>
        )}

        {/* ── MEDIA ── */}
        {tab === 'media' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900 }}>الصور والفيديوهات</h1>
              <button onClick={() => setMediaModal(true)} className="btn btn-p"><Plus size={15} /> إضافة</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
              {media.map(m => (
                <div key={m.id} style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                  {m.type === 'image' ? (
                    <div style={{ position: 'relative', height: '140px' }}>
                      <Image src={m.url} alt={m.title || ''} fill className="object-cover" />
                    </div>
                  ) : (
                    <div style={{ height: '140px', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ textAlign: 'center', color: '#fff' }}>🎥<div style={{ fontSize: '11px', marginTop: '4px' }}>فيديو</div></div>
                    </div>
                  )}
                  <div style={{ padding: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>{m.title || (m.type === 'video' ? 'فيديو' : 'صورة')}</div>
                    <button onClick={() => deleteMedia(m.id)} className="btn btn-danger btn-sm w-full justify-center"><Trash2 size={12} /> حذف</button>
                  </div>
                </div>
              ))}
              {media.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>لا توجد صور أو فيديوهات — أضف الآن!</div>}
            </div>
          </div>
        )}
        {/* ── EDITOR (Admin) ── */}
        {tab === 'editor' && (
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '1.5rem' }}>إضافة مقال جديد</h1>
            <AdminArticleEditor categories={[]} onSuccess={() => { setTab('articles'); load() }} />
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <AdminSettings userId={''} />
        )}
      </main>

      {/* ── ADD USER MODAL ── */}
      {userModal && (
        <div style={modalStyle} onClick={() => setUserModal(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <button onClick={() => setUserModal(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#5A6A8A' }}><X size={20} /></button>
            <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>إضافة عضو جديد</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '5px' }}>الاسم *</label><input className="inp" placeholder="الاسم الكامل" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '5px' }}>البريد الإلكتروني *</label><input className="inp" type="email" placeholder="email@example.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} dir="ltr" /></div>
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '5px' }}>كلمة السر *</label><input className="inp" type="password" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} dir="ltr" /></div>
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '5px' }}>الدور</label>
                <select className="inp" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="STUDENT">طالب</option>
                  <option value="TEACHER">معلم</option>
                  <option value="ADMIN">مدير</option>
                </select>
              </div>
              <button onClick={addUser} className="btn btn-p w-full justify-center" style={{ marginTop: '8px', padding: '.85rem' }}>✅ إضافة العضو</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD BANNER MODAL ── */}
      {bannerModal && (
        <div style={modalStyle} onClick={() => setBannerModal(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <button onClick={() => setBannerModal(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#5A6A8A' }}><X size={20} /></button>
            <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>إضافة صورة للبانر</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {newBanner.imageUrl ? (
                <div style={{ position: 'relative', height: '160px', borderRadius: '12px', overflow: 'hidden' }}>
                  <Image src={newBanner.imageUrl} alt="preview" fill className="object-cover" />
                  <button onClick={() => setNewBanner(b => ({ ...b, imageUrl: '' }))} style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(198,40,40,.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
                </div>
              ) : (
                <div onClick={() => bannerFileRef.current?.click()} style={{ height: '120px', border: '2px dashed #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '8px' }} className="hover:border-blue-300">
                  <Upload size={24} style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: '13px', color: '#5A6A8A' }}>{bannerUploading ? 'جاري الرفع...' : 'ارفع صورة البانر'}</span>
                </div>
              )}
              <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadBannerImage(e.target.files[0])} />
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '5px' }}>العنوان (اختياري)</label><input className="inp" placeholder="عنوان يظهر على البانر" value={newBanner.title} onChange={e => setNewBanner({ ...newBanner, title: e.target.value })} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '5px' }}>النص الفرعي (اختياري)</label><input className="inp" placeholder="نص إضافي" value={newBanner.subtitle} onChange={e => setNewBanner({ ...newBanner, subtitle: e.target.value })} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '5px' }}>الترتيب</label><input className="inp" type="number" value={newBanner.order} onChange={e => setNewBanner({ ...newBanner, order: e.target.value })} /></div>
              <button onClick={addBanner} disabled={!newBanner.imageUrl} className="btn btn-p w-full justify-center" style={{ padding: '.85rem' }}>✅ إضافة للبانر</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD MEDIA MODAL ── */}
      {mediaModal && (
        <div style={modalStyle} onClick={() => setMediaModal(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <button onClick={() => setMediaModal(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#5A6A8A' }}><X size={20} /></button>
            <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>إضافة صورة أو فيديو</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['image', 'video'].map(t => (
                  <button key={t} onClick={() => setNewMedia(m => ({ ...m, type: t, url: '' }))}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid', borderColor: newMedia.type === t ? '#0A3D7A' : '#e2e8f0', background: newMedia.type === t ? 'rgba(10,61,122,.08)' : '#fff', color: newMedia.type === t ? '#0A3D7A' : '#5A6A8A', fontFamily: 'Cairo,sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                    {t === 'image' ? '📷 صورة' : '🎥 فيديو'}
                  </button>
                ))}
              </div>
              {newMedia.type === 'image' ? (
                newMedia.url ? (
                  <div style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden' }}>
                    <Image src={newMedia.url} alt="preview" fill className="object-cover" />
                    <button onClick={() => setNewMedia(m => ({ ...m, url: '' }))} style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(198,40,40,.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
                  </div>
                ) : (
                  <div onClick={() => mediaFileRef.current?.click()} style={{ height: '100px', border: '2px dashed #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '6px' }} className="hover:border-blue-300">
                    <Upload size={20} style={{ color: '#9CA3AF' }} />
                    <span style={{ fontSize: '12px', color: '#5A6A8A' }}>{mediaUploading ? 'جاري الرفع...' : 'ارفع صورة'}</span>
                  </div>
                )
              ) : (
                <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '5px' }}>رابط اليوتيوب أو الفيديو</label><input className="inp" placeholder="https://youtube.com/watch?v=..." value={newMedia.url} onChange={e => setNewMedia({ ...newMedia, url: e.target.value })} dir="ltr" /></div>
              )}
              <input ref={mediaFileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadMediaImage(e.target.files[0])} />
              <div><label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '5px' }}>العنوان (اختياري)</label><input className="inp" placeholder="عنوان الصورة أو الفيديو" value={newMedia.title} onChange={e => setNewMedia({ ...newMedia, title: e.target.value })} /></div>
              <button onClick={addMedia} className="btn btn-p w-full justify-center" style={{ padding: '.85rem' }}>✅ إضافة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

function AdminSettings({ userId }: { userId: string }) {
  const [settings, setSettings] = useState<any>({
    siteName: 'مجلة الرازي المدرسية',
    schoolName: 'مدرسة الرازي بنين - الحلقة الثانية',
    address: 'دبي، الإمارات العربية المتحدة',
    phone: '',
    email: 'hany.aboueldahab@moe.sch.ae',
    primaryColor: '#0A3D7A',
    logoUrl: '',
    allowComments: true,
    autoPublish: false,
  })
  const [pass, setPass] = useState({ current: '', newPass: '', confirm: '' })
  const [logoUploading, setLogoUploading] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin?type=settings').then(r => r.json()).then(d => { if (d.settings) setSettings(d.settings) })
  }, [])

  const saveSettings = async () => {
    const res = await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'settings', ...settings }) })
    if (res.ok) toast.success('✅ تم حفظ الإعدادات!')
    else toast.error('خطأ في الحفظ')
  }

  const changePassword = async () => {
    if (!pass.current || !pass.newPass) { toast.error('أدخل كلمة السر الحالية والجديدة'); return }
    if (pass.newPass !== pass.confirm) { toast.error('كلمة السر الجديدة غير متطابقة'); return }
    if (pass.newPass.length < 6) { toast.error('كلمة السر يجب أن تكون 6 أحرف على الأقل'); return }
    const res = await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'changePassword', currentPassword: pass.current, newPassword: pass.newPass }) })
    const d = await res.json()
    if (res.ok) { toast.success('✅ تم تغيير كلمة السر!'); setPass({ current: '', newPass: '', confirm: '' }) }
    else toast.error(d.error || 'خطأ')
  }

  const uploadLogo = async (file: File) => {
    setLogoUploading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: e.target?.result, folder: 'alrazi/logo' }) })
      const d = await res.json()
      if (d.url) { setSettings((s: any) => ({ ...s, logoUrl: d.url })); toast.success('✅ تم رفع الشعار!') }
      setLogoUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const box: React.CSSProperties = { background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', padding: '1.5rem', marginBottom: '1.2rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }
  const label: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: '#374151' }

  return (
    <div style={{ maxWidth: '640px' }}>
      {/* School info */}
      <div style={box}>
        <h2 style={{ fontWeight: 800, marginBottom: '1.2rem', fontSize: '15px' }}>🏫 بيانات المدرسة</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div><label style={label}>اسم المجلة</label><input className="inp" value={settings.siteName} onChange={e => setSettings((s: any) => ({ ...s, siteName: e.target.value }))} /></div>
          <div><label style={label}>اسم المدرسة</label><input className="inp" value={settings.schoolName} onChange={e => setSettings((s: any) => ({ ...s, schoolName: e.target.value }))} /></div>
          <div><label style={label}>العنوان</label><input className="inp" value={settings.address} onChange={e => setSettings((s: any) => ({ ...s, address: e.target.value }))} /></div>
          <div><label style={label}>رقم الهاتف</label><input className="inp" value={settings.phone} onChange={e => setSettings((s: any) => ({ ...s, phone: e.target.value }))} dir="ltr" /></div>
          <div><label style={label}>البريد الإلكتروني</label><input className="inp" value={settings.email} onChange={e => setSettings((s: any) => ({ ...s, email: e.target.value }))} dir="ltr" /></div>
        </div>
      </div>

      {/* Logo */}
      <div style={box}>
        <h2 style={{ fontWeight: 800, marginBottom: '1.2rem', fontSize: '15px' }}>🖼️ شعار المدرسة</h2>
        {settings.logoUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={settings.logoUrl} alt="logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <button onClick={() => setSettings((s: any) => ({ ...s, logoUrl: '' }))} className="btn btn-danger btn-sm">حذف الشعار</button>
          </div>
        ) : (
          <div onClick={() => logoRef.current?.click()} style={{ height: '100px', border: '2px dashed #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '8px' }} className="hover:border-blue-300">
            <Upload size={22} style={{ color: '#9CA3AF' }} />
            <span style={{ fontSize: '13px', color: '#5A6A8A' }}>{logoUploading ? 'جاري الرفع...' : 'ارفع شعار المدرسة'}</span>
          </div>
        )}
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
      </div>

      {/* Theme color */}
      <div style={box}>
        <h2 style={{ fontWeight: 800, marginBottom: '1.2rem', fontSize: '15px' }}>🎨 لون الثيم</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {['#0A3D7A', '#1B5E20', '#4A148C', '#B71C1C', '#E65100', '#006064', '#1A237E', '#37474F'].map(c => (
            <button key={c} onClick={() => setSettings((s: any) => ({ ...s, primaryColor: c }))}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: c, border: settings.primaryColor === c ? '3px solid #F0C040' : '3px solid transparent', cursor: 'pointer', transition: 'all .2s', boxShadow: settings.primaryColor === c ? '0 0 0 2px #0A3D7A' : 'none' }} />
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#5A6A8A' }}>لون مخصص:</span>
            <input type="color" value={settings.primaryColor} onChange={e => setSettings((s: any) => ({ ...s, primaryColor: e.target.value }))}
              style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '2px' }} />
          </div>
        </div>
        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}
          style2={{ background: settings.primaryColor }}>
          <div style={{ padding: '10px 20px', borderRadius: '10px', background: settings.primaryColor, color: '#fff', fontWeight: 700, fontSize: '14px' }}>
            معاينة اللون المختار
          </div>
        </div>
      </div>

      {/* Publishing settings */}
      <div style={box}>
        <h2 style={{ fontWeight: 800, marginBottom: '1.2rem', fontSize: '15px' }}>📋 إعدادات النشر</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'allowComments', label: 'السماح بالتعليقات', desc: 'يسمح للأعضاء بالتعليق على المقالات' },
            { key: 'autoPublish', label: 'نشر تلقائي للمعلمين', desc: 'ينشر مقالات المعلمين مباشرة بدون مراجعة' },
          ].map(item => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <div onClick={() => setSettings((s: any) => ({ ...s, [item.key]: !s[item.key] }))}
                style={{ width: '44px', height: '24px', borderRadius: '99px', background: settings[item.key] ? '#0A3D7A' : '#e2e8f0', position: 'relative', transition: 'all .3s', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', transition: 'all .3s', right: settings[item.key] ? '3px' : 'calc(100% - 21px)', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: '#5A6A8A' }}>{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button onClick={saveSettings} className="btn btn-p w-full justify-center" style={{ padding: '.9rem', marginBottom: '1.5rem', fontSize: '15px' }}>
        💾 حفظ جميع الإعدادات
      </button>

      {/* Change password */}
      <div style={box}>
        <h2 style={{ fontWeight: 800, marginBottom: '1.2rem', fontSize: '15px' }}>🔑 تغيير كلمة السر</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div><label style={label}>كلمة السر الحالية</label><input className="inp" type="password" value={pass.current} onChange={e => setPass({ ...pass, current: e.target.value })} dir="ltr" /></div>
          <div><label style={label}>كلمة السر الجديدة</label><input className="inp" type="password" value={pass.newPass} onChange={e => setPass({ ...pass, newPass: e.target.value })} dir="ltr" /></div>
          <div><label style={label}>تأكيد كلمة السر الجديدة</label><input className="inp" type="password" value={pass.confirm} onChange={e => setPass({ ...pass, confirm: e.target.value })} dir="ltr" /></div>
          <button onClick={changePassword} className="btn btn-p" style={{ padding: '.8rem' }}>🔐 تغيير كلمة السر</button>
        </div>
      </div>
    </div>
  )
}
  
}

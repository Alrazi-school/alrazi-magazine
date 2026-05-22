'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, Clock, Users, Image as ImgIcon,
  LogOut, Upload, Trash2, CheckCircle, XCircle, Eye, Plus, X,
  Settings, Send, Save, Edit2, Key
} from 'lucide-react'
import { getRoleLabel, getStatusLabel, getInitials, formatDate } from '@/lib/utils'
import toast, { Toaster } from 'react-hot-toast'

const TABS = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'review', label: 'المراجعة', icon: Clock, alert: true },
  { id: 'articles', label: 'المقالات', icon: FileText },
  { id: 'write', label: 'إضافة مقال', icon: Edit2 },
  { id: 'users', label: 'الأعضاء', icon: Users },
  { id: 'banners', label: 'البانر', icon: ImgIcon },
  { id: 'media', label: 'الصور والفيديو', icon: ImgIcon },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
]

const STATUS_CLS: Record<string, string> = {
  PUBLISHED: 'b-pub', REVIEW: 'b-rev', DRAFT: 'b-drf', REJECTED: 'b-rej'
}

const EMOJIS = ['📝','🚀','🏆','🇦🇪','🔬','⚽','📚','🎉','🤖','🌟','💡','🏅','🎓','🎭','📖','🏫','🌍','✨']
const COLORS = ['#0A3D7A','#1B5E20','#4A148C','#B71C1C','#E65100','#006064','#1A237E','#37474F','#880E4F','#BF360C']

export default function AdminClient({ userName }: { userName: string }) {
  const router = useRouter()
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState<any>({})
  const [articles, setArticles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [media, setMedia] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Modals
  const [userModal, setUserModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const [bannerModal, setBannerModal] = useState(false)
  const [newBanner, setNewBanner] = useState({ title: '', subtitle: '', imageUrl: '', order: '0' })
  const [bannerUploading, setBannerUploading] = useState(false)
  const bannerFileRef = useRef<HTMLInputElement>(null)
  const [mediaModal, setMediaModal] = useState(false)
  const [newMedia, setNewMedia] = useState({ type: 'image', url: '', title: '' })
  const [mediaUploading, setMediaUploading] = useState(false)
  const mediaFileRef = useRef<HTMLInputElement>(null)
  const [editModal, setEditModal] = useState(false)
  const [editArticle, setEditArticle] = useState<any>(null)
  const [userPassModal, setUserPassModal] = useState(false)
  const [userPassTarget, setUserPassTarget] = useState<any>(null)
  const [newUserPass, setNewUserPass] = useState('')

  // Write article
  const [writeForm, setWriteForm] = useState({ title: '', excerpt: '', content: '', coverEmoji: '📝', coverImage: '', categoryId: '', readTime: '3' })
  const [writeUploading, setWriteUploading] = useState(false)
  const writeFileRef = useRef<HTMLInputElement>(null)
  const [writing, setWriting] = useState(false)

  // Settings
  const [siteSettings, setSiteSettings] = useState<any>({
    siteName: 'مجلة الرازي المدرسية',
    schoolName: 'مدرسة الرازي بنين - الحلقة الثانية',
    address: 'دبي، الإمارات العربية المتحدة',
    phone: '', email: 'hany.aboueldahab@moe.sch.ae',
    primaryColor: '#0A3D7A', logoUrl: '',
    allowComments: true, autoPublish: false,
  })
  const [pass, setPass] = useState({ current: '', newPass: '', confirm: '' })
  const [logoUploading, setLogoUploading] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const [savingSettings, setSavingSettings] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (tab === 'dashboard') {
        const [s, a] = await Promise.all([
          fetch('/api/admin?type=stats').then(r => r.json()),
          fetch('/api/admin?type=articles').then(r => r.json()),
        ])
        setStats(s); setArticles(a.articles || [])
      } else if (tab === 'review') {
        const d = await fetch('/api/admin?type=articles&status=REVIEW').then(r => r.json())
        setArticles(d.articles || [])
      } else if (tab === 'articles') {
        const url = statusFilter ? `/api/admin?type=articles&status=${statusFilter}` : '/api/admin?type=articles'
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
      } else if (tab === 'settings') {
        const d = await fetch('/api/admin?type=settings').then(r => r.json())
        if (d.settings && d.settings.siteName) setSiteSettings((p: any) => ({ ...p, ...d.settings }))
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [tab, statusFilter])

  useEffect(() => { load() }, [load])

  // Load categories
  useEffect(() => {
    fetch('/api/admin?type=articles').then(r => r.json()).then(d => {
      const cats: any[] = []; const seen = new Set()
      ;(d.articles || []).forEach((a: any) => {
        if (a.category && !seen.has(a.category.id)) { seen.add(a.category.id); cats.push(a.category) }
      })
      if (cats.length > 0) setCategories(cats)
    })
  }, [])

  const uploadFile = async (file: File, folder: string, onUrl: (u: string) => void, setLoad: (v: boolean) => void) => {
    setLoad(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: e.target?.result, folder: `alrazi/${folder}` }) })
        const d = await res.json()
        if (d.url) { onUrl(d.url); toast.success('✅ تم رفع الصورة!') }
        else toast.error('فشل رفع الصورة')
      } catch { toast.error('خطأ في الرفع') }
      setLoad(false)
    }
    reader.readAsDataURL(file)
  }

  const articleAction = async (action: string, id: string) => {
    await fetch('/api/articles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
    toast.success(action === 'approve' ? '✅ تم النشر!' : '❌ تم الرفض'); load()
  }

  const deleteArticle = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المقال نهائياً؟')) return
    await fetch('/api/articles', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('🗑️ تم الحذف'); load()
  }

  const saveEdit = async () => {
    const res = await fetch('/api/articles', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editArticle.id, action: 'update', title: editArticle.title, excerpt: editArticle.excerpt, content: editArticle.content, coverEmoji: editArticle.coverEmoji, categoryId: editArticle.categoryId }) })
    if (res.ok) { toast.success('✅ تم تعديل المقال!'); setEditModal(false); load() }
    else toast.error('خطأ في التعديل')
  }

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) { toast.error('أكمل جميع الحقول'); return }
    const res = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'user', ...newUser }) })
    const d = await res.json()
    if (!res.ok) { toast.error(d.error); return }
    toast.success('✅ تم إضافة العضو!'); setUserModal(false); setNewUser({ name: '', email: '', password: '', role: 'STUDENT' }); load()
  }

  const changeUserRole = async (id: string, role: string) => {
    await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'user', id, role }) })
    toast.success('✅ تم تغيير الدور'); load()
  }

  const toggleUserActive = async (id: string, active: boolean) => {
    await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'user', id, active }) })
    toast.success(active ? '✅ تم التفعيل' : '⛔ تم الإيقاف'); load()
  }

  const deleteUser = async (id: string) => {
    if (!confirm('حذف هذا العضو نهائياً؟')) return
    await fetch('/api/admin', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'user', id }) })
    toast.success('🗑️ تم الحذف'); load()
  }

  const changeUserPassword = async () => {
    if (!newUserPass || newUserPass.length < 6) { toast.error('كلمة السر يجب أن تكون 6 أحرف على الأقل'); return }
    const res = await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'userPassword', id: userPassTarget.id, newPassword: newUserPass }) })
    if (res.ok) { toast.success('✅ تم تغيير كلمة السر!'); setUserPassModal(false); setNewUserPass('') }
    else toast.error('خطأ في تغيير كلمة السر')
  }

  const writeArticle = async () => {
    if (!writeForm.title.trim()) { toast.error('أدخل عنوان المقال'); return }
    if (!writeForm.categoryId) { toast.error('اختر القسم'); return }
    if (writeForm.content.trim().length < 30) { toast.error('المحتوى قصير جداً'); return }
    setWriting(true)
    const res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...writeForm, readTime: parseInt(writeForm.readTime) || 3 }) })
    const d = await res.json()
    setWriting(false)
    if (res.ok) {
      toast.success('✅ تم نشر المقال!')
      setWriteForm({ title: '', excerpt: '', content: '', coverEmoji: '📝', coverImage: '', categoryId: '', readTime: '3' })
      setTab('articles'); load()
    } else toast.error(d.error || 'خطأ في النشر')
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

  const saveSettings = async () => {
    setSavingSettings(true)
    const res = await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'settings', ...siteSettings }) })
    setSavingSettings(false)
    if (res.ok) toast.success('✅ تم حفظ الإعدادات!')
    else toast.error('خطأ في الحفظ — تأكد من تحديث قاعدة البيانات')
  }

  const changePassword = async () => {
    if (!pass.current || !pass.newPass) { toast.error('أدخل كلمة السر الحالية والجديدة'); return }
    if (pass.newPass !== pass.confirm) { toast.error('كلمة السر الجديدة غير متطابقة'); return }
    if (pass.newPass.length < 6) { toast.error('كلمة السر 6 أحرف على الأقل'); return }
    const res = await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'changePassword', currentPassword: pass.current, newPassword: pass.newPass }) })
    const d = await res.json()
    if (res.ok) { toast.success('✅ تم تغيير كلمة السر!'); setPass({ current: '', newPass: '', confirm: '' }) }
    else toast.error(d.error || 'خطأ')
  }

  const logout = async () => { await fetch('/api/auth', { method: 'DELETE' }); router.push('/'); router.refresh() }

  const reviewCount = stats.review || 0
  const pc = siteSettings.primaryColor || '#0A3D7A'

  const mStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }
  const mBox: React.CSSProperties = { background: '#fff', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '520px', position: 'relative', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }
  const box: React.CSSProperties = { background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', padding: '1.5rem', marginBottom: '1.2rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: '#374151' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F7FC', fontFamily: 'Cairo,sans-serif', direction: 'rtl' }}>
      <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: 'Cairo,sans-serif', direction: 'rtl' } }} />

      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? '220px' : '60px', background: pc, flexShrink: 0, display: 'flex', flexDirection: 'column', transition: 'width .3s', overflow: 'hidden', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '1.2rem', borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          {siteSettings.logoUrl
            ? <img src={siteSettings.logoUrl} alt="logo" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'contain', background: '#fff', flexShrink: 0 }} />
            : <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#C9A227,#F0C040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: '#0A3D7A', flexShrink: 0 }}>ر</div>
          }
          {sidebarOpen && <span style={{ color: '#F0C040', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>لوحة التحكم</span>}
        </div>
        {sidebarOpen && (
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#C9A227,#F0C040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0A3D7A', fontSize: '13px', marginBottom: '6px' }}>{getInitials(userName)}</div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '12px' }}>{userName}</div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '11px' }}>مدير المجلة</div>
          </div>
        )}
        <nav style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: sidebarOpen ? '10px 12px' : '10px', borderRadius: '10px', marginBottom: '2px', background: tab === t.id ? 'rgba(255,255,255,.15)' : 'transparent', color: tab === t.id ? '#F0C040' : 'rgba(255,255,255,.75)', border: 'none', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: '13px', fontWeight: 500, transition: 'all .2s', justifyContent: sidebarOpen ? 'flex-start' : 'center', borderRight: tab === t.id ? '3px solid #C9A227' : '3px solid transparent' }}>
              <t.icon size={16} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span style={{ flex: 1, textAlign: 'right' }}>{t.label}</span>}
              {t.alert && reviewCount > 0 && <span style={{ background: '#e53935', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{reviewCount}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: '12px', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>🏠 {sidebarOpen && 'الموقع'}</Link>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'none', border: 'none', color: '#ef9a9a', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: '12px', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}><LogOut size={15} /> {sidebarOpen && 'خروج'}</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900 }}>لوحة المعلومات</h1>
              <p style={{ fontSize: '13px', color: '#5A6A8A', marginTop: '2px' }}>مرحباً، {userName} 👋</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '14px', marginBottom: '1.5rem' }}>
              {[
                { label: 'إجمالي المقالات', val: stats.total||0, icon: '📝', bg: '#E3F2FD', c: '#0A3D7A' },
                { label: 'منشور', val: stats.published||0, icon: '✅', bg: '#E8F5E9', c: '#2E7D32' },
                { label: 'انتظار المراجعة', val: stats.review||0, icon: '⏳', bg: '#FFF3E0', c: '#E65100' },
                { label: 'الأعضاء', val: stats.users||0, icon: '👥', bg: '#E0F2F1', c: '#00695C' },
                { label: 'البانر', val: stats.banners||0, icon: '🖼️', bg: '#F3E5F5', c: '#6A1B9A' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: '16px', padding: '1.2rem', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '10px' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.c }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: '#5A6A8A', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            {reviewCount > 0 && (
              <div style={{ background: '#FFF3E0', border: '1px solid #FFB74D', borderRadius: '14px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>⏳</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#E65100' }}>{reviewCount} مقال بانتظار مراجعتك</div>
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
                <thead><tr><th>العنوان</th><th>الكاتب</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {articles.slice(0,6).map(a => (
                    <tr key={a.id}>
                      <td style={{ maxWidth: '200px' }}><span style={{ fontWeight: 600, fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</span></td>
                      <td style={{ fontSize: '12px', color: '#5A6A8A', whiteSpace: 'nowrap' }}>{a.author?.name}</td>
                      <td><span className={`badge ${STATUS_CLS[a.status]}`}>{getStatusLabel(a.status)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <Link href={`/article/${a.slug}`} target="_blank" className="btn btn-sm" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', padding: '5px 10px' }}><Eye size={12} /></Link>
                          <button onClick={() => { setEditArticle({...a}); setEditModal(true) }} className="btn btn-sm" style={{ background: 'rgba(201,162,39,.1)', color: '#7A5900', padding: '5px 10px' }}><Edit2 size={12} /></button>
                          {a.status === 'REVIEW' && <>
                            <button onClick={() => articleAction('approve', a.id)} className="btn btn-success btn-sm">قبول</button>
                            <button onClick={() => articleAction('reject', a.id)} className="btn btn-danger btn-sm">رفض</button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {articles.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontSize: '13px' }}>لا توجد مقالات</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REVIEW */}
        {tab === 'review' && (
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '1.5rem' }}>المقالات بانتظار المراجعة</h1>
            {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>جاري التحميل...</div>
            : articles.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '16px', padding: '4rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <p style={{ fontWeight: 700, color: '#5A6A8A' }}>لا توجد مقالات بانتظار المراجعة</p>
              </div>
            ) : articles.map(a => (
              <div key={a.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', padding: '1.5rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="badge b-blue">{a.category?.icon} {a.category?.name}</span>
                      <span style={{ fontSize: '12px', color: '#5A6A8A' }}>✍️ {a.author?.name} • {formatDate(a.createdAt)}</span>
                    </div>
                    <h3 style={{ fontWeight: 700, marginBottom: '6px', fontSize: '15px' }}>{a.title}</h3>
                    <p style={{ fontSize: '13px', color: '#5A6A8A', lineHeight: 1.7, marginBottom: '10px' }}>{a.excerpt}</p>
                    <details>
                      <summary style={{ fontSize: '12px', color: '#1565C0', fontWeight: 600, cursor: 'pointer', marginBottom: '8px' }}>👁️ معاينة المحتوى الكامل</summary>
                      <div style={{ background: '#F4F7FC', borderRadius: '10px', padding: '1rem', fontSize: '13px', lineHeight: 1.8, maxHeight: '200px', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: a.content }} />
                    </details>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                    <button onClick={() => { setEditArticle({...a}); setEditModal(true) }} className="btn btn-sm" style={{ background: 'rgba(201,162,39,.1)', color: '#7A5900', padding: '6px 12px' }}><Edit2 size={13} /> تعديل</button>
                    <button onClick={() => articleAction('approve', a.id)} className="btn btn-success"><CheckCircle size={14} /> قبول ونشر</button>
                    <button onClick={() => articleAction('reject', a.id)} className="btn btn-danger"><XCircle size={14} /> رفض</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ARTICLES */}
        {tab === 'articles' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900 }}>إدارة المقالات</h1>
              <button onClick={() => setTab('write')} className="btn btn-p"><Plus size={15} /> مقال جديد</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
              {[['','الكل'],['PUBLISHED','منشور'],['REVIEW','مراجعة'],['DRAFT','مسودة'],['REJECTED','مرفوض']].map(([v,l]) => (
                <button key={v} onClick={() => setStatusFilter(v)} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: '1px solid', borderColor: statusFilter===v?'#0A3D7A':'#e2e8f0', background: statusFilter===v?'#0A3D7A':'#fff', color: statusFilter===v?'#fff':'#5A6A8A', cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>{l}</button>
              ))}
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)', overflow: 'auto' }}>
              <table className="tbl">
                <thead><tr><th>العنوان</th><th>الكاتب</th><th>القسم</th><th>مشاهدات</th><th>الحالة</th><th>الإجراءات</th></tr></thead>
                <tbody>
                  {articles.map(a => (
                    <tr key={a.id}>
                      <td style={{ maxWidth: '180px' }}><span style={{ fontWeight: 600, fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</span></td>
                      <td style={{ fontSize: '12px', color: '#5A6A8A', whiteSpace: 'nowrap' }}>{a.author?.name}</td>
                      <td><span className="badge b-blue">{a.category?.icon} {a.category?.name}</span></td>
                      <td style={{ fontSize: '12px' }}>{a.views}</td>
                      <td><span className={`badge ${STATUS_CLS[a.status]}`}>{getStatusLabel(a.status)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <Link href={`/article/${a.slug}`} target="_blank" className="btn btn-sm" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', padding: '5px 10px' }}><Eye size={12} /></Link>
                          <button onClick={() => { setEditArticle({...a}); setEditModal(true) }} className="btn btn-sm" style={{ background: 'rgba(201,162,39,.1)', color: '#7A5900', padding: '5px 10px' }}><Edit2 size={12} /></button>
                          {a.status==='REVIEW' && <>
                            <button onClick={() => articleAction('approve',a.id)} className="btn btn-success btn-sm">قبول</button>
                            <button onClick={() => articleAction('reject',a.id)} className="btn btn-danger btn-sm">رفض</button>
                          </>}
                          <button onClick={() => deleteArticle(a.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {articles.length===0 && <tr><td colSpan={6} style={{ textAlign:'center',padding:'2rem',color:'#9CA3AF',fontSize:'13px' }}>لا توجد مقالات</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WRITE */}
        {tab === 'write' && (
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '1.5rem' }}>إضافة مقال جديد</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={box}>
                  <label style={lbl}>عنوان المقال *</label>
                  <input className="inp" style={{ fontSize: '1rem', fontWeight: 700 }} placeholder="اكتب عنواناً جذاباً..." value={writeForm.title} onChange={e => setWriteForm({...writeForm, title: e.target.value})} />
                </div>
                <div style={box}>
                  <label style={lbl}>ملخص المقال</label>
                  <textarea className="textarea" rows={2} placeholder="وصف مختصر..." value={writeForm.excerpt} onChange={e => setWriteForm({...writeForm, excerpt: e.target.value})} />
                </div>
                <div style={{ ...box, padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(10,61,122,.1)', background: '#F4F7FC', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>محتوى المقال *</span>
                    <span style={{ fontSize: '12px', color: '#5A6A8A' }}>{writeForm.content.trim().split(/\s+/).filter(Boolean).length} كلمة</span>
                  </div>
                  <textarea style={{ width: '100%', minHeight: '300px', padding: '1.2rem', fontFamily: 'Cairo,sans-serif', fontSize: '14px', lineHeight: 1.9, color: '#1A1A2E', border: 'none', outline: 'none', resize: 'none', direction: 'rtl', background: '#fff' }}
                    placeholder="اكتب محتوى المقال هنا..." value={writeForm.content} onChange={e => setWriteForm({...writeForm, content: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={box}>
                  <label style={lbl}>صورة المقال</label>
                  {writeForm.coverImage ? (
                    <div style={{ position: 'relative' }}>
                      <img src={writeForm.coverImage} alt="cover" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '10px' }} />
                      <button onClick={() => setWriteForm({...writeForm, coverImage: ''})} style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(198,40,40,.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
                    </div>
                  ) : (
                    <div onClick={() => writeFileRef.current?.click()} style={{ height: '100px', border: '2px dashed #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '6px' }}>
                      <Upload size={20} style={{ color: '#9CA3AF' }} />
                      <span style={{ fontSize: '12px', color: '#5A6A8A' }}>{writeUploading ? 'جاري الرفع...' : 'ارفع صورة'}</span>
                    </div>
                  )}
                  <input ref={writeFileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'articles', url => setWriteForm(f => ({...f, coverImage: url})), setWriteUploading)} />
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ ...lbl, fontSize: '12px', color: '#5A6A8A' }}>أو اختر رمز</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '4px' }}>
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => setWriteForm({...writeForm, coverEmoji: e})} style={{ height: '32px', borderRadius: '8px', fontSize: '1.1rem', border: writeForm.coverEmoji===e ? '2px solid #0A3D7A' : '2px solid transparent', background: writeForm.coverEmoji===e ? 'rgba(10,61,122,.08)' : '#F4F7FC', cursor: 'pointer' }}>{e}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={box}>
                  <label style={lbl}>القسم *</label>
                  {categories.length === 0
                    ? <p style={{ fontSize: '12px', color: '#9CA3AF', padding: '10px' }}>جاري تحميل الأقسام... (تأكد من وجود مقالات منشورة)</p>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {categories.map(c => (
                          <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '10px', border: `1px solid ${writeForm.categoryId===c.id?'#0A3D7A':'#e2e8f0'}`, background: writeForm.categoryId===c.id?'rgba(10,61,122,.05)':'#fff', cursor: 'pointer' }}>
                            <input type="radio" name="wcat" className="hidden" checked={writeForm.categoryId===c.id} onChange={() => setWriteForm({...writeForm, categoryId: c.id})} />
                            <span>{c.icon}</span><span style={{ fontSize: '12px', fontWeight: 500 }}>{c.name}</span>
                          </label>
                        ))}
                      </div>
                  }
                </div>
                <div style={box}>
                  <label style={lbl}>وقت القراءة (دقائق)</label>
                  <input className="inp" type="number" min={1} max={60} value={writeForm.readTime} onChange={e => setWriteForm({...writeForm, readTime: e.target.value})} />
                </div>
                <button onClick={writeArticle} disabled={writing} className="btn btn-p w-full justify-center" style={{ padding: '.85rem' }}>
                  {writing ? 'جاري النشر...' : <><Send size={15} /> نشر المقال الآن</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900 }}>إدارة الأعضاء</h1>
              <button onClick={() => setUserModal(true)} className="btn btn-p"><Plus size={15} /> إضافة عضو</button>
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)', overflow: 'auto' }}>
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
                        <select value={u.role} onChange={e => changeUserRole(u.id, e.target.value)} disabled={u.role==='ADMIN'} style={{ fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', background: '#fff' }}>
                          <option value="STUDENT">طالب</option>
                          <option value="TEACHER">معلم</option>
                          <option value="ADMIN">مدير</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '12px' }}>{u._count?.articles||0}</td>
                      <td><span className={`badge ${u.active?'b-pub':'b-rej'}`}>{u.active?'نشط':'موقوف'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <button onClick={() => { setUserPassTarget(u); setUserPassModal(true) }} className="btn btn-sm" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', padding: '5px 10px' }} title="تغيير كلمة السر"><Key size={12} /></button>
                          {u.role !== 'ADMIN' && <>
                            <button onClick={() => toggleUserActive(u.id, !u.active)} className="btn btn-sm" style={{ background: u.active?'rgba(198,40,40,.1)':'rgba(46,125,50,.1)', color: u.active?'#C62828':'#2E7D32', padding: '5px 10px', fontSize: '11px' }}>{u.active?'إيقاف':'تفعيل'}</button>
                            <button onClick={() => deleteUser(u.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length===0 && <tr><td colSpan={6} style={{ textAlign:'center',padding:'2rem',color:'#9CA3AF',fontSize:'13px' }}>لا توجد أعضاء</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BANNERS */}
        {tab === 'banners' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900 }}>إدارة البانر</h1>
              <button onClick={() => setBannerModal(true)} className="btn btn-p"><Plus size={15} /> إضافة صورة</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '16px' }}>
              {banners.map(b => (
                <div key={b.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                  <div style={{ position: 'relative', height: '160px' }}>
                    <Image src={b.imageUrl} alt={b.title||'banner'} fill className="object-cover" />
                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}><span className={`badge ${b.active?'b-pub':'b-drf'}`}>{b.active?'نشط':'مخفي'}</span></div>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '3px' }}>{b.title||'بدون عنوان'}</div>
                    {b.subtitle && <div style={{ fontSize: '11px', color: '#5A6A8A', marginBottom: '8px' }}>{b.subtitle}</div>}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => fetch('/api/admin',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'banner',id:b.id,active:!b.active})}).then(()=>load())} className="btn btn-sm" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', padding: '5px 10px', fontSize: '11px', flex: 1, justifyContent: 'center' }}>{b.active?'إخفاء':'إظهار'}</button>
                      <button onClick={() => deleteBanner(b.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length===0 && <div style={{ gridColumn:'1/-1',textAlign:'center',padding:'3rem',color:'#9CA3AF' }}>لا توجد صور في البانر</div>}
            </div>
          </div>
        )}

        {/* MEDIA */}
        {tab === 'media' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900 }}>الصور والفيديوهات</h1>
              <button onClick={() => setMediaModal(true)} className="btn btn-p"><Plus size={15} /> إضافة</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '14px' }}>
              {media.map(m => (
                <div key={m.id} style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                  {m.type==='image'
                    ? <div style={{ position: 'relative', height: '130px' }}><Image src={m.url} alt={m.title||''} fill className="object-cover" /></div>
                    : <div style={{ height: '130px', background: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px', color: '#fff' }}><span style={{ fontSize: '2rem' }}>🎥</span><span style={{ fontSize: '11px' }}>فيديو</span></div>
                  }
                  <div style={{ padding: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title||(m.type==='video'?'فيديو':'صورة')}</div>
                    <button onClick={() => deleteMedia(m.id)} className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center' }}><Trash2 size={12} /> حذف</button>
                  </div>
                </div>
              ))}
              {media.length===0 && <div style={{ gridColumn:'1/-1',textAlign:'center',padding:'3rem',color:'#9CA3AF' }}>لا توجد صور أو فيديوهات</div>}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div style={{ maxWidth: '640px' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: '1.5rem' }}>الإعدادات</h1>
            <div style={box}>
              <h2 style={{ fontWeight: 800, marginBottom: '1.2rem', fontSize: '15px' }}>🏫 بيانات المدرسة</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[{k:'siteName',l:'اسم المجلة'},{k:'schoolName',l:'اسم المدرسة'},{k:'address',l:'العنوان'},{k:'phone',l:'رقم الهاتف'},{k:'email',l:'البريد الإلكتروني'}].map(f => (
                  <div key={f.k}><label style={lbl}>{f.l}</label><input className="inp" value={siteSettings[f.k]||''} onChange={e => setSiteSettings((s:any)=>({...s,[f.k]:e.target.value}))} dir={f.k==='phone'||f.k==='email'?'ltr':'rtl'} /></div>
                ))}
              </div>
            </div>
            <div style={box}>
              <h2 style={{ fontWeight: 800, marginBottom: '1.2rem', fontSize: '15px' }}>🖼️ شعار المدرسة</h2>
              {siteSettings.logoUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={siteSettings.logoUrl} alt="logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#F4F7FC' }} />
                  <div>
                    <p style={{ fontSize: '12px', color: '#5A6A8A', marginBottom: '8px' }}>✅ تم رفع الشعار</p>
                    <button onClick={() => setSiteSettings((s:any)=>({...s,logoUrl:''}))} className="btn btn-danger btn-sm">حذف الشعار</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => logoRef.current?.click()} style={{ height: '100px', border: '2px dashed #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '8px' }}>
                  <Upload size={22} style={{ color: '#9CA3AF' }} />
                  <span style={{ fontSize: '13px', color: '#5A6A8A' }}>{logoUploading ? 'جاري الرفع...' : 'انقر لرفع شعار المدرسة'}</span>
                </div>
              )}
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'logo', url => setSiteSettings((s:any)=>({...s,logoUrl:url})), setLogoUploading)} />
            </div>
            <div style={box}>
              <h2 style={{ fontWeight: 800, marginBottom: '1.2rem', fontSize: '15px' }}>🎨 لون الثيم</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setSiteSettings((s:any)=>({...s,primaryColor:c}))} style={{ width: '38px', height: '38px', borderRadius: '50%', background: c, border: siteSettings.primaryColor===c?'3px solid #F0C040':'3px solid transparent', cursor: 'pointer', outline: siteSettings.primaryColor===c?`2px solid ${c}`:'none', outlineOffset: '2px', transition: 'all .2s' }} />
                ))}
                <input type="color" value={siteSettings.primaryColor||'#0A3D7A'} onChange={e => setSiteSettings((s:any)=>({...s,primaryColor:e.target.value}))} style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '2px' }} />
              </div>
              <div style={{ padding: '12px 20px', borderRadius: '12px', background: siteSettings.primaryColor||'#0A3D7A', color: '#fff', fontWeight: 700, fontSize: '14px', display: 'inline-block' }}>معاينة اللون</div>
            </div>
            <div style={box}>
              <h2 style={{ fontWeight: 800, marginBottom: '1.2rem', fontSize: '15px' }}>📋 إعدادات النشر</h2>
              {[{k:'allowComments',l:'السماح بالتعليقات',d:'يسمح للأعضاء بالتعليق على المقالات'},{k:'autoPublish',l:'نشر تلقائي للمعلمين',d:'ينشر مقالات المعلمين بدون مراجعة'}].map(item => (
                <div key={item.k} onClick={() => setSiteSettings((s:any)=>({...s,[item.k]:!s[item.k]}))} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', marginBottom: '8px' }}>
                  <div style={{ width: '44px', height: '24px', borderRadius: '99px', background: siteSettings[item.k]?'#0A3D7A':'#e2e8f0', position: 'relative', transition: 'all .3s', flexShrink: 0 }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', transition: 'all .3s', right: siteSettings[item.k]?'3px':'calc(100% - 21px)', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
                  </div>
                  <div><div style={{ fontWeight: 700, fontSize: '13px' }}>{item.l}</div><div style={{ fontSize: '11px', color: '#5A6A8A' }}>{item.d}</div></div>
                </div>
              ))}
            </div>
            <button onClick={saveSettings} disabled={savingSettings} className="btn btn-p w-full justify-center" style={{ padding: '.9rem', marginBottom: '1.5rem', fontSize: '15px' }}>
              {savingSettings ? 'جاري الحفظ...' : <><Save size={16} /> حفظ جميع الإعدادات</>}
            </button>
            <div style={box}>
              <h2 style={{ fontWeight: 800, marginBottom: '1.2rem', fontSize: '15px' }}>🔑 تغيير كلمة السر</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><label style={lbl}>كلمة السر الحالية</label><input className="inp" type="password" value={pass.current} onChange={e => setPass({...pass,current:e.target.value})} dir="ltr" /></div>
                <div><label style={lbl}>كلمة السر الجديدة</label><input className="inp" type="password" value={pass.newPass} onChange={e => setPass({...pass,newPass:e.target.value})} dir="ltr" /></div>
                <div><label style={lbl}>تأكيد كلمة السر</label><input className="inp" type="password" value={pass.confirm} onChange={e => setPass({...pass,confirm:e.target.value})} dir="ltr" /></div>
                <button onClick={changePassword} className="btn btn-p"><Key size={15} /> تغيير كلمة السر</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Add User */}
      {userModal && (
        <div style={mStyle} onClick={() => setUserModal(false)}>
          <div style={mBox} onClick={e => e.stopPropagation()}>
            <button onClick={() => setUserModal(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#5A6A8A' }}><X size={20} /></button>
            <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>إضافة عضو جديد</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={lbl}>الاسم *</label><input className="inp" placeholder="الاسم الكامل" value={newUser.name} onChange={e => setNewUser({...newUser,name:e.target.value})} /></div>
              <div><label style={lbl}>البريد الإلكتروني *</label><input className="inp" type="email" placeholder="email@example.com" value={newUser.email} onChange={e => setNewUser({...newUser,email:e.target.value})} dir="ltr" /></div>
              <div><label style={lbl}>كلمة السر *</label><input className="inp" type="password" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({...newUser,password:e.target.value})} dir="ltr" /></div>
              <div><label style={lbl}>الدور</label>
                <select className="inp" value={newUser.role} onChange={e => setNewUser({...newUser,role:e.target.value})}>
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

      {/* MODAL: Change User Password */}
      {userPassModal && userPassTarget && (
        <div style={mStyle} onClick={() => setUserPassModal(false)}>
          <div style={mBox} onClick={e => e.stopPropagation()}>
            <button onClick={() => setUserPassModal(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#5A6A8A' }}><X size={20} /></button>
            <h2 style={{ fontWeight: 800, marginBottom: '.5rem' }}>تغيير كلمة سر</h2>
            <p style={{ fontSize: '13px', color: '#5A6A8A', marginBottom: '1.5rem' }}>العضو: <strong>{userPassTarget.name}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={lbl}>كلمة السر الجديدة (6 أحرف على الأقل)</label><input className="inp" type="password" placeholder="••••••••" value={newUserPass} onChange={e => setNewUserPass(e.target.value)} dir="ltr" /></div>
              <button onClick={changeUserPassword} className="btn btn-p w-full justify-center" style={{ padding: '.85rem' }}><Key size={15} /> تغيير كلمة السر</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Article */}
      {editModal && editArticle && (
        <div style={mStyle} onClick={() => setEditModal(false)}>
          <div style={{ ...mBox, maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditModal(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#5A6A8A' }}><X size={20} /></button>
            <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>تعديل المقال</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><label style={lbl}>العنوان</label><input className="inp" value={editArticle.title} onChange={e => setEditArticle({...editArticle,title:e.target.value})} /></div>
              <div><label style={lbl}>الملخص</label><textarea className="textarea" rows={2} value={editArticle.excerpt} onChange={e => setEditArticle({...editArticle,excerpt:e.target.value})} /></div>
              <div><label style={lbl}>المحتوى</label><textarea className="textarea" rows={8} style={{ minHeight: '200px' }} value={editArticle.content} onChange={e => setEditArticle({...editArticle,content:e.target.value})} /></div>
              <div><label style={lbl}>الرمز</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: '4px' }}>
                  {EMOJIS.map(e => <button key={e} onClick={() => setEditArticle({...editArticle,coverEmoji:e})} style={{ height: '32px', borderRadius: '8px', fontSize: '1.1rem', border: editArticle.coverEmoji===e?'2px solid #0A3D7A':'2px solid transparent', background: editArticle.coverEmoji===e?'rgba(10,61,122,.08)':'#F4F7FC', cursor: 'pointer' }}>{e}</button>)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={saveEdit} className="btn btn-p" style={{ flex: 1, justifyContent: 'center', padding: '.85rem' }}><Save size={15} /> حفظ التعديلات</button>
                <button onClick={() => setEditModal(false)} className="btn btn-o" style={{ flex: 1, justifyContent: 'center', padding: '.85rem' }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Banner */}
      {bannerModal && (
        <div style={mStyle} onClick={() => setBannerModal(false)}>
          <div style={mBox} onClick={e => e.stopPropagation()}>
            <button onClick={() => setBannerModal(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#5A6A8A' }}><X size={20} /></button>
            <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>إضافة صورة للبانر</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {newBanner.imageUrl
                ? <div style={{ position: 'relative', height: '160px', borderRadius: '12px', overflow: 'hidden' }}><Image src={newBanner.imageUrl} alt="preview" fill className="object-cover" /><button onClick={() => setNewBanner(b=>({...b,imageUrl:''}))} style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(198,40,40,.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button></div>
                : <div onClick={() => bannerFileRef.current?.click()} style={{ height: '120px', border: '2px dashed #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '8px' }}><Upload size={24} style={{ color: '#9CA3AF' }} /><span style={{ fontSize: '13px', color: '#5A6A8A' }}>{bannerUploading?'جاري الرفع...':'ارفع صورة البانر'}</span></div>
              }
              <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0],'banners',url=>setNewBanner(b=>({...b,imageUrl:url})),setBannerUploading)} />
              <div><label style={lbl}>العنوان (اختياري)</label><input className="inp" placeholder="عنوان على البانر" value={newBanner.title} onChange={e => setNewBanner({...newBanner,title:e.target.value})} /></div>
              <div><label style={lbl}>النص الفرعي (اختياري)</label><input className="inp" placeholder="نص إضافي" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner,subtitle:e.target.value})} /></div>
              <div><label style={lbl}>الترتيب</label><input className="inp" type="number" value={newBanner.order} onChange={e => setNewBanner({...newBanner,order:e.target.value})} /></div>
              <button onClick={addBanner} disabled={!newBanner.imageUrl} className="btn btn-p w-full justify-center" style={{ padding: '.85rem' }}>✅ إضافة للبانر</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Media */}
      {mediaModal && (
        <div style={mStyle} onClick={() => setMediaModal(false)}>
          <div style={mBox} onClick={e => e.stopPropagation()}>
            <button onClick={() => setMediaModal(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#5A6A8A' }}><X size={20} /></button>
            <h2 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>إضافة صورة أو فيديو</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['image','video'].map(t => <button key={t} onClick={() => setNewMedia(m=>({...m,type:t,url:''}))} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid', borderColor: newMedia.type===t?'#0A3D7A':'#e2e8f0', background: newMedia.type===t?'rgba(10,61,122,.08)':'#fff', color: newMedia.type===t?'#0A3D7A':'#5A6A8A', fontFamily: 'Cairo,sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>{t==='image'?'📷 صورة':'🎥 فيديو'}</button>)}
              </div>
              {newMedia.type==='image'
                ? newMedia.url
                  ? <div style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden' }}><Image src={newMedia.url} alt="preview" fill className="object-cover" /><button onClick={() => setNewMedia(m=>({...m,url:''}))} style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(198,40,40,.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button></div>
                  : <div onClick={() => mediaFileRef.current?.click()} style={{ height: '100px', border: '2px dashed #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '6px' }}><Upload size={20} style={{ color: '#9CA3AF' }} /><span style={{ fontSize: '12px', color: '#5A6A8A' }}>{mediaUploading?'جاري الرفع...':'ارفع صورة'}</span></div>
                : <div><label style={lbl}>رابط اليوتيوب أو الفيديو</label><input className="inp" placeholder="https://youtube.com/watch?v=..." value={newMedia.url} onChange={e => setNewMedia({...newMedia,url:e.target.value})} dir="ltr" /></div>
              }
              <input ref={mediaFileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0],'media',url=>setNewMedia(m=>({...m,url,type:'image'})),setMediaUploading)} />
              <div><label style={lbl}>العنوان (اختياري)</label><input className="inp" placeholder="عنوان الصورة أو الفيديو" value={newMedia.title} onChange={e => setNewMedia({...newMedia,title:e.target.value})} /></div>
              <button onClick={addMedia} className="btn btn-p w-full justify-center" style={{ padding: '.85rem' }}>✅ إضافة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

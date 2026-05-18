'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Eye, Send } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const EMOJIS = ['📝', '🚀', '🏆', '🇦🇪', '🔬', '⚽', '📚', '🎉', '🤖', '🌟', '💡', '🏅', '🎓', '🎭', '📖']

export default function EditorClient({ categories }: { categories: any[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', coverEmoji: '📝', coverImage: '', categoryId: '', readTime: '3' })
  const [preview, setPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const uploadImage = async (file: File) => {
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64, folder: 'alrazi/articles' }) })
      const data = await res.json()
      if (data.url) { setForm(f => ({ ...f, coverImage: data.url })); toast.success('✅ تم رفع الصورة!') }
      else toast.error('فشل رفع الصورة')
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    if (!form.title.trim()) { toast.error('أدخل عنوان المقال'); return }
    if (!form.categoryId) { toast.error('اختر قسم المقال'); return }
    if (form.content.trim().length < 50) { toast.error('المحتوى قصير جداً'); return }
    setSubmitting(true)
    const res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, readTime: parseInt(form.readTime) || 3 }) })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { toast.error(data.error || 'خطأ'); return }
    toast.success('📨 تم إرسال مقالك للمراجعة! سيُنشر بعد موافقة المدير.')
    setTimeout(() => router.push('/'), 2000)
  }

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: 'Cairo,sans-serif', direction: 'rtl' } }} />
      <div className="hero-bg py-12 text-center px-4">
        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: 'rgba(201,162,39,.2)', border: '1px solid rgba(201,162,39,.35)', color: '#F0C040' }}>✍️ كتابة</div>
        <h1 className="text-3xl font-black text-white mb-2">إضافة مقال جديد</h1>
        <p className="text-white/60 text-sm">سيُرسل مقالك للمراجعة — وينشر بعد موافقة المدير</p>
      </div>
      <div className="gold-line" />

      <div className="wrap sec py-8">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={() => setPreview(!preview)} className="btn btn-o btn-sm"><Eye size={14} /> {preview ? 'تعديل' : 'معاينة'}</button>
        </div>

        {preview ? (
          <div style={{ maxWidth: '700px', margin: '0 auto', background: '#fff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)', border: '1px solid rgba(10,61,122,.1)' }}>
            <div style={{ height: '200px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', marginBottom: '1.5rem', background: '#F4F7FC', overflow: 'hidden', position: 'relative' }}>
              {form.coverImage ? <img src={form.coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : form.coverEmoji}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>{form.title || 'عنوان المقال'}</h1>
            <div className="article-body" style={{ whiteSpace: 'pre-wrap' }}>{form.content || 'المحتوى سيظهر هنا...'}</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', padding: '1.5rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>عنوان المقال *</label>
                <input className="inp" style={{ fontSize: '1rem', fontWeight: 700 }} placeholder="اكتب عنواناً جذاباً..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', padding: '1.5rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>ملخص المقال</label>
                <textarea className="textarea" rows={2} placeholder="وصف مختصر..." value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(10,61,122,.1)', background: '#F4F7FC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>محتوى المقال *</span>
                  <span style={{ fontSize: '12px', color: '#5A6A8A' }}>{form.content.trim().split(/\s+/).filter(Boolean).length} كلمة</span>
                </div>
                <textarea style={{ width: '100%', minHeight: '300px', padding: '1.2rem', fontFamily: 'Cairo,sans-serif', fontSize: '14px', lineHeight: 1.9, color: '#1A1A2E', border: 'none', outline: 'none', resize: 'none', direction: 'rtl', background: '#fff' }}
                  placeholder="اكتب محتوى مقالك هنا..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', padding: '1.2rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>صورة المقال</label>
                {form.coverImage ? (
                  <div style={{ position: 'relative' }}>
                    <img src={form.coverImage} alt="cover" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px' }} />
                    <button onClick={() => setForm({ ...form, coverImage: '' })} style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(198,40,40,.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px' }}>×</button>
                  </div>
                ) : (
                  <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }} className="hover:border-blue-300">
                    <Upload size={24} style={{ color: '#9CA3AF', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '13px', color: '#5A6A8A' }}>{uploading ? 'جاري الرفع...' : 'انقر لرفع صورة'}</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, margin: '12px 0 8px', color: '#5A6A8A' }}>أو اختر رمز</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px' }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setForm({ ...form, coverEmoji: e })}
                      style={{ height: '36px', borderRadius: '8px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: form.coverEmoji === e ? '2px solid #0A3D7A' : '2px solid transparent', background: form.coverEmoji === e ? 'rgba(10,61,122,.08)' : '#F4F7FC', cursor: 'pointer', transition: 'all .15s' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', padding: '1.2rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>القسم *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {categories.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '10px', border: `1px solid ${form.categoryId === c.id ? '#0A3D7A' : '#e2e8f0'}`, background: form.categoryId === c.id ? 'rgba(10,61,122,.05)' : '#fff', cursor: 'pointer', transition: 'all .2s' }}>
                      <input type="radio" name="cat" className="hidden" checked={form.categoryId === c.id} onChange={() => setForm({ ...form, categoryId: c.id })} />
                      <span style={{ fontSize: '1.2rem' }}>{c.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: form.categoryId === c.id ? '#0A3D7A' : '#374151' }}>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button onClick={submit} disabled={submitting} className="btn btn-p w-full justify-center" style={{ padding: '.85rem' }}>
                {submitting ? 'جاري الإرسال...' : <><Send size={15} /> إرسال للمراجعة</>}
              </button>

              <div style={{ padding: '1rem', borderRadius: '14px', fontSize: '12px', lineHeight: 1.9, background: 'rgba(201,162,39,.08)', border: '1px solid rgba(201,162,39,.2)', color: '#9E7B0E' }}>
                💡 مقالك سيُرسل للمدير للمراجعة — وسيُنشر بعد موافقته.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Eye, Clock, Share2, MessageCircle, Send } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import toast, { Toaster } from 'react-hot-toast'

export default function ArticleClient({ article, comments: init, related, userLiked, isLoggedIn }: any) {
  const [liked, setLiked] = useState(userLiked)
  const [likes, setLikes] = useState(article._count?.likes || 0)
  const [comments, setComments] = useState(init)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleLike = async () => {
    if (!isLoggedIn) { toast.error('سجّل الدخول للإعجاب'); return }
    const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ articleId: article.id, action: liked ? 'unlike' : 'like' }) })
    if (res.ok) { setLiked(!liked); setLikes((l: number) => liked ? l - 1 : l + 1) }
  }

  const handleComment = async () => {
    if (!isLoggedIn) { toast.error('سجّل الدخول للتعليق'); return }
    if (!text.trim()) { toast.error('اكتب تعليقاً أولاً'); return }
    setSending(true)
    const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ articleId: article.id, content: text }) })
    if (res.ok) { const d = await res.json(); setComments([d.comment, ...comments]); setText(''); toast.success('تم إضافة تعليقك ✅') }
    setSending(false)
  }

  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ style: { fontFamily: 'Cairo,sans-serif', direction: 'rtl' } }} />
      <div className="hero-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 30% 50%,#C9A227,transparent 60%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: 'rgba(201,162,39,.2)', border: '1px solid rgba(201,162,39,.4)', color: '#F0C040' }}>
            {article.category?.icon} {article.category?.name}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-snug mb-5" style={{ textShadow: '0 2px 20px rgba(0,0,0,.3)' }}>{article.title}</h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/65 text-sm">
            <span className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg,#C9A227,#F0C040)', color: '#0A3D7A' }}>{getInitials(article.author?.name || 'م')}</div>
              {article.author?.name}
            </span>
            <span className="flex items-center gap-1"><Clock size={13} />{article.readTime} دقائق</span>
            <span className="flex items-center gap-1"><Eye size={13} />{article.views}</span>
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
        </div>
        <div className="gold-line" />
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '2rem' }}>
          <div>
            {article.coverImage ? (
              <div style={{ position: 'relative', height: '280px', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
                <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
              </div>
            ) : (
              <div style={{ height: '200px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', marginBottom: '2rem', background: '#E3F2FD' }}>
                {article.coverEmoji}
              </div>
            )}

            <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '1.2rem 0', margin: '1.5rem 0', borderTop: '1px solid rgba(10,61,122,.1)', borderBottom: '1px solid rgba(10,61,122,.1)' }}>
              <button onClick={handleLike} className="btn" style={{ padding: '.6rem 1.2rem', fontSize: '.875rem', background: liked ? 'rgba(229,57,53,.08)' : 'white', border: `1px solid ${liked ? '#e53935' : '#e2e8f0'}`, color: liked ? '#e53935' : '#5A6A8A' }}>
                <Heart size={15} className={liked ? 'fill-red-500' : ''} /> {likes} إعجاب
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('تم نسخ الرابط 🔗') }} className="btn btn-o" style={{ padding: '.6rem 1.2rem', fontSize: '.875rem' }}>
                <Share2 size={15} /> مشاركة
              </button>
              {!isLoggedIn && <Link href="/login" className="btn" style={{ padding: '.6rem 1.2rem', fontSize: '.875rem', background: '#EFF6FF', color: '#1565C0', border: '1px solid #DBEAFE' }}>🔑 سجّل للتفاعل</Link>}
            </div>

            <div style={{ background: '#EFF6FF', borderRadius: '14px', padding: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #DBEAFE' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0A3D7A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{getInitials(article.author?.name || 'م')}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{article.author?.name}</div>
                <div style={{ fontSize: '13px', color: '#5A6A8A' }}>{article.author?.bio || 'كاتب في مجلة الرازي'}</div>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={18} style={{ color: '#0A3D7A' }} />
              التعليقات <span style={{ fontSize: '13px', fontWeight: 400, color: '#5A6A8A' }}>({comments.length})</span>
            </h3>

            {isLoggedIn ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <textarea className="textarea" rows={3} placeholder="اكتب تعليقك..." value={text} onChange={e => setText(e.target.value)} />
                <button onClick={handleComment} disabled={sending} className="btn btn-p" style={{ marginTop: '8px' }}>
                  {sending ? 'جاري الإرسال...' : <><Send size={14} /> إرسال</>}
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontSize: '14px', color: '#5A6A8A', background: '#F4F7FC', border: '1px solid #e2e8f0' }}>
                <Link href="/login" style={{ color: '#1565C0', fontWeight: 600 }}>سجّل الدخول</Link> للتعليق
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {comments.map((c: any) => (
                <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0A3D7A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{getInitials(c.author?.name || 'م')}</div>
                  <div style={{ flex: 1, background: '#fff', borderRadius: '12px', padding: '12px 15px', border: '1px solid rgba(10,61,122,.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{c.author?.name}</span>
                      <span style={{ fontSize: '11px', color: '#5A6A8A' }}>{formatDate(c.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#5A6A8A', lineHeight: 1.7 }}>{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontSize: '14px' }}>لا توجد تعليقات — كن أول من يعلّق!</div>}
            </div>
          </div>

          <div>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', padding: '1.2rem', marginBottom: '1.2rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '13px' }}>📋 معلومات المقال</h4>
              {[['القسم', `${article.category?.icon} ${article.category?.name}`], ['الكاتب', article.author?.name], ['التاريخ', formatDate(article.publishedAt || article.createdAt)], ['وقت القراءة', `${article.readTime} دقائق`], ['المشاهدات', article.views], ['الإعجابات', likes]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: '#5A6A8A' }}>{l}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {related.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(10,61,122,.1)', padding: '1.2rem', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '13px' }}>📰 مقالات ذات صلة</h4>
                {related.map((r: any) => (
                  <Link key={r.id} href={`/article/${r.slug}`} style={{ display: 'flex', gap: '10px', padding: '8px', borderRadius: '10px', textDecoration: 'none', marginBottom: '4px' }} className="hover:bg-gray-50 transition-colors group">
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#F4F7FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{r.coverEmoji}</div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A2E', lineHeight: 1.4 }} className="group-hover:text-blue-700 line-clamp-2">{r.title}</p>
                      <p style={{ fontSize: '11px', color: '#5A6A8A', marginTop: '2px' }}>{r.author?.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

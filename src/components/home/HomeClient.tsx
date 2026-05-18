'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Eye, Heart, Play } from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'

const CAT_BG: Record<string, string> = {
  'school-news': '#E3F2FD', achievements: '#FFF8E1', events: '#E8F5E9',
  national: '#FFEBEE', stem: '#E8EAF6', sports: '#E0F2F1', culture: '#F3E5F5'
}
const CAT_C: Record<string, string> = {
  'school-news': '#0A3D7A', achievements: '#7A5900', events: '#2E7D32',
  national: '#C62828', stem: '#3949AB', sports: '#00695C', culture: '#6A1B9A'
}

function ArticleCard({ a }: { a: any }) {
  const bg = CAT_BG[a.category?.slug] || '#F4F7FC'
  const color = CAT_C[a.category?.slug] || '#0A3D7A'
  return (
    <Link href={`/article/${a.slug}`} className="card flex flex-col group cursor-pointer">
      {a.coverImage ? (
        <div className="relative h-44 overflow-hidden">
          <Image src={a.coverImage} alt={a.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute top-3 right-3 badge" style={{ background: `${color}18`, color }}>{a.category?.icon} {a.category?.name}</div>
          {a.featured && <div className="absolute top-3 left-3 badge" style={{ background: '#C9A22730', color: '#7A5900' }}>⭐ مميز</div>}
        </div>
      ) : (
        <div className="h-44 flex items-center justify-center text-6xl relative" style={{ background: `linear-gradient(135deg,${bg},${bg}cc)` }}>
          <span className="transition-transform duration-500 group-hover:scale-110">{a.coverEmoji}</span>
          <div className="absolute top-3 right-3 badge" style={{ background: `${color}18`, color }}>{a.category?.icon} {a.category?.name}</div>
          {a.featured && <div className="absolute top-3 left-3 badge" style={{ background: '#C9A22730', color: '#7A5900' }}>⭐ مميز</div>}
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm leading-relaxed line-clamp-2 mb-2 group-hover:text-blue-800 transition-colors">{a.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{a.excerpt}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0A3D7A' }}>{getInitials(a.author?.name || 'م')}</div>
            <span className="text-xs text-gray-500">{a.author?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-0.5"><Eye size={10} />{a.views}</span>
            <span className="flex items-center gap-0.5"><Heart size={10} />{a._count?.likes || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function BannerSlider({ banners }: { banners: any[] }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (banners.length < 2) return
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5000)
    return () => clearInterval(t)
  }, [banners.length])

  if (banners.length === 0) {
    return (
      <div className="relative min-h-screen hero-bg flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.8) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-6" style={{ background: 'rgba(201,162,39,.15)', border: '1px solid rgba(201,162,39,.35)' }}>
            <span className="text-xs font-bold tracking-widest" style={{ color: '#F0C040' }}>✨ العدد السابع عشر • مايو ٢٠٢٦</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-5" style={{ textShadow: '0 4px 30px rgba(0,0,0,.3)' }}>
            مجلة <span style={{ color: '#F0C040' }}>الرازي</span><br />المدرسية الرقمية
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto leading-loose mb-8">منصة تفاعلية تجمع أخبار وإنجازات مدرسة الرازي بنين في دولة الإمارات</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/archive" className="btn btn-a text-base px-8 py-3">📖 استعرض المجلة</Link>
            <Link href="/login" className="btn text-white text-base px-8 py-3" style={{ border: '1px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.1)' }}>🔑 تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    )
  }

  const b = banners[idx]
  return (
    <div className="relative h-screen overflow-hidden">
      <Image src={b.imageUrl} alt={b.title || 'banner'} fill className="object-cover transition-opacity duration-700" priority />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,61,122,.3) 0%, rgba(10,61,122,.6) 100%)' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        {b.title && <h2 className="text-4xl md:text-6xl font-black text-white mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,.5)' }}>{b.title}</h2>}
        {b.subtitle && <p className="text-xl text-white/85 max-w-2xl">{b.subtitle}</p>}
        <div className="flex gap-3 mt-6">
          <Link href="/archive" className="btn btn-a px-8 py-3 text-base">📖 استعرض المجلة</Link>
        </div>
      </div>
      {banners.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + banners.length) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all">
            <ChevronRight size={24} />
          </button>
          <button onClick={() => setIdx(i => (i + 1) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all">
            <ChevronLeft size={24} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className="h-2 rounded-full transition-all"
                style={{ width: i === idx ? '24px' : '8px', background: i === idx ? '#F0C040' : 'rgba(255,255,255,.5)' }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function HomeClient({ banners, articles, categories, media, user }: any) {
  const featured = articles.find((a: any) => a.featured) || articles[0]
  const latest = articles.filter((a: any) => a.id !== featured?.id).slice(0, 6)
  const images = media.filter((m: any) => m.type === 'image').slice(0, 6)
  const videos = media.filter((m: any) => m.type === 'video').slice(0, 4)

  return (
    <>
      {/* BANNER */}
      <BannerSlider banners={banners} />
      <div className="gold-line" />

      {/* FEATURED */}
      {featured && (
        <div className="wrap sec">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', border: '1px solid rgba(10,61,122,.15)' }}>⭐ المقال المميز</div>
            <h2 className="text-3xl font-black" style={{ color: '#1A1A2E' }}>أبرز <span style={{ color: '#1565C0' }}>المحتوى</span></h2>
          </div>
          <Link href={`/article/${featured.slug}`} className="card group flex flex-col md:flex-row overflow-hidden cursor-pointer">
            <div className="md:w-1/2">
              {featured.coverImage ? (
                <div className="relative h-64 md:h-full overflow-hidden">
                  <Image src={featured.coverImage} alt={featured.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              ) : (
                <div className="h-64 md:h-full flex items-center justify-center text-8xl" style={{ background: `linear-gradient(135deg,${CAT_BG[featured.category?.slug] || '#E3F2FD'},#fff)` }}>
                  <span className="transition-transform duration-500 group-hover:scale-110">{featured.coverEmoji}</span>
                </div>
              )}
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <span className="text-xs font-bold mb-3 tracking-widest uppercase" style={{ color: '#C9A227' }}>{featured.category?.icon} {featured.category?.name}</span>
              <h2 className="text-xl font-black leading-snug mb-3 group-hover:text-blue-800 transition-colors">{featured.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{featured.excerpt}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#0A3D7A' }}>{getInitials(featured.author?.name || 'م')}</div>
                <div>
                  <div className="font-bold text-sm">{featured.author?.name}</div>
                  <div className="text-xs text-gray-400">{formatDate(featured.publishedAt || featured.createdAt)}</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* CATEGORIES */}
      <div style={{ background: 'white' }}>
        <div className="wrap sec py-12">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', border: '1px solid rgba(10,61,122,.15)' }}>📑 الأقسام</div>
            <h2 className="text-3xl font-black">تصفح <span style={{ color: '#1565C0' }}>حسب القسم</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '12px' }}>
            {categories.map((cat: any) => (
              <Link key={cat.slug} href={`/archive?cat=${cat.slug}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1.2rem 1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#F9FAFB', textAlign: 'center', textDecoration: 'none', transition: 'all .25s' }}
                className="hover:border-blue-300 hover:shadow-md hover:-translate-y-1">
                <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A2E' }}>{cat.name}</span>
                <span style={{ fontSize: '11px', color: '#5A6A8A' }}>{cat._count?.articles || 0} مقال</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* LATEST ARTICLES */}
      {latest.length > 0 && (
        <div className="wrap sec">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', border: '1px solid rgba(10,61,122,.15)' }}>🕐 الأحدث</div>
              <h2 className="text-3xl font-black">آخر <span style={{ color: '#1565C0' }}>المقالات</span></h2>
            </div>
            <Link href="/archive" className="btn btn-o btn-sm">عرض الكل ←</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
            {latest.map((a: any) => <ArticleCard key={a.id} a={a} />)}
          </div>
        </div>
      )}

      {/* PHOTO GALLERY */}
      {images.length > 0 && (
        <div style={{ background: 'white' }}>
          <div className="wrap sec py-12">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', border: '1px solid rgba(10,61,122,.15)' }}>📸 معرض الصور</div>
              <h2 className="text-3xl font-black">صور <span style={{ color: '#1565C0' }}>المدرسة</span></h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '12px' }}>
              {images.map((img: any) => (
                <div key={img.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3' }}>
                  <Image src={img.url} alt={img.title || 'صورة'} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                  {img.title && (
                    <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, padding: '8px 12px', background: 'linear-gradient(transparent,rgba(0,0,0,.7))', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                      {img.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIDEOS */}
      {videos.length > 0 && (
        <div className="wrap sec">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3" style={{ background: 'rgba(10,61,122,.08)', color: '#0A3D7A', border: '1px solid rgba(10,61,122,.15)' }}>🎥 الفيديوهات</div>
            <h2 className="text-3xl font-black">فيديوهات <span style={{ color: '#1565C0' }}>المدرسة</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
            {videos.map((v: any) => (
              <div key={v.id} style={{ borderRadius: '16px', overflow: 'hidden', background: '#000', aspectRatio: '16/9', position: 'relative' }}>
                {v.url.includes('youtube') || v.url.includes('youtu.be') ? (
                  <iframe
                    src={v.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full" allowFullScreen style={{ border: 'none' }} />
                ) : (
                  <video src={v.url} controls className="w-full h-full object-cover" />
                )}
                {v.title && (
                  <div style={{ padding: '8px 12px', background: '#1A1A2E', color: '#fff', fontSize: '13px', fontWeight: 600 }}>{v.title}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="wrap sec">
        <div style={{ borderRadius: '24px', padding: '3.5rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg,#071E3D,#0A3D7A)', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>شارك في صنع المجلة</h2>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '14px', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: 1.9 }}>
            سجّل الدخول وشارك بمقالاتك وأخبار مدرستك — ستُنشر بعد موافقة المدير
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/editor" className="btn btn-a text-base px-8 py-3">✍️ أضف مقالاً</Link>
            ) : (
              <Link href="/login" className="btn btn-a text-base px-8 py-3">🔑 تسجيل الدخول</Link>
            )}
            <Link href="/archive" className="btn text-white text-base px-8 py-3" style={{ border: '1px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.1)' }}>📖 تصفح المجلة</Link>
          </div>
        </div>
      </div>
    </>
  )
}

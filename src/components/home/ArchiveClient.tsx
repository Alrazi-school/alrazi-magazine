'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Eye, Heart } from 'lucide-react'
import { getInitials } from '@/lib/utils'

const CAT_BG: Record<string, string> = { 'school-news': '#E3F2FD', achievements: '#FFF8E1', events: '#E8F5E9', national: '#FFEBEE', stem: '#E8EAF6', sports: '#E0F2F1', culture: '#F3E5F5' }
const CAT_C: Record<string, string> = { 'school-news': '#0A3D7A', achievements: '#7A5900', events: '#2E7D32', national: '#C62828', stem: '#3949AB', sports: '#00695C', culture: '#6A1B9A' }

export default function ArchiveClient({ articles, categories, activeCat }: any) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState(activeCat || '')
  const [sort, setSort] = useState('newest')

  const filtered = useMemo(() => {
    let r = [...articles]
    if (cat) r = r.filter((a: any) => a.category?.slug === cat)
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter((a: any) => a.title.includes(q) || a.excerpt?.includes(q) || a.author?.name.includes(q)) }
    if (sort === 'popular') r.sort((a: any, b: any) => b.views - a.views)
    if (sort === 'liked') r.sort((a: any, b: any) => (b._count?.likes || 0) - (a._count?.likes || 0))
    return r
  }, [articles, cat, search, sort])

  return (
    <>
      <div className="hero-bg py-14 text-center px-4">
        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4" style={{ background: 'rgba(201,162,39,.2)', border: '1px solid rgba(201,162,39,.35)', color: '#F0C040' }}>📁 الأرشيف</div>
        <h1 className="text-4xl font-black text-white mb-2">جميع المقالات</h1>
        <p className="text-white/60 text-sm">تصفح جميع مقالات مجلة الرازي</p>
      </div>
      <div className="gold-line" />

      <div className="wrap sec">
        <div className="bg-white rounded-2xl p-4 mb-6 flex flex-wrap gap-3" style={{ border: '1px solid rgba(10,61,122,.1)', boxShadow: '0 4px 20px rgba(10,61,122,.08)' }}>
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="inp pr-10 text-sm" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="inp w-40 text-sm cursor-pointer" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">الأحدث</option>
            <option value="popular">الأكثر مشاهدة</option>
            <option value="liked">الأكثر إعجاباً</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setCat('')} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: cat === '' ? '#0A3D7A' : 'white', color: cat === '' ? 'white' : '#5A6A8A', border: '1px solid', borderColor: cat === '' ? '#0A3D7A' : '#e2e8f0' }}>
            الكل ({articles.length})
          </button>
          {categories.map((c: any) => (
            <button key={c.slug} onClick={() => setCat(c.slug)} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: cat === c.slug ? '#0A3D7A' : 'white', color: cat === c.slug ? 'white' : '#5A6A8A', border: '1px solid', borderColor: cat === c.slug ? '#0A3D7A' : '#e2e8f0' }}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 mb-5">{filtered.length} مقال</p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-3">🔍</div><p>لا توجد نتائج</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
            {filtered.map((a: any) => {
              const bg = CAT_BG[a.category?.slug] || '#F4F7FC'
              const color = CAT_C[a.category?.slug] || '#0A3D7A'
              return (
                <Link key={a.id} href={`/article/${a.slug}`} className="card flex flex-col group cursor-pointer">
                  {a.coverImage ? (
                    <div className="relative h-44 overflow-hidden">
                      <Image src={a.coverImage} alt={a.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-3 right-3 badge" style={{ background: `${color}18`, color }}>{a.category?.icon} {a.category?.name}</div>
                    </div>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-6xl relative" style={{ background: `linear-gradient(135deg,${bg},${bg}cc)` }}>
                      <span className="transition-transform duration-500 group-hover:scale-110">{a.coverEmoji}</span>
                      <div className="absolute top-3 right-3 badge" style={{ background: `${color}18`, color }}>{a.category?.icon} {a.category?.name}</div>
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
            })}
          </div>
        )}
      </div>
    </>
  )
}

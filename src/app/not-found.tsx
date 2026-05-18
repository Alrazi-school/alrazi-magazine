import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen hero-bg flex items-center justify-center text-center p-4">
      <div>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>📭</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>الصفحة غير موجودة</h1>
        <p style={{ color: 'rgba(255,255,255,.65)', marginBottom: '2rem' }}>عذراً، الصفحة التي تبحث عنها غير متاحة</p>
        <Link href="/" className="btn btn-a px-8 py-3 text-base">🏠 العودة للرئيسية</Link>
      </div>
    </div>
  )
}

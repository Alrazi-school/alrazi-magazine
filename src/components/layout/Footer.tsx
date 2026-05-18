import Link from 'next/link'
export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg,#071E3D,#0A3D7A)' }}>
      <div style={{ height: '3px', background: 'linear-gradient(90deg,transparent,#C9A227 30%,#F0C040 50%,#C9A227 70%,transparent)' }} />
      <div className="wrap" style={{ padding: '3rem 1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#C9A227,#F0C040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', color: '#0A3D7A' }}>ر</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>مجلة الرازي</div>
                <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '11px' }}>الحلقة الثانية • بنين</div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '13px', lineHeight: 1.9 }}>منصة رقمية لمدرسة الرازي بنين في دولة الإمارات العربية المتحدة.</p>
          </div>
          <div>
            <h4 style={{ color: '#F0C040', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>روابط سريعة</h4>
            {[['/', 'الرئيسية'], ['/archive', 'المقالات'], ['/login', 'تسجيل الدخول']].map(([h, l]) => (
              <Link key={h} href={h} style={{ display: 'block', color: 'rgba(255,255,255,.6)', fontSize: '13px', marginBottom: '6px', textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#F0C040', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>التواصل</h4>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '13px' }}>📧 hany.aboueldahab@moe.sch.ae</p>
            <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '13px', marginTop: '6px' }}>📍 دبي، الإمارات العربية المتحدة</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.35)', fontSize: '12px' }}>
          © 2026 مجلة الرازي المدرسية • مدرسة الرازي بنين - الحلقة الثانية
        </div>
      </div>
    </footer>
  )
}

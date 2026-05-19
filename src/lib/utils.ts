export function cn(...c: any[]) { return c.filter(Boolean).join(' ') }
export function formatDate(d: any) {
  return new Date(d).toLocaleDateString('ar-AE', { year: 'numeric', month: 'long', day: 'numeric' })
}
export function getInitials(n: string) { return n.split(' ').slice(0, 2).map((x: string) => x[0]).join('') }
export function getRoleLabel(r: string) { return ({ ADMIN: 'مدير', TEACHER: 'معلم', STUDENT: 'طالب' } as any)[r] || r }
export function getStatusLabel(s: string) { return ({ PUBLISHED: 'منشور', REVIEW: 'قيد المراجعة', DRAFT: 'مسودة', REJECTED: 'مرفوض' } as any)[s] || s }
export function slugify(t: string) {
  const timestamp = Date.now()
  const clean = t
    .slice(0, 40)
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `article-${timestamp}-${clean}`.slice(0, 80)
}

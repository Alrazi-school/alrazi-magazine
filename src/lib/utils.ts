export function cn(...c: any[]) { return c.filter(Boolean).join(' ') }
export function formatDate(d: any) {
  return new Date(d).toLocaleDateString('ar-AE', { year: 'numeric', month: 'long', day: 'numeric' })
}
export function getInitials(n: string) { return n.split(' ').slice(0, 2).map(x => x[0]).join('') }
export function getRoleLabel(r: string) { return ({ ADMIN: 'مدير', TEACHER: 'معلم', STUDENT: 'طالب' } as any)[r] || r }
export function getStatusLabel(s: string) { return ({ PUBLISHED: 'منشور', REVIEW: 'قيد المراجعة', DRAFT: 'مسودة', REJECTED: 'مرفوض' } as any)[s] || s }
export function slugify(t: string) { return t.replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '').slice(0, 60) + '-' + Date.now() }

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  // Check if already seeded
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'hany.aboueldahab@moe.sch.ae' }
  })

  if (existingAdmin) {
    console.log('✅ Already seeded - skipping')
    return
  }

  const hash = await bcrypt.hash('Alrazi@2026', 10)

  // Admin
  await prisma.user.create({
    data: {
      name: 'هاني أبو الدهب',
      email: 'hany.aboueldahab@moe.sch.ae',
      password: hash,
      role: 'ADMIN',
      active: true
    }
  })

  // Categories
  const cats = [
    { name: 'أخبار المدرسة', slug: 'school-news', icon: '📰', order: 1 },
    { name: 'إنجازات الطلاب', slug: 'achievements', icon: '🏆', order: 2 },
    { name: 'الفعاليات', slug: 'events', icon: '🎉', order: 3 },
    { name: 'الهوية الوطنية', slug: 'national', icon: '🇦🇪', order: 4 },
    { name: 'STEM والتقنية', slug: 'stem', icon: '🔬', order: 5 },
    { name: 'الرياضة والصحة', slug: 'sports', icon: '⚽', order: 6 },
    { name: 'الثقافة والأدب', slug: 'culture', icon: '📚', order: 7 },
  ]

  for (const cat of cats) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    })
  }

  console.log('✅ Admin created: hany.aboueldahab@moe.sch.ae / Alrazi@2026')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

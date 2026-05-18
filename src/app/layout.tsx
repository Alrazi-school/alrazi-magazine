import './globals.css'
export const metadata = { title: { template: '%s | مجلة الرازي', default: 'مجلة الرازي المدرسية' }, description: 'مجلة مدرسة الرازي بنين الرقمية' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;900&display=swap" rel="stylesheet" /></head>
      <body>{children}</body>
    </html>
  )
}

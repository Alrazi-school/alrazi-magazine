# مجلة الرازي المدرسية v3

## ✅ المميزات
- بانر صور متحرك قابل للتعديل
- صفحة رئيسية بمقالات وصور وفيديوهات
- نظام مقالات حقيقي مع قاعدة بيانات
- لوحة تحكم للمدير فقط (محمية)
- إضافة/حذف أعضاء من لوحة التحكم
- رفع صور عبر Cloudinary
- نظام مراجعة المقالات (قبول/رفض)
- تعليقات وإعجابات حقيقية
- تسجيل دخول آمن

## 🚀 النشر على Railway

### 1. ارفع على GitHub
```
git init
git add .
git commit -m "مجلة الرازي v3"
git push -u origin main
```

### 2. في Railway
- New Project → Deploy from GitHub
- أضف PostgreSQL Database
- أضف هذه المتغيرات في Variables:

```
DATABASE_URL          = (من PostgreSQL في Railway)
SESSION_SECRET        = alrazi-magazine-secret-2026-very-secure
CLOUDINARY_CLOUD_NAME = dcyoyuinb
CLOUDINARY_API_KEY    = 142862647282826
CLOUDINARY_API_SECRET = YVBNVUA4eYpSATN1aUTNz74KS_w
NODE_ENV              = production
```

### 3. احصل على الرابط
Settings → Networking → Generate Domain

## 🔑 بيانات الدخول
```
البريد   : hany.aboueldahab@moe.sch.ae
كلمة السر: Alrazi@2026
لوحة التحكم: yoursite.railway.app/admin
```

> تأكد من تغيير كلمة السر بعد أول دخول

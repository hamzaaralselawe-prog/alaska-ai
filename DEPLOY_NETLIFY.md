# خطوات نشر تطبيق ألاسكا على Netlify

لنشر التطبيق وجعله متاحاً للجميع، اتبع الخطوات التالية:

## 1. تجهيز الكود
لقد قمت بإضافة جميع ملفات الإعداد اللازمة (`package.json`, `vite.config.ts`, `netlify.toml`). تأكد من تحميل جميع الملفات في مجلد واحد على جهازك.

## 2. رفع الكود إلى GitHub
1. أنشئ حساباً على [GitHub](https://github.com).
2. أنشئ مستودعاً جديداً (New Repository).
3. ارفع ملفات المشروع إلى هذا المستودع.

## 3. الربط مع Netlify
1. أنشئ حساباً على [Netlify](https://www.netlify.com).
2. اختر **"Add new site"** ثم **"Import an existing project"**.
3. اختر **GitHub**.
4. اختر مستودع "ألاسكا" الذي قمت بإنشائه.

## 4. إعدادات البناء (Build Settings)
سيقوم Netlify باكتشاف الإعدادات تلقائياً بفضل الملفات التي أضفتها، لكن للتأكد:
- **Build command**: `npm run build`
- **Publish directory**: `dist`

## 5. إضافة مفتاح API (خطوة مهمة جداً)
لكي يعمل الذكاء الاصطناعي، يجب إضافة المفتاح في إعدادات Netlify:
1. في لوحة تحكم Netlify لمشروعك، اذهب إلى **Site configuration**.
2. اختر **Environment variables**.
3. اضغط **Add a variable**.
4. **Key**: اكتب `API_KEY`
5. **Value**: الصق مفتاح Gemini API الخاص بك (الذي يبدأ بـ AIza...).
6. اضغط **Create variable**.

## 6. النشر
بعد إضافة المفتاح، اذهب إلى تبويب **Deploys** واضغط **Trigger deploy** لإعادة البناء مع المفتاح الجديد.

مبروك! تطبيقك الآن يعمل أونلاين.

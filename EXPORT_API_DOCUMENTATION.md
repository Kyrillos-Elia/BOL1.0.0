# 📊 Export API Documentation

## نظرة عامة

تم تحديث نظام التصدير ليوفر خيارات متعددة لتصدير البيانات:

- **JSON Export**: لكل جداول (العائلات، الأدوية، التوزيعات)
- **CSV Export**: تصدير إلى ملفات Excel مع ضمان تضمن جميع الحقول

---

## 1️⃣ تصدير العائلات

### JSON Export

```
GET /api/families/export/all
```

- يعيد جميع بيانات العائلات بصيغة JSON
- الحقول: `id`, `family_code`, `head_name`, `national_id`, `address`, `phone`, `category`, `members_count`, `zone`, `notes`, `created_at`, `updated_at`

### CSV Export ✅ **جديد**

```
GET /api/families/export-csv
```

- تنزيل ملف CSV جاهز لـ Excel
- ✅ يتضمن `head_name` (كان ناقص في النسخة السابقة)
- ✅ جميع الحقول مرفقة بشكل صحيح
- الترميز: UTF-8 مع BOM لدعم الأحرف العربية

**مثال الاستجابة:**

```
"id","family_code","head_name","national_id","address","phone","category","members_count","zone","notes","created_at","updated_at"
"family-001","P-001","أحمد محمد علي","29901011234567","القاهرة - مدينة نصر","01012345678","A","5","A1","ضغط وسكري","2024-01-01T10:30:00Z","2026-05-18T20:30:02.193Z"
```

---

## 2️⃣ تصدير الأدوية

### JSON Export

```
GET /api/medicines/export/all
```

### CSV Export ✅ **جديد**

```
GET /api/medicines/export-csv
```

- تنزيل ملف CSV جاهز لـ Excel
- ✅ الحقول الكاملة: `id`, `med_name`, `scientific_name`, `stock_quantity`, `min_stock_alert`, `expiry_date`, `unit_price`, `dosage_form`, `supplier`, `batch_number`, `description`, `created_at`, `updated_at`

---

## 3️⃣ تصدير التوزيعات

### JSON Export

```
GET /api/distributions/export/all
```

### CSV Export ✅ **جديد**

```
GET /api/distributions/export-csv
```

- تنزيل ملف CSV جاهز لـ Excel
- ✅ يتضمن: `id`, `family_id`, `medicine_id`, `quantity_internal`, `quantity_external`, `date`, `month`, `status`, `notes`, `created_by`, `created_at`, `updated_at`

---

## 📈 Dashboard Stats - تكاليف الصيدلية

### الـ Endpoint

```
GET /api/stats/dashboard
```

### الحقول الجديدة:

```javascript
{
  // إجمالي التكاليف
  "total_cost": 761.75,
  "cost_this_month": 219.25,

  // ✅ جديد: تكاليف الصيدلية الداخلية
  "cost_internal_total": 267.25,
  "cost_internal_this_month": 109.75,

  // ✅ جديد: تكاليف الصيدلية الخارجية
  "cost_external_total": 494.5,
  "cost_external_this_month": 109.5,

  // بيانات أخرى
  "total_families": 17,
  "total_medicines": 15,
  "total_distributions": 21,
  // ...
}
```

---

## 🔧 كيفية الاستخدام

### 1. تنزيل ملف CSV من المتصفح:

```
مباشرة من المتصفح:
http://localhost:3000/api/families/export-csv
http://localhost:3000/api/medicines/export-csv
http://localhost:3000/api/distributions/export-csv
```

### 2. تنزيل باستخدام PowerShell:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/families/export-csv" -OutFile "families.csv"
```

### 3. قراءة البيانات من JavaScript:

```javascript
async function exportFamilies() {
  const response = await fetch("/api/families/export-csv");
  const blob = await response.blob();

  // تنزيل الملف
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "families_export.csv";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}
```

---

## ✨ ميزات التصدير

### CSV Export Features:

- ✅ **Proper Encoding**: UTF-8 مع BOM للدعم العربي
- ✅ **Quote Escaping**: جميع الأحرف الخاصة مرفقة بشكل صحيح
- ✅ **Complete Fields**: لا توجد حقول ناقصة
- ✅ **Excel Compatible**: يفتح مباشرة في Excel بشكل صحيح
- ✅ **Null Handling**: القيم الفارغة معالجة بشكل صحيح

---

## 🎯 ملخص التحديثات

| الميزة                   | الحالة   | الملاحظات                        |
| ------------------------ | -------- | -------------------------------- |
| تصدير CSV للعائلات       | ✅ مكتمل | يتضمن head_name                  |
| تصدير CSV للأدوية        | ✅ مكتمل | جميع الحقول                      |
| تصدير CSV للتوزيعات      | ✅ مكتمل | يتضمن quantity_internal/external |
| تكاليف الصيدلية الداخلية | ✅ مكتمل | في Dashboard                     |
| تكاليف الصيدلية الخارجية | ✅ مكتمل | في Dashboard                     |
| استيراد البيانات         | ✅ متاح  | JSON format                      |

---

## 📝 ملاحظات مهمة

1. **البيانات الكاملة**: تأكد من أن جميع الحقول المطلوبة موجودة في الملف
2. **الترميز**: استخدم UTF-8 دائماً عند قراءة ملفات CSV
3. **التاريخ**: جميع التواريخ بصيغة ISO 8601 (2024-01-01T10:30:00Z)
4. **الأرقام**: الأسعار والكميات بصيغة رقمية صحيحة

---

**آخر تحديث**: 2026-06-24
**الإصدار**: 1.0.0 (مع دعم CSV)

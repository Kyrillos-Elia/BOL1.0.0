/**
 * Script to add new test data to MongoDB
 */

import http from 'http';

const API_BASE = 'http://localhost:3000/api';

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function addUser(userData) {
  try {
    const data = await makeRequest('/users', 'POST', userData);
    if (data.success) {
      console.log(`✅ تم إضافة مستخدم: ${userData.full_name}`);
    } else {
      console.log(`❌ خطأ: ${data.error}`);
    }
  } catch (error) {
    console.error(`❌ خطأ في الإضافة: ${error.message}`);
  }
}

async function addFamily(familyData) {
  try {
    const data = await makeRequest('/families', 'POST', familyData);
    if (data.success) {
      console.log(`✅ تم إضافة عائلة: ${familyData.head_name}`);
    } else {
      console.log(`❌ خطأ: ${data.error}`);
    }
  } catch (error) {
    console.error(`❌ خطأ في الإضافة: ${error.message}`);
  }
}

async function addMedicine(medicineData) {
  try {
    const data = await makeRequest('/medicines', 'POST', medicineData);
    if (data.success) {
      console.log(`✅ تم إضافة دواء: ${medicineData.med_name}`);
    } else {
      console.log(`❌ خطأ: ${data.error}`);
    }
  } catch (error) {
    console.error(`❌ خطأ في الإضافة: ${error.message}`);
  }
}

async function main() {
  console.log('\n🔄 جاري إضافة البيانات الجديدة...\n');

  // إضافة مستخدمين جدد
  console.log('👥 إضافة مستخدمين جدد:');
  await addUser({
    full_name: 'فاطمة أحمد محمود',
    username: 'fatima_manager_new',
    password: 'fatima@2024',
    role: 'Manager',
    email: 'fatima@brothersofthelord.com',
    phone: '01077778888'
  });

  await addUser({
    full_name: 'إبراهيم خالد سالم',
    username: 'ibrahim_staff_new',
    password: 'ibrahim@2024',
    role: 'Staff',
    email: 'ibrahim@brothersofthelord.com',
    phone: '01099990000'
  });

  console.log('\n👨‍👩‍👧‍👦 إضافة عائلات جديدة:');
  // إضافة عائلات جديدة
  await addFamily({
    head_name: 'علي محمود حسن',
    family_code: 'P-ALI-001',
    national_id: '39876543210123',
    address: 'شارع النيل، القاهرة',
    phone: '01011112222',
    category: 'A',
    members_count: 6,
    zone: 'A2',
    notes: 'عائلة جديدة معسكرة 2024'
  });

  await addFamily({
    head_name: 'نادية إبراهيم علي',
    family_code: 'P-NADIA-02',
    national_id: '39123456789012',
    address: 'شارع التحرير، الجيزة',
    phone: '01033334444',
    category: 'B',
    members_count: 4,
    zone: 'A1',
    notes: 'مستحقة للمساعدة'
  });

  await addFamily({
    head_name: 'حسام الدين محمد أحمد',
    family_code: 'P-HOSSAM-3',
    national_id: '38765432109876',
    address: 'شارع 26 يوليو، الإسكندرية',
    phone: '01055556666',
    category: 'C',
    members_count: 8,
    zone: 'B2',
    notes: 'عائلة كبيرة تحتاج دعم'
  });

  console.log('\n💊 إضافة أدوية جديدة:');
  // إضافة أدوية جديدة
  await addMedicine({
    med_name: 'أتينولول',
    scientific_name: 'Atenolol',
    stock_quantity: 300,
    min_stock_alert: 50,
    expiry_date: '2027-12-31',
    unit_price: 2.0,
    dosage_form: 'قرص',
    supplier: 'شركة فارما جولد',
    batch_number: 'ATN-2024-001',
    description: 'دواء لعلاج ارتفاع ضغط الدم'
  });

  await addMedicine({
    med_name: 'سيتالوبرام',
    scientific_name: 'Citalopram',
    stock_quantity: 200,
    min_stock_alert: 40,
    expiry_date: '2027-11-30',
    unit_price: 3.5,
    dosage_form: 'قرص',
    supplier: 'شركة آراء فارما',
    batch_number: 'CIT-2024-002',
    description: 'دواء مضاد للاكتئاب'
  });

  await addMedicine({
    med_name: 'سيبروفلوكساسين',
    scientific_name: 'Ciprofloxacin',
    stock_quantity: 400,
    min_stock_alert: 60,
    expiry_date: '2027-10-31',
    unit_price: 1.25,
    dosage_form: 'قرص',
    supplier: 'شركة نيل فارما',
    batch_number: 'CIP-2024-003',
    description: 'مضاد حيوي واسع المدى'
  });

  console.log('\n✅ انتهت عملية الإضافة!\n');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ خطأ:', error.message);
  process.exit(1);
});

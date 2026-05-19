/**
 * ============================================================================
 * Export API Test Script
 * ============================================================================
 * اختبار جميع مسارات التصدير والإحصائيات الجديدة
 * 
 * الاستخدام:
 * node test-exports.js
 * ============================================================================
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          data: data,
          headers: res.headers
        });
      });
    }).on('error', reject);
  });
}

/**
 * Test CSV Export
 */
async function testCSVExport(name, path) {
  console.log(`\n${colors.cyan}📊 Testing CSV Export: ${name}${colors.reset}`);
  console.log(`   URL: ${BASE_URL}${path}`);
  
  try {
    const response = await makeRequest(`${BASE_URL}${path}`);
    
    if (response.status !== 200) {
      console.log(`${colors.red}✗ FAILED - Status: ${response.status}${colors.reset}`);
      return false;
    }
    
    // Parse CSV
    const lines = response.data.trim().split('\n');
    const headerLine = lines[0];
    const dataLines = lines.slice(1);
    
    console.log(`${colors.green}✓ Status: ${response.status}${colors.reset}`);
    console.log(`${colors.green}✓ Content-Type: ${response.contentType}${colors.reset}`);
    console.log(`${colors.green}✓ Headers: ${headerLine.substring(0, 100)}...${colors.reset}`);
    console.log(`${colors.green}✓ Data rows: ${dataLines.length}${colors.reset}`);
    
    if (dataLines.length > 0) {
      console.log(`${colors.green}✓ First row: ${dataLines[0].substring(0, 80)}...${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ ERROR: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test JSON Export
 */
async function testJSONExport(name, path) {
  console.log(`\n${colors.cyan}📄 Testing JSON Export: ${name}${colors.reset}`);
  console.log(`   URL: ${BASE_URL}${path}`);
  
  try {
    const response = await makeRequest(`${BASE_URL}${path}`);
    
    if (response.status !== 200) {
      console.log(`${colors.red}✗ FAILED - Status: ${response.status}${colors.reset}`);
      return false;
    }
    
    const data = JSON.parse(response.data);
    const count = Array.isArray(data) ? data.length : 0;
    
    console.log(`${colors.green}✓ Status: ${response.status}${colors.reset}`);
    console.log(`${colors.green}✓ Records: ${count}${colors.reset}`);
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ ERROR: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test Dashboard Stats
 */
async function testDashboardStats() {
  console.log(`\n${colors.cyan}📈 Testing Dashboard Statistics${colors.reset}`);
  console.log(`   URL: ${BASE_URL}/api/stats/dashboard`);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/stats/dashboard`);
    
    if (response.status !== 200) {
      console.log(`${colors.red}✗ FAILED - Status: ${response.status}${colors.reset}`);
      return false;
    }
    
    const json = JSON.parse(response.data);
    const data = json.data;
    
    console.log(`${colors.green}✓ Status: ${response.status}${colors.reset}`);
    console.log(`${colors.green}✓ Total Families: ${data.total_families}${colors.reset}`);
    console.log(`${colors.green}✓ Total Medicines: ${data.total_medicines}${colors.reset}`);
    console.log(`${colors.green}✓ Total Distributions: ${data.total_distributions}${colors.reset}`);
    
    // Check new pharmacy cost fields
    console.log(`\n${colors.yellow}💊 Pharmacy Costs:${colors.reset}`);
    console.log(`   Total Cost: ${data.total_cost}`);
    console.log(`   This Month: ${data.cost_this_month}`);
    console.log(`${colors.green}   ✓ Internal Pharmacy Total: ${data.cost_internal_total}${colors.reset}`);
    console.log(`${colors.green}   ✓ Internal Pharmacy This Month: ${data.cost_internal_this_month}${colors.reset}`);
    console.log(`${colors.green}   ✓ External Pharmacy Total: ${data.cost_external_total}${colors.reset}`);
    console.log(`${colors.green}   ✓ External Pharmacy This Month: ${data.cost_external_this_month}${colors.reset}`);
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ ERROR: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.blue}${'='.repeat(70)}`);
  console.log('🧪 EXPORT API TEST SUITE');
  console.log(`${'='.repeat(70)}${colors.reset}\n`);
  
  const results = [];
  
  // Test CSV Exports
  results.push(await testCSVExport('Families', '/api/families/export-csv'));
  results.push(await testCSVExport('Medicines', '/api/medicines/export-csv'));
  results.push(await testCSVExport('Distributions', '/api/distributions/export-csv'));
  
  // Test JSON Exports
  results.push(await testJSONExport('Families', '/api/families/export/all'));
  results.push(await testJSONExport('Medicines', '/api/medicines/export/all'));
  results.push(await testJSONExport('Distributions', '/api/distributions/export/all'));
  
  // Test Dashboard Stats
  results.push(await testDashboardStats());
  
  // Summary
  console.log(`\n${colors.blue}${'='.repeat(70)}`);
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    console.log(`${colors.green}✓ ALL TESTS PASSED (${passed}/${total})${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ SOME TESTS FAILED (${passed}/${total} passed)${colors.reset}`);
  }
  console.log(`${'='.repeat(70)}\n`);
}

// Run tests
runTests().catch(console.error);

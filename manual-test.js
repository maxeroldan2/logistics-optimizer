import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function manualDragDropTest() {
  console.log('🚀 Starting Manual Drag & Drop Test...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    slowMo: 300,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  
  // Enable console monitoring
  const consoleLogs = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    console.log(`🔍 Console: [${msg.type()}] ${text}`);
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('❌ Page Error:', error.message);
  });
  
  try {
    console.log('📡 Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Wait for app to load
    await delay(3000);
    
    console.log('✅ App loaded successfully');
    
    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/manual-01-initial.png', fullPage: true });
    console.log('📸 Screenshot saved: manual-01-initial.png');
    
    console.log('\n🔍 Checking page content for drag & drop references...');
    const pageContent = await page.content();
    
    const hasDragReferences = pageContent.includes('Drag') || pageContent.includes('Drop');
    console.log(`📋 Page contains drag/drop references: ${hasDragReferences}`);
    
    // Check for visible elements
    console.log('\n🔍 Checking for visible buttons and elements...');
    
    // Get all buttons
    const allButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent.trim(),
        visible: btn.offsetParent !== null,
        className: btn.className,
        id: btn.id
      })).filter(btn => btn.visible && btn.text);
    });
    
    console.log('📋 Found buttons:', allButtons);
    
    // Check for containers and products
    const containers = await page.evaluate(() => {
      return document.querySelectorAll('[data-testid*="container"], .container, *[class*="container"]').length;
    });
    
    const products = await page.evaluate(() => {
      return document.querySelectorAll('[data-testid*="product"], .product, *[class*="product"]').length;
    });
    
    console.log(`📦 Found ${products} product elements`);
    console.log(`🗃️ Found ${containers} container elements`);
    
    // Try clicking Add Product button
    if (allButtons.find(btn => btn.text.includes('Add Product'))) {
      console.log('\n➕ Attempting to add a product...');
      
      await page.click('button');
      await delay(1000);
      
      // Take screenshot after click
      await page.screenshot({ path: 'screenshots/manual-02-after-interaction.png', fullPage: true });
      console.log('📸 Screenshot saved: manual-02-after-interaction.png');
      
      // Check if any modal or form appeared
      const hasModal = await page.evaluate(() => {
        return document.querySelector('[role="dialog"], .modal, .form, form') !== null;
      });
      
      console.log(`📋 Modal/Form appeared: ${hasModal}`);
      
      if (hasModal) {
        // Try to fill form
        const inputs = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('input')).map(input => ({
            type: input.type,
            name: input.name,
            placeholder: input.placeholder,
            visible: input.offsetParent !== null
          })).filter(input => input.visible);
        });
        
        console.log('📋 Found inputs:', inputs);
      }
    }
    
    // Wait to see if drag & drop section appears
    await delay(3000);
    
    // Final check for drag & drop elements
    const dragDropElements = await page.evaluate(() => {
      const selectors = [
        '[data-testid*="drag"]',
        '[data-testid*="drop"]',
        '[class*="drag"]',
        '[class*="drop"]',
        '[draggable="true"]'
      ];
      
      const found = [];
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          found.push({ selector, count: elements.length });
        }
      });
      
      return found;
    });
    
    console.log('\n🎯 Drag & Drop elements found:', dragDropElements);
    
    // Try to find any draggable elements
    const draggableElements = await page.evaluate(() => {
      return document.querySelectorAll('[draggable="true"]').length;
    });
    
    console.log(`🎯 Draggable elements: ${draggableElements}`);
    
    // Check for any console logs that mention drag & drop
    const dragDropLogs = consoleLogs.filter(log => 
      log.toLowerCase().includes('drag') || 
      log.toLowerCase().includes('drop') ||
      log.toLowerCase().includes('dnd')
    );
    
    console.log('\n📝 Drag & Drop related console logs:', dragDropLogs);
    
    console.log('\n🕐 Pausing for 10 seconds for manual inspection...');
    await delay(10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    errors.push(error.message);
    
    // Take error screenshot
    try {
      await page.screenshot({ path: 'screenshots/manual-error.png', fullPage: true });
      console.log('📸 Error screenshot saved: manual-error.png');
    } catch (e) {
      console.log('Could not take error screenshot');
    }
  }
  
  // Generate simplified report
  console.log('\n' + '='.repeat(60));
  console.log('📋 MANUAL DRAG & DROP TEST REPORT');
  console.log('='.repeat(60));
  console.log(`✅ App Loading: ${errors.length === 0 ? 'SUCCESS' : 'FAILED'}`);
  console.log(`📊 Console Logs Captured: ${consoleLogs.length}`);
  console.log(`❌ Errors Found: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n🚨 ERRORS DETECTED:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  const recent = consoleLogs.slice(-10);
  console.log('\n📝 RECENT CONSOLE LOGS:');
  recent.forEach(log => console.log(log));
  
  const report = {
    timestamp: new Date().toISOString(),
    appLoaded: errors.length === 0,
    errorsFound: errors,
    consoleLogsCount: consoleLogs.length,
    consoleLogs: recent
  };
  
  // Save report
  const reportPath = path.join(__dirname, 'manual-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📁 Test report saved to: ${reportPath}`);
  console.log('📸 Screenshots saved to: screenshots/ directory');
  console.log('\n='.repeat(60));
  
  await browser.close();
  console.log('🏁 Manual test completed!');
}

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Run the test
manualDragDropTest().catch(console.error);
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function finalDragDropTest() {
  console.log('🚀 Starting Final Drag & Drop Refactor Test...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: false,
    slowMo: 150,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  
  const consoleLogs = [];
  const dragDropLogs = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (text.toLowerCase().includes('drag') || text.toLowerCase().includes('drop') || text.includes('🎯')) {
      dragDropLogs.push(`[${msg.type()}] ${text}`);
      console.log(`🎯 D&D: [${msg.type()}] ${text}`);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('❌ Page Error:', error.message);
  });
  
  try {
    console.log('📡 Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await delay(3000);
    
    console.log('✅ App loaded successfully');
    await page.screenshot({ path: 'screenshots/final-01-initial.png', fullPage: true });
    
    // Step 1: Add containers
    console.log('\n🗃️ Adding containers...');
    
    // Find and click Add Container button
    const addContainerBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Add Container'));
    });
    
    if (addContainerBtn && await addContainerBtn.asElement()) {
      for (let i = 1; i <= 2; i++) {
        console.log(`Adding container ${i}...`);
        await addContainerBtn.asElement().click();
        await delay(1000);
        
        // Look for name input
        const nameInput = await page.$('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]');
        if (nameInput) {
          await nameInput.click();
          await nameInput.type(`Container ${i}`, { delay: 50 });
          
          // Look for submit/save button
          const submitBtn = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => 
              btn.type === 'submit' || 
              btn.textContent.includes('Save') || 
              btn.textContent.includes('Add') ||
              btn.textContent.includes('✓')
            );
          });
          
          if (submitBtn && await submitBtn.asElement()) {
            await submitBtn.asElement().click();
            await delay(1500);
            console.log(`✅ Added Container ${i}`);
          } else {
            // Try pressing Enter
            await nameInput.press('Enter');
            await delay(1500);
            console.log(`✅ Added Container ${i} (via Enter)`);
          }
        }
      }
    }
    
    await page.screenshot({ path: 'screenshots/final-02-containers-added.png', fullPage: true });
    
    // Step 2: Add products
    console.log('\n📦 Adding products...');
    
    const addProductBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Add Product'));
    });
    
    if (addProductBtn && await addProductBtn.asElement()) {
      for (let i = 1; i <= 3; i++) {
        console.log(`Adding product ${i}...`);
        await addProductBtn.asElement().click();
        await delay(1000);
        
        // Fill product form
        const nameInput = await page.$('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]');
        if (nameInput) {
          await nameInput.click();
          await nameInput.type(`Product ${i}`, { delay: 50 });
          
          // Look for submit/save button
          const submitBtn = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => 
              btn.type === 'submit' || 
              btn.textContent.includes('Save') || 
              btn.textContent.includes('Add') ||
              btn.textContent.includes('✓')
            );
          });
          
          if (submitBtn && await submitBtn.asElement()) {
            await submitBtn.asElement().click();
            await delay(1500);
            console.log(`✅ Added Product ${i}`);
          } else {
            // Try pressing Enter
            await nameInput.press('Enter');
            await delay(1500);
            console.log(`✅ Added Product ${i} (via Enter)`);
          }
        }
      }
    }
    
    await page.screenshot({ path: 'screenshots/final-03-products-added.png', fullPage: true });
    
    // Step 3: Look for Drag & Drop section
    console.log('\n🎯 Looking for Drag & Drop section...');
    await delay(2000);
    
    // Scroll down to find drag & drop section
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await delay(1000);
    
    await page.screenshot({ path: 'screenshots/final-04-scrolled-down.png', fullPage: true });
    
    // Check if drag & drop section is now visible
    const dragDropSection = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const dragDropHeading = headings.find(h => 
        h.textContent.includes('Drag') || 
        h.textContent.includes('Drop') ||
        h.textContent.includes('Assignment')
      );
      
      if (dragDropHeading) {
        return {
          found: true,
          text: dragDropHeading.textContent,
          visible: dragDropHeading.offsetParent !== null
        };
      }
      
      // Also check for drag & drop elements
      const draggableElements = document.querySelectorAll('[draggable="true"]');
      const dropZones = document.querySelectorAll('[data-testid*="drop"], [class*="drop-zone"]');
      
      return {
        found: draggableElements.length > 0 || dropZones.length > 0,
        draggableCount: draggableElements.length,
        dropZoneCount: dropZones.length
      };
    });
    
    console.log('🎯 Drag & Drop section check:', dragDropSection);
    
    // Step 4: Test actual drag and drop if elements exist
    const draggableElements = await page.$$('[draggable="true"]');
    const dropZones = await page.$$('[data-testid*="drop"], [class*="drop-zone"], [data-testid*="container"]');
    
    console.log(`🎯 Found ${draggableElements.length} draggable elements`);
    console.log(`🎯 Found ${dropZones.length} drop zones`);
    
    if (draggableElements.length > 0 && dropZones.length > 0) {
      console.log('\n🎯 Testing drag and drop operations...');
      
      // Test 1: Drag first product to first container
      const firstProduct = draggableElements[0];
      const firstDropZone = dropZones[0];
      
      const productBox = await firstProduct.boundingBox();
      const dropBox = await firstDropZone.boundingBox();
      
      if (productBox && dropBox) {
        console.log('🔄 Dragging product to container...');
        
        // Start drag
        await page.mouse.move(productBox.x + productBox.width / 2, productBox.y + productBox.height / 2);
        await page.mouse.down();
        await delay(200);
        
        // Take screenshot during drag
        await page.screenshot({ path: 'screenshots/final-05-during-drag.png', fullPage: true });
        
        // Move to drop zone
        await page.mouse.move(dropBox.x + dropBox.width / 2, dropBox.y + dropBox.height / 2, { steps: 15 });
        await delay(500);
        
        // Drop
        await page.mouse.up();
        await delay(1000);
        
        console.log('✅ Completed drag and drop operation');
        await page.screenshot({ path: 'screenshots/final-06-after-drop.png', fullPage: true });
        
        // Test another drag operation if possible
        if (draggableElements.length > 1 && dropZones.length > 1) {
          console.log('🔄 Testing second drag operation...');
          
          const secondProduct = draggableElements[1];
          const secondDropZone = dropZones[1];
          
          const product2Box = await secondProduct.boundingBox();
          const drop2Box = await secondDropZone.boundingBox();
          
          if (product2Box && drop2Box) {
            await page.mouse.move(product2Box.x + product2Box.width / 2, product2Box.y + product2Box.height / 2);
            await page.mouse.down();
            await delay(200);
            
            await page.mouse.move(drop2Box.x + drop2Box.width / 2, drop2Box.y + drop2Box.height / 2, { steps: 15 });
            await delay(500);
            await page.mouse.up();
            await delay(1000);
            
            console.log('✅ Completed second drag and drop operation');
          }
        }
      }
    } else {
      console.log('⚠️ No draggable elements or drop zones found for testing');
    }
    
    // Final screenshot
    await page.screenshot({ path: 'screenshots/final-07-final-state.png', fullPage: true });
    
    // Check for any drag & drop related console logs
    console.log('\n📝 Drag & Drop Console Logs:');
    if (dragDropLogs.length > 0) {
      dragDropLogs.forEach(log => console.log(log));
    } else {
      console.log('No specific drag & drop logs found');
    }
    
    // Pause for manual inspection
    console.log('\n🕐 Pausing 15 seconds for final inspection...');
    await delay(15000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    errors.push(error.message);
    
    try {
      await page.screenshot({ path: 'screenshots/final-error.png', fullPage: true });
    } catch (e) {
      console.log('Could not take error screenshot');
    }
  }
  
  // Generate final report
  console.log('\n' + '='.repeat(80));
  console.log('📋 FINAL DRAG & DROP REFACTOR TEST REPORT');
  console.log('='.repeat(80));
  
  const report = {
    timestamp: new Date().toISOString(),
    testResults: {
      appLoaded: errors.length === 0,
      dragDropLogsFound: dragDropLogs.length,
      consoleLogs: consoleLogs.length,
      errors: errors.length,
      dragDropLogs: dragDropLogs,
      recentConsoleLogs: consoleLogs.slice(-20)
    }
  };
  
  console.log(`✅ App Loading: ${report.testResults.appLoaded ? 'SUCCESS' : 'FAILED'}`);
  console.log(`🎯 Drag & Drop Logs: ${report.testResults.dragDropLogsFound} found`);
  console.log(`📊 Total Console Logs: ${report.testResults.consoleLogs}`);
  console.log(`❌ Errors: ${report.testResults.errors}`);
  
  if (errors.length > 0) {
    console.log('\n🚨 ERRORS:');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  if (dragDropLogs.length > 0) {
    console.log('\n🎯 DRAG & DROP LOGS:');
    dragDropLogs.forEach(log => console.log(log));
  }
  
  // Save comprehensive report
  const reportPath = path.join(__dirname, 'final-dragdrop-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📁 Report saved: ${reportPath}`);
  console.log('📸 Screenshots saved to screenshots/ directory');
  console.log('\n' + '='.repeat(80));
  
  await browser.close();
  console.log('🏁 Final test completed!');
}

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Run the test
finalDragDropTest().catch(console.error);
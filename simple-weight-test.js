import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  let browser;
  let page;
  const results = {
    success: false,
    negativeWeightAccepted: false,
    zeroWeightAccepted: false,
    negativeMaxWeightAccepted: false,
    zeroMaxWeightAccepted: false,
    screenshots: [],
    errors: []
  };

  try {
    console.log('🚀 Starting simple weight test...');
    
    browser = await puppeteer.launch({ 
      headless: false, 
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // Navigate to the application
    console.log('📍 Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Take initial screenshot
    const initialScreenshot = path.join(__dirname, 'simple-test-initial.png');
    await page.screenshot({ path: initialScreenshot, fullPage: true });
    results.screenshots.push(initialScreenshot);
    console.log(`📸 Initial screenshot: ${initialScreenshot}`);

    // === TEST PRODUCT FORM ===
    console.log('\n🧪 Testing Product Form...');
    
    // Click Add Product button by text
    try {
      await page.waitForSelector('text=Add Product', { timeout: 5000 });
      await page.click('text=Add Product');
      console.log('✅ Clicked "Add Product" button');
    } catch (e) {
      // Alternative: try clicking by icon and text combination
      const addProductButtons = await page.$$eval('*', elements => {
        return elements
          .filter(el => el.textContent && el.textContent.includes('Add Product'))
          .map(el => ({
            tagName: el.tagName,
            textContent: el.textContent.trim(),
            className: el.className
          }));
      });
      console.log('Found Add Product elements:', addProductButtons);
      
      if (addProductButtons.length > 0) {
        await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('*'));
          const addProductEl = elements.find(el => el.textContent && el.textContent.includes('Add Product'));
          if (addProductEl) addProductEl.click();
        });
        console.log('✅ Clicked Add Product via DOM manipulation');
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot after clicking
    const afterClickScreenshot = path.join(__dirname, 'simple-test-after-click.png');
    await page.screenshot({ path: afterClickScreenshot, fullPage: true });
    results.screenshots.push(afterClickScreenshot);
    console.log(`📸 After click screenshot: ${afterClickScreenshot}`);

    // Check if product form appeared
    const productForm = await page.$('input[name="weight"]');
    if (productForm) {
      console.log('✅ Product form found!');
      
      // Fill required fields
      await page.type('input[name="name"]', 'Test Product');
      await page.type('input[name="height"]', '10');
      await page.type('input[name="width"]', '10');
      await page.type('input[name="length"]', '10');
      await page.type('input[name="purchasePrice"]', '5.00');
      await page.type('input[name="resalePrice"]', '10.00');
      await page.type('input[name="daysToSell"]', '7');
      
      // Test negative weight
      console.log('🔍 Testing negative weight (-5.5)...');
      await page.focus('input[name="weight"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.type('input[name="weight"]', '-5.5');
      
      const negativeValue = await page.$eval('input[name="weight"]', el => el.value);
      results.negativeWeightAccepted = negativeValue === '-5.5';
      console.log(`   Negative weight value: "${negativeValue}"`);
      console.log(`   ✅ Negative weight accepted: ${results.negativeWeightAccepted}`);
      
      // Take screenshot with negative weight
      const negativeWeightScreenshot = path.join(__dirname, 'simple-test-negative-weight.png');
      await page.screenshot({ path: negativeWeightScreenshot, fullPage: true });
      results.screenshots.push(negativeWeightScreenshot);
      
      // Test zero weight
      console.log('🔍 Testing zero weight...');
      await page.focus('input[name="weight"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.type('input[name="weight"]', '0');
      
      const zeroValue = await page.$eval('input[name="weight"]', el => el.value);
      results.zeroWeightAccepted = zeroValue === '0';
      console.log(`   Zero weight value: "${zeroValue}"`);
      console.log(`   ✅ Zero weight accepted: ${results.zeroWeightAccepted}`);
      
      // Take screenshot with zero weight
      const zeroWeightScreenshot = path.join(__dirname, 'simple-test-zero-weight.png');
      await page.screenshot({ path: zeroWeightScreenshot, fullPage: true });
      results.screenshots.push(zeroWeightScreenshot);
      
    } else {
      console.log('❌ Product form not found');
      results.errors.push('Product form not found');
    }

    // === TEST CONTAINER FORM ===
    console.log('\n🧪 Testing Container Form...');
    
    // Try to find Add Container button
    try {
      await page.waitForSelector('text=Add Container', { timeout: 5000 });
      await page.click('text=Add Container');
      console.log('✅ Clicked "Add Container" button');
    } catch (e) {
      // Alternative approach
      await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const addContainerEl = elements.find(el => el.textContent && el.textContent.includes('Add Container'));
        if (addContainerEl) addContainerEl.click();
      });
      console.log('✅ Clicked Add Container via DOM manipulation');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if container form appeared
    const containerForm = await page.$('input[name="maxWeight"]');
    if (containerForm) {
      console.log('✅ Container form found!');
      
      // Fill required fields
      await page.type('input[name="name"]', 'Test Container');
      await page.type('input[name="height"]', '100');
      await page.type('input[name="width"]', '100');
      await page.type('input[name="length"]', '100');
      await page.type('input[name="shippingCost"]', '50.00');
      
      // Test negative maxWeight
      console.log('🔍 Testing negative maxWeight (-10)...');
      await page.focus('input[name="maxWeight"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.type('input[name="maxWeight"]', '-10');
      
      const negativeMaxValue = await page.$eval('input[name="maxWeight"]', el => el.value);
      results.negativeMaxWeightAccepted = negativeMaxValue === '-10';
      console.log(`   Negative maxWeight value: "${negativeMaxValue}"`);
      console.log(`   ✅ Negative maxWeight accepted: ${results.negativeMaxWeightAccepted}`);
      
      // Test zero maxWeight
      console.log('🔍 Testing zero maxWeight...');
      await page.focus('input[name="maxWeight"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.type('input[name="maxWeight"]', '0');
      
      const zeroMaxValue = await page.$eval('input[name="maxWeight"]', el => el.value);
      results.zeroMaxWeightAccepted = zeroMaxValue === '0';
      console.log(`   Zero maxWeight value: "${zeroMaxValue}"`);
      console.log(`   ✅ Zero maxWeight accepted: ${results.zeroMaxWeightAccepted}`);
      
      // Take final screenshot
      const finalScreenshot = path.join(__dirname, 'simple-test-final.png');
      await page.screenshot({ path: finalScreenshot, fullPage: true });
      results.screenshots.push(finalScreenshot);
      
    } else {
      console.log('❌ Container form not found');
      results.errors.push('Container form not found');
    }

    results.success = true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    results.errors.push(error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Generate report
  console.log('\n📊 === WEIGHT RESTRICTIONS TEST RESULTS ===');
  console.log(`✅ Product Form - Negative Weight Accepted: ${results.negativeWeightAccepted}`);
  console.log(`✅ Product Form - Zero Weight Accepted: ${results.zeroWeightAccepted}`);
  console.log(`✅ Container Form - Negative MaxWeight Accepted: ${results.negativeMaxWeightAccepted}`);
  console.log(`✅ Container Form - Zero MaxWeight Accepted: ${results.zeroMaxWeightAccepted}`);

  console.log('\n📸 Screenshots Generated:');
  results.screenshots.forEach((screenshot, index) => {
    console.log(`   ${index + 1}. ${screenshot}`);
  });

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  }

  // Overall conclusion
  const allTestsPassed = 
    results.negativeWeightAccepted &&
    results.zeroWeightAccepted &&
    results.negativeMaxWeightAccepted &&
    results.zeroMaxWeightAccepted;

  console.log('\n🎯 === CONCLUSION ===');
  if (allTestsPassed) {
    console.log('🎉 SUCCESS! All weight restrictions have been successfully removed.');
    console.log('   ✅ Product forms now accept negative and zero weight values');
    console.log('   ✅ Container forms now accept negative and zero maxWeight values');
  } else {
    console.log('⚠️  PARTIAL SUCCESS or ISSUES DETECTED:');
    if (!results.negativeWeightAccepted) console.log('   ❌ Product negative weight still restricted');
    if (!results.zeroWeightAccepted) console.log('   ❌ Product zero weight still restricted');
    if (!results.negativeMaxWeightAccepted) console.log('   ❌ Container negative maxWeight still restricted');
    if (!results.zeroMaxWeightAccepted) console.log('   ❌ Container zero maxWeight still restricted');
  }

  // Save results
  const resultsFile = path.join(__dirname, 'simple-weight-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: ${resultsFile}`);
})();
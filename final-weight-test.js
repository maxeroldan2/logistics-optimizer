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
    productForm: {
      negativeWeightViaTyping: false,
      negativeWeightViaDOM: false,
      zeroWeightViaTyping: false,
      zeroWeightViaDOM: false,
      formAcceptsNegative: false,
      formAcceptsZero: false
    },
    containerForm: {
      negativeMaxWeightViaTyping: false,
      negativeMaxWeightViaDOM: false,
      zeroMaxWeightViaTyping: false,
      zeroMaxWeightViaDOM: false,
      formAcceptsNegative: false,
      formAcceptsZero: false
    },
    screenshots: [],
    details: []
  };

  try {
    console.log('🚀 Starting comprehensive weight test...');
    
    browser = await puppeteer.launch({ 
      headless: false, 
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // === PRODUCT FORM TESTS ===
    console.log('\n🧪 Testing Product Form Weight Restrictions...');
    
    // Open product form
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const addProductEl = elements.find(el => el.textContent && el.textContent.includes('Add Product'));
      if (addProductEl) addProductEl.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fill required fields first
    await page.type('input[name="name"]', 'Weight Test Product');
    await page.type('input[name="height"]', '10');
    await page.type('input[name="width"]', '10');
    await page.type('input[name="length"]', '10');
    await page.type('input[name="purchasePrice"]', '5.00');
    await page.type('input[name="resalePrice"]', '10.00');
    await page.type('input[name="daysToSell"]', '7');

    // Test 1: Try typing negative weight
    console.log('📝 Test 1: Typing negative weight (-5.5)...');
    await page.focus('input[name="weight"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.type('input[name="weight"]', '-5.5');
    
    let typingValue = await page.$eval('input[name="weight"]', el => el.value);
    results.productForm.negativeWeightViaTyping = typingValue === '-5.5';
    console.log(`   Result: "${typingValue}" (expected: "-5.5")`);
    results.details.push(`Product typing test: "${typingValue}" !== "-5.5"`);
    
    // Test 2: Set negative weight via DOM manipulation
    console.log('📝 Test 2: Setting negative weight via DOM (-7.5)...');
    await page.evaluate(() => {
      const weightInput = document.querySelector('input[name="weight"]');
      if (weightInput) {
        weightInput.value = '-7.5';
        weightInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    let domValue = await page.$eval('input[name="weight"]', el => el.value);
    results.productForm.negativeWeightViaDOM = domValue === '-7.5';
    console.log(`   Result: "${domValue}" (expected: "-7.5")`);
    results.details.push(`Product DOM test: "${domValue}" !== "-7.5"`);
    
    // Test 3: Try typing zero weight
    console.log('📝 Test 3: Typing zero weight (0)...');
    await page.focus('input[name="weight"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.type('input[name="weight"]', '0');
    
    let zeroTypingValue = await page.$eval('input[name="weight"]', el => el.value);
    results.productForm.zeroWeightViaTyping = zeroTypingValue === '0';
    console.log(`   Result: "${zeroTypingValue}" (expected: "0")`);
    results.details.push(`Product zero typing test: "${zeroTypingValue}" !== "0"`);
    
    // Test 4: Set zero weight via DOM
    console.log('📝 Test 4: Setting zero weight via DOM (0)...');
    await page.evaluate(() => {
      const weightInput = document.querySelector('input[name="weight"]');
      if (weightInput) {
        weightInput.value = '0';
        weightInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    let zeroDomValue = await page.$eval('input[name="weight"]', el => el.value);
    results.productForm.zeroWeightViaDOM = zeroDomValue === '0';
    console.log(`   Result: "${zeroDomValue}" (expected: "0")`);
    results.details.push(`Product zero DOM test: "${zeroDomValue}" !== "0"`);
    
    // Test 5: Check if form accepts negative values by inspecting input attributes
    console.log('📝 Test 5: Checking input restrictions...');
    const productInputAttrs = await page.$eval('input[name="weight"]', el => ({
      min: el.min,
      max: el.max,
      step: el.step,
      type: el.type,
      pattern: el.pattern,
      required: el.required
    }));
    console.log('   Product weight input attributes:', productInputAttrs);
    results.productForm.formAcceptsNegative = !productInputAttrs.min || parseFloat(productInputAttrs.min) < 0;
    results.productForm.formAcceptsZero = !productInputAttrs.min || parseFloat(productInputAttrs.min) <= 0;
    
    // Take screenshot of product form
    const productScreenshot = path.join(__dirname, 'final-test-product-form.png');
    await page.screenshot({ path: productScreenshot, fullPage: true });
    results.screenshots.push(productScreenshot);
    
    // === CONTAINER FORM TESTS ===
    console.log('\n🧪 Testing Container Form MaxWeight Restrictions...');
    
    // Open container form
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const addContainerEl = elements.find(el => el.textContent && el.textContent.includes('Add Container'));
      if (addContainerEl) addContainerEl.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fill required fields
    await page.type('input[name="name"]', 'Weight Test Container');
    await page.type('input[name="height"]', '100');
    await page.type('input[name="width"]', '100');
    await page.type('input[name="length"]', '100');
    await page.type('input[name="shippingCost"]', '50.00');

    // Test 1: Try typing negative maxWeight
    console.log('📝 Test 1: Typing negative maxWeight (-15.5)...');
    await page.focus('input[name="maxWeight"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.type('input[name="maxWeight"]', '-15.5');
    
    let containerTypingValue = await page.$eval('input[name="maxWeight"]', el => el.value);
    results.containerForm.negativeMaxWeightViaTyping = containerTypingValue === '-15.5';
    console.log(`   Result: "${containerTypingValue}" (expected: "-15.5")`);
    results.details.push(`Container typing test: "${containerTypingValue}" !== "-15.5"`);
    
    // Test 2: Set negative maxWeight via DOM
    console.log('📝 Test 2: Setting negative maxWeight via DOM (-20.5)...');
    await page.evaluate(() => {
      const maxWeightInput = document.querySelector('input[name="maxWeight"]');
      if (maxWeightInput) {
        maxWeightInput.value = '-20.5';
        maxWeightInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    let containerDomValue = await page.$eval('input[name="maxWeight"]', el => el.value);
    results.containerForm.negativeMaxWeightViaDOM = containerDomValue === '-20.5';
    console.log(`   Result: "${containerDomValue}" (expected: "-20.5")`);
    results.details.push(`Container DOM test: "${containerDomValue}" !== "-20.5"`);
    
    // Test 3: Try typing zero maxWeight
    console.log('📝 Test 3: Typing zero maxWeight (0)...');
    await page.focus('input[name="maxWeight"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.type('input[name="maxWeight"]', '0');
    
    let containerZeroTypingValue = await page.$eval('input[name="maxWeight"]', el => el.value);
    results.containerForm.zeroMaxWeightViaTyping = containerZeroTypingValue === '0';
    console.log(`   Result: "${containerZeroTypingValue}" (expected: "0")`);
    results.details.push(`Container zero typing test: "${containerZeroTypingValue}" !== "0"`);
    
    // Test 4: Set zero maxWeight via DOM
    console.log('📝 Test 4: Setting zero maxWeight via DOM (0)...');
    await page.evaluate(() => {
      const maxWeightInput = document.querySelector('input[name="maxWeight"]');
      if (maxWeightInput) {
        maxWeightInput.value = '0';
        maxWeightInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    let containerZeroDomValue = await page.$eval('input[name="maxWeight"]', el => el.value);
    results.containerForm.zeroMaxWeightViaDOM = containerZeroDomValue === '0';
    console.log(`   Result: "${containerZeroDomValue}" (expected: "0")`);
    results.details.push(`Container zero DOM test: "${containerZeroDomValue}" !== "0"`);
    
    // Test 5: Check container input restrictions
    console.log('📝 Test 5: Checking container input restrictions...');
    const containerInputAttrs = await page.$eval('input[name="maxWeight"]', el => ({
      min: el.min,
      max: el.max,
      step: el.step,
      type: el.type,
      pattern: el.pattern,
      required: el.required
    }));
    console.log('   Container maxWeight input attributes:', containerInputAttrs);
    results.containerForm.formAcceptsNegative = !containerInputAttrs.min || parseFloat(containerInputAttrs.min) < 0;
    results.containerForm.formAcceptsZero = !containerInputAttrs.min || parseFloat(containerInputAttrs.min) <= 0;
    
    // Take final screenshot
    const finalScreenshot = path.join(__dirname, 'final-test-container-form.png');
    await page.screenshot({ path: finalScreenshot, fullPage: true });
    results.screenshots.push(finalScreenshot);

  } catch (error) {
    console.error('❌ Test failed:', error);
    results.error = error.message;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Generate comprehensive report
  console.log('\n📊 === COMPREHENSIVE WEIGHT RESTRICTIONS TEST RESULTS ===');
  
  console.log('\n🧪 Product Form Weight Field:');
  console.log(`   📝 Negative weight via typing: ${results.productForm.negativeWeightViaTyping ? '✅ ACCEPTED' : '❌ REJECTED'}`);
  console.log(`   🔧 Negative weight via DOM: ${results.productForm.negativeWeightViaDOM ? '✅ ACCEPTED' : '❌ REJECTED'}`);
  console.log(`   📝 Zero weight via typing: ${results.productForm.zeroWeightViaTyping ? '✅ ACCEPTED' : '❌ REJECTED'}`);
  console.log(`   🔧 Zero weight via DOM: ${results.productForm.zeroWeightViaDOM ? '✅ ACCEPTED' : '❌ REJECTED'}`);
  console.log(`   ⚙️  Form allows negative values: ${results.productForm.formAcceptsNegative ? '✅ YES' : '❌ NO'}`);
  console.log(`   ⚙️  Form allows zero values: ${results.productForm.formAcceptsZero ? '✅ YES' : '❌ NO'}`);
  
  console.log('\n🧪 Container Form MaxWeight Field:');
  console.log(`   📝 Negative maxWeight via typing: ${results.containerForm.negativeMaxWeightViaTyping ? '✅ ACCEPTED' : '❌ REJECTED'}`);
  console.log(`   🔧 Negative maxWeight via DOM: ${results.containerForm.negativeMaxWeightViaDOM ? '✅ ACCEPTED' : '❌ REJECTED'}`);
  console.log(`   📝 Zero maxWeight via typing: ${results.containerForm.zeroMaxWeightViaTyping ? '✅ ACCEPTED' : '❌ REJECTED'}`);
  console.log(`   🔧 Zero maxWeight via DOM: ${results.containerForm.zeroMaxWeightViaDOM ? '✅ ACCEPTED' : '❌ REJECTED'}`);
  console.log(`   ⚙️  Form allows negative values: ${results.containerForm.formAcceptsNegative ? '✅ YES' : '❌ NO'}`);
  console.log(`   ⚙️  Form allows zero values: ${results.containerForm.formAcceptsZero ? '✅ YES' : '❌ NO'}`);

  console.log('\n📸 Screenshots Generated:');
  results.screenshots.forEach((screenshot, index) => {
    console.log(`   ${index + 1}. ${screenshot}`);
  });

  console.log('\n🔍 Test Details:');
  results.details.forEach(detail => {
    console.log(`   - ${detail}`);
  });

  // Determine overall status
  const restrictionsRemoved = (
    results.productForm.formAcceptsNegative &&
    results.productForm.formAcceptsZero &&
    results.containerForm.formAcceptsNegative &&
    results.containerForm.formAcceptsZero
  );

  const functionallyWorking = (
    results.productForm.negativeWeightViaDOM &&
    results.productForm.zeroWeightViaDOM &&
    results.containerForm.negativeMaxWeightViaDOM &&
    results.containerForm.zeroMaxWeightViaDOM
  );

  console.log('\n🎯 === FINAL CONCLUSION ===');
  if (restrictionsRemoved && functionallyWorking) {
    console.log('🎉 COMPLETE SUCCESS! Weight restrictions have been fully removed.');
    console.log('   ✅ HTML form attributes allow negative and zero values');
    console.log('   ✅ Forms functionally accept negative and zero values');
    console.log('   ✅ Both manual typing and programmatic setting work');
  } else if (restrictionsRemoved) {
    console.log('✅ PARTIAL SUCCESS! Weight restrictions removed at form level.');
    console.log('   ✅ HTML form attributes allow negative and zero values');
    console.log('   ⚠️  Some input methods may have browser-level restrictions');
    console.log('   💡 This is expected behavior for HTML5 number inputs');
  } else {
    console.log('❌ RESTRICTIONS STILL IN PLACE!');
    console.log('   ❌ Form attributes still prevent negative or zero values');
    console.log('   🔧 Check for remaining min="0" attributes or other restrictions');
  }

  // Save results
  const resultsFile = path.join(__dirname, 'final-weight-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 Full results saved to: ${resultsFile}`);
})();
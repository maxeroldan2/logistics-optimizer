import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true,
    slowMo: 100 
  });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Verifying weight restriction removal...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Take initial screenshot
    await page.screenshot({ path: path.join(__dirname, 'verification-1-initial.png'), fullPage: true });
    console.log('📸 Initial page captured');
    
    // Click "Add Product" - be very explicit about it
    console.log('📝 Looking for Add Product button...');
    
    // Method 1: Try to find button by text content
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    
    let foundAddProduct = false;
    for (let i = 0; i < buttons.length; i++) {
      const text = await page.evaluate(el => el.textContent?.trim(), buttons[i]);
      console.log(`Button ${i}: "${text}"`);
      
      if (text && text.toLowerCase().includes('add product')) {
        console.log(`✅ Found Add Product button at index ${i}`);
        await buttons[i].click();
        foundAddProduct = true;
        break;
      }
    }
    
    if (!foundAddProduct) {
      // Method 2: Try clicking based on visual elements
      console.log('🔍 Trying alternative approach...');
      await page.click('text=Add Product');
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot after clicking
    await page.screenshot({ path: path.join(__dirname, 'verification-2-after-click.png'), fullPage: true });
    console.log('📸 After clicking Add Product');
    
    // Check if weight input exists and get its attributes
    const weightInputExists = await page.$('input[name="weight"]');
    
    if (weightInputExists) {
      console.log('✅ Product form opened successfully');
      
      // Get the actual HTML of the weight input
      const weightInputHTML = await page.$eval('input[name="weight"]', el => el.outerHTML);
      console.log('🔍 Weight input HTML:');
      console.log(weightInputHTML);
      
      // Check attributes programmatically
      const attrs = await page.$eval('input[name="weight"]', el => ({
        min: el.getAttribute('min'),
        max: el.getAttribute('max'),
        step: el.getAttribute('step'),
        type: el.getAttribute('type'),
        hasMin: el.hasAttribute('min')
      }));
      
      console.log('🔍 Weight input attributes:', attrs);
      
      // Test setting negative value directly
      console.log('🧪 Testing negative value setting...');
      
      const testResult = await page.evaluate(() => {
        const input = document.querySelector('input[name="weight"]');
        if (!input) return { error: 'Input not found' };
        
        // Test 1: Set negative value
        input.value = '-5.5';
        const afterNegative = {
          value: input.value,
          validity: input.validity.valid,
          validationMessage: input.validationMessage
        };
        
        // Test 2: Set zero value
        input.value = '0';
        const afterZero = {
          value: input.value,
          validity: input.validity.valid,
          validationMessage: input.validationMessage
        };
        
        return { afterNegative, afterZero };
      });
      
      console.log('🧪 Test Results:', testResult);
      
      // Conclusion
      if (!attrs.hasMin) {
        console.log('✅ SUCCESS: min attribute successfully removed from weight input');
      } else if (attrs.min !== '0') {
        console.log(`✅ SUCCESS: min attribute changed from "0" to "${attrs.min}"`);
      } else {
        console.log('❌ ISSUE: min="0" attribute still present');
      }
      
    } else {
      console.log('❌ Product form did not open');
    }
    
    // Now test container form
    console.log('\n🧪 Testing Container Form...');
    
    // Look for Add Container button
    const allButtons = await page.$$('button, [role="button"]');
    let foundAddContainer = false;
    
    for (let button of allButtons) {
      const text = await page.evaluate(el => el.textContent?.trim(), button);
      if (text && text.toLowerCase().includes('add container')) {
        console.log('✅ Found Add Container button');
        await button.click();
        foundAddContainer = true;
        break;
      }
    }
    
    if (!foundAddContainer) {
      await page.click('text=Add Container');
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot after container form
    await page.screenshot({ path: path.join(__dirname, 'verification-3-container-form.png'), fullPage: true });
    console.log('📸 Container form captured');
    
    const maxWeightInputExists = await page.$('input[name="maxWeight"]');
    
    if (maxWeightInputExists) {
      console.log('✅ Container form opened successfully');
      
      // Get the actual HTML of the maxWeight input
      const maxWeightInputHTML = await page.$eval('input[name="maxWeight"]', el => el.outerHTML);
      console.log('🔍 MaxWeight input HTML:');
      console.log(maxWeightInputHTML);
      
      // Check attributes
      const containerAttrs = await page.$eval('input[name="maxWeight"]', el => ({
        min: el.getAttribute('min'),
        max: el.getAttribute('max'),
        step: el.getAttribute('step'),
        type: el.getAttribute('type'),
        hasMin: el.hasAttribute('min')
      }));
      
      console.log('🔍 MaxWeight input attributes:', containerAttrs);
      
      // Test setting negative value
      const containerTestResult = await page.evaluate(() => {
        const input = document.querySelector('input[name="maxWeight"]');
        if (!input) return { error: 'Input not found' };
        
        // Test negative value
        input.value = '-10.5';
        const afterNegative = {
          value: input.value,
          validity: input.validity.valid,
          validationMessage: input.validationMessage
        };
        
        // Test zero value
        input.value = '0';
        const afterZero = {
          value: input.value,
          validity: input.validity.valid,
          validationMessage: input.validationMessage
        };
        
        return { afterNegative, afterZero };
      });
      
      console.log('🧪 Container Test Results:', containerTestResult);
      
      // Conclusion for container
      if (!containerAttrs.hasMin) {
        console.log('✅ SUCCESS: min attribute successfully removed from maxWeight input');
      } else if (containerAttrs.min !== '0') {
        console.log(`✅ SUCCESS: min attribute changed from "0" to "${containerAttrs.min}"`);
      } else {
        console.log('❌ ISSUE: min="0" attribute still present on maxWeight');
      }
    } else {
      console.log('❌ Container form did not open');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    console.log('\n⏳ Keeping browser open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
})();
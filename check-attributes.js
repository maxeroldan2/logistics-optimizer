import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Open product form
    console.log('Opening Product Form...');
    await page.evaluate(() => {
      const button = document.querySelector('*[class*="Add Product"], button');
      const allElements = Array.from(document.querySelectorAll('*'));
      const addProductEl = allElements.find(el => el.textContent && el.textContent.includes('Add Product'));
      if (addProductEl) {
        addProductEl.click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check product weight input attributes
    const productWeightAttrs = await page.evaluate(() => {
      const input = document.querySelector('input[name="weight"]');
      if (!input) return { found: false };
      
      return {
        found: true,
        min: input.getAttribute('min'),
        max: input.getAttribute('max'),
        step: input.getAttribute('step'),
        type: input.getAttribute('type'),
        required: input.hasAttribute('required'),
        outerHTML: input.outerHTML
      };
    });
    
    console.log('Product Weight Input Attributes:');
    console.log(JSON.stringify(productWeightAttrs, null, 2));
    
    // Open container form
    console.log('\nOpening Container Form...');
    await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const addContainerEl = allElements.find(el => el.textContent && el.textContent.includes('Add Container'));
      if (addContainerEl) {
        addContainerEl.click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check container maxWeight input attributes
    const containerMaxWeightAttrs = await page.evaluate(() => {
      const input = document.querySelector('input[name="maxWeight"]');
      if (!input) return { found: false };
      
      return {
        found: true,
        min: input.getAttribute('min'),
        max: input.getAttribute('max'),
        step: input.getAttribute('step'),
        type: input.getAttribute('type'),
        required: input.hasAttribute('required'),
        outerHTML: input.outerHTML
      };
    });
    
    console.log('Container MaxWeight Input Attributes:');
    console.log(JSON.stringify(containerMaxWeightAttrs, null, 2));
    
    // Test direct value setting
    console.log('\nTesting direct value setting...');
    
    if (productWeightAttrs.found) {
      const testResult = await page.evaluate(() => {
        const input = document.querySelector('input[name="weight"]');
        if (!input) return { error: 'Input not found' };
        
        // Try setting negative value
        input.value = '-5.5';
        const negativeValue = input.value;
        
        // Try setting zero value
        input.value = '0';
        const zeroValue = input.value;
        
        return {
          negativeTest: { set: '-5.5', result: negativeValue, accepted: negativeValue === '-5.5' },
          zeroTest: { set: '0', result: zeroValue, accepted: zeroValue === '0' }
        };
      });
      
      console.log('Product Weight Direct Setting Test:');
      console.log(JSON.stringify(testResult, null, 2));
    }
    
    if (containerMaxWeightAttrs.found) {
      const containerTestResult = await page.evaluate(() => {
        const input = document.querySelector('input[name="maxWeight"]');
        if (!input) return { error: 'Input not found' };
        
        // Try setting negative value
        input.value = '-10.5';
        const negativeValue = input.value;
        
        // Try setting zero value
        input.value = '0';
        const zeroValue = input.value;
        
        return {
          negativeTest: { set: '-10.5', result: negativeValue, accepted: negativeValue === '-10.5' },
          zeroTest: { set: '0', result: zeroValue, accepted: zeroValue === '0' }
        };
      });
      
      console.log('Container MaxWeight Direct Setting Test:');
      console.log(JSON.stringify(containerTestResult, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
const puppeteer = require('puppeteer');

async function checkConsoleLogs() {
  let browser;
  try {
    console.log('🔍 Starting browser to check console logs...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Collect console messages
    const consoleMessages = [];
    const errors = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push({
        type: msg.type(),
        text: text,
        timestamp: new Date().toISOString()
      });
      
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });
    
    page.on('pageerror', (error) => {
      errors.push(`Page Error: ${error.message}`);
    });
    
    page.on('requestfailed', (request) => {
      errors.push(`Failed Request: ${request.url()} - ${request.failure().errorText}`);
    });
    
    console.log('📡 Navigating to application...');
    
    // Navigate to the application
    await page.goto('http://localhost:5174', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait a bit for the app to initialize
    await page.waitForTimeout(3000);
    
    // Try to interact with some basic elements
    console.log('🖱️  Testing basic interactions...');
    
    // Check if the main content loads
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Try to find common UI elements
    const hasLoginForm = await page.$('input[type="email"]') !== null;
    const hasMainApp = await page.$('[class*="shipment"]') !== null;
    const hasNavigation = await page.$('nav, aside, [class*="sidebar"]') !== null;
    
    console.log('📊 Application state:');
    console.log(`  - Login form present: ${hasLoginForm}`);
    console.log(`  - Main app content: ${hasMainApp}`);
    console.log(`  - Navigation present: ${hasNavigation}`);
    
    // Wait a bit more for any async operations
    await page.waitForTimeout(2000);
    
    console.log('\n📋 Console Messages Summary:');
    console.log(`  - Total messages: ${consoleMessages.length}`);
    console.log(`  - Errors: ${errors.length}`);
    
    const messageTypes = consoleMessages.reduce((acc, msg) => {
      acc[msg.type] = (acc[msg.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('  - By type:', messageTypes);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors found:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ No errors found!');
    }
    
    // Show recent console messages
    console.log('\n📝 Recent Console Messages:');
    consoleMessages.slice(-10).forEach((msg, index) => {
      const emoji = msg.type === 'error' ? '❌' : 
                   msg.type === 'warn' ? '⚠️' : 
                   msg.type === 'info' ? 'ℹ️' : '📝';
      console.log(`  ${emoji} [${msg.type}] ${msg.text}`);
    });
    
    return {
      success: errors.length === 0,
      totalMessages: consoleMessages.length,
      errors: errors,
      consoleMessages: consoleMessages
    };
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the check
checkConsoleLogs().then((result) => {
  console.log('\n🏁 Test completed');
  if (result.success) {
    console.log('✅ No console errors detected!');
    process.exit(0);
  } else {
    console.log('❌ Issues detected');
    process.exit(1);
  }
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
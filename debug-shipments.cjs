const puppeteer = require('puppeteer');

async function debugShipments() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'log' || type === 'warn' || type === 'error') {
        console.log(`[${type.toUpperCase()}]`, msg.text());
      }
    });
    
    console.log('🔍 Debugging shipment loading...');
    
    // Step 1: Login
    await page.goto('http://localhost:5175/login', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await page.type('input[type="email"]', 'demo@example.com');
    await page.type('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('✅ Logged in, checking app state...');
    
    // Step 2: Check localStorage
    const localStorageData = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const result = {};
      keys.forEach(key => {
        result[key] = localStorage.getItem(key);
      });
      return result;
    });
    
    console.log('📦 LocalStorage contents:');
    Object.keys(localStorageData).forEach(key => {
      if (key.includes('savedShipments')) {
        console.log(`  ${key}:`, localStorageData[key]);
      } else {
        console.log(`  ${key}: [${localStorageData[key]?.length || 0} chars]`);
      }
    });
    
    // Step 3: Check React state via console
    const reactState = await page.evaluate(() => {
      // Try to find React DevTools data or component instances
      const appDiv = document.getElementById('root');
      if (appDiv && appDiv._reactInternalInstance) {
        return 'React instance found';
      }
      return 'React instance not accessible';
    });
    
    console.log('⚛️ React state:', reactState);
    
    // Step 4: Check if sidebar has shipments
    const sidebarAnalysis = await page.evaluate(() => {
      const sidebar = document.querySelector('[class*="w-64"]'); // Sidebar width class
      if (!sidebar) return { found: false };
      
      const shipmentElements = sidebar.querySelectorAll('[class*="p-3"]'); // Shipment item padding
      const shipmentTexts = Array.from(shipmentElements).map(el => el.textContent?.trim());
      
      const savedShipmentsSection = sidebar.textContent?.includes('SAVED SHIPMENTS');
      const sinCarpetaSection = sidebar.textContent?.includes('Sin carpeta');
      
      return {
        found: true,
        hasSavedShipmentsSection: savedShipmentsSection,
        hasSinCarpetaSection: sinCarpetaSection,
        shipmentCount: shipmentElements.length,
        shipmentTexts: shipmentTexts,
        fullText: sidebar.textContent?.substring(0, 500)
      };
    });
    
    console.log('📊 Sidebar analysis:', {
      sidebarFound: sidebarAnalysis.found,
      hasSavedShipmentsSection: sidebarAnalysis.hasSavedShipmentsSection,
      hasSinCarpetaSection: sidebarAnalysis.hasSinCarpetaSection,
      shipmentCount: sidebarAnalysis.shipmentCount
    });
    
    if (sidebarAnalysis.shipmentCount > 0) {
      console.log('📝 Shipment texts found:', sidebarAnalysis.shipmentTexts);
    }
    
    // Step 5: Try to save a shipment manually
    console.log('💾 Attempting to create and save a shipment...');
    
    // Look for the Save button
    const hasButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonTexts = buttons.map(btn => btn.textContent?.trim()).filter(text => text);
      return {
        totalButtons: buttons.length,
        saveButtons: buttonTexts.filter(text => text.includes('Save') || text.includes('Guardar')),
        allButtons: buttonTexts.slice(0, 10) // First 10 for debugging
      };
    });
    
    console.log('🔘 Button analysis:', hasButtons);
    
    // Take screenshot for visual debugging
    await page.screenshot({ path: 'debug-shipments.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-shipments.png');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser left open for manual inspection...');
    console.log('Press Ctrl+C to close when done debugging');
    
    // Don't close browser automatically
    // await browser.close();
  }
}

debugShipments().catch(console.error);
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function debugShipmentButton() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true,
    slowMo: 500 // Slow down for easier observation
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE ${msg.type().toUpperCase()}]:`, msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]:`, error.message);
  });
  
  // Enable request/response logging
  page.on('request', request => {
    console.log(`[REQUEST]: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    if (!response.url().includes('localhost:5174') && !response.url().includes('data:')) {
      console.log(`[RESPONSE]: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('🔍 Starting shipment button debugging...\n');
    
    // Navigate to the application
    console.log('1. Navigating to http://localhost:5174');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });
    
    // Wait a bit for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take initial screenshot
    console.log('2. Taking initial screenshot...');
    await page.screenshot({ path: 'debug-initial.png', fullPage: true });
    
    // Look for the "New Shipment" button
    console.log('3. Searching for "New Shipment" button...');
    
    // Try multiple selectors that might contain "New Shipment"
    const possibleSelectors = [
      'button:contains("New Shipment")',
      '[aria-label*="New Shipment"]',
      '[title*="New Shipment"]',
      'button[data-testid*="shipment"]',
      'button[class*="shipment"]',
      'a:contains("New Shipment")',
      '.sidebar button',
      'nav button'
    ];
    
    let shipmentButton = null;
    let buttonSelector = null;
    let buttonText = '';
    let buttonLocation = '';
    
    // First, let's get all buttons and their text content
    console.log('   Scanning all buttons on the page...');
    const allButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
      return buttons.map((btn, index) => ({
        index,
        text: btn.textContent?.trim() || '',
        className: btn.className || '',
        id: btn.id || '',
        ariaLabel: btn.getAttribute('aria-label') || '',
        href: btn.getAttribute('href') || '',
        tagName: btn.tagName,
        outerHTML: btn.outerHTML.substring(0, 200) + '...' // Truncate for readability
      }));
    });
    
    console.log('   Found buttons:');
    allButtons.forEach(btn => {
      console.log(`     [${btn.index}] ${btn.tagName}: "${btn.text}" (class: ${btn.className})`);
    });
    
    // Look specifically for shipment-related buttons
    const shipmentButtons = allButtons.filter(btn => 
      btn.text.toLowerCase().includes('shipment') || 
      btn.text.toLowerCase().includes('new') ||
      btn.className.toLowerCase().includes('shipment') ||
      btn.ariaLabel.toLowerCase().includes('shipment')
    );
    
    console.log('\n   Potential shipment buttons found:');
    shipmentButtons.forEach(btn => {
      console.log(`     "${btn.text}" (${btn.tagName}, class: ${btn.className})`);
    });
    
    // Try to find the exact "New Shipment" button
    try {
      shipmentButton = await page.$('button:has-text("New Shipment")');
      if (!shipmentButton) {
        // Try case-insensitive search
        shipmentButton = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
          return buttons.find(btn => 
            btn.textContent?.toLowerCase().includes('new shipment') ||
            btn.textContent?.toLowerCase().includes('shipment')
          );
        });
      }
    } catch (e) {
      console.log('   Puppeteer text selector not supported, using alternative method...');
    }
    
    // Alternative: Use evaluate to find the button
    if (!shipmentButton || shipmentButton._remoteObject?.value === null) {
      console.log('   Using JavaScript evaluation to find shipment button...');
      
      const buttonInfo = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
        const shipmentBtn = buttons.find(btn => {
          const text = btn.textContent?.toLowerCase().trim() || '';
          return text.includes('new shipment') || text.includes('shipment');
        });
        
        if (shipmentBtn) {
          const rect = shipmentBtn.getBoundingClientRect();
          return {
            found: true,
            text: shipmentBtn.textContent?.trim() || '',
            className: shipmentBtn.className || '',
            id: shipmentBtn.id || '',
            tagName: shipmentBtn.tagName,
            position: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            isVisible: rect.width > 0 && rect.height > 0,
            hasClickHandler: !!shipmentBtn.onclick,
            eventListeners: shipmentBtn.getEventListeners ? Object.keys(shipmentBtn.getEventListeners()) : 'N/A'
          };
        }
        return { found: false };
      });
      
      if (buttonInfo.found) {
        console.log(`✅ Found shipment button: "${buttonInfo.text}"`);
        console.log(`   Tag: ${buttonInfo.tagName}`);
        console.log(`   Class: ${buttonInfo.className}`);
        console.log(`   ID: ${buttonInfo.id}`);
        console.log(`   Position: (${buttonInfo.position.x}, ${buttonInfo.position.y})`);
        console.log(`   Size: ${buttonInfo.position.width}x${buttonInfo.position.height}`);
        console.log(`   Visible: ${buttonInfo.isVisible}`);
        console.log(`   Has click handler: ${buttonInfo.hasClickHandler}`);
        console.log(`   Event listeners: ${buttonInfo.eventListeners}`);
        
        buttonText = buttonInfo.text;
        buttonLocation = `Position: (${buttonInfo.position.x}, ${buttonInfo.position.y})`;
        
        // Highlight the button for screenshot
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
          const shipmentBtn = buttons.find(btn => {
            const text = btn.textContent?.toLowerCase().trim() || '';
            return text.includes('new shipment') || text.includes('shipment');
          });
          if (shipmentBtn) {
            shipmentBtn.style.outline = '3px solid red';
            shipmentBtn.style.backgroundColor = 'yellow';
          }
        });
        
        // Take screenshot with highlighted button
        console.log('4. Taking screenshot with highlighted button...');
        await page.screenshot({ path: 'debug-button-highlighted.png', fullPage: true });
        
        // Check for event listeners using DevTools Protocol
        console.log('5. Checking event listeners...');
        try {
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
            const shipmentBtn = buttons.find(btn => {
              const text = btn.textContent?.toLowerCase().trim() || '';
              return text.includes('new shipment') || text.includes('shipment');
            });
            
            if (shipmentBtn) {
              console.log('Button found for event listener check');
              console.log('Button onclick:', shipmentBtn.onclick);
              console.log('Button addEventListener called:', !!shipmentBtn._listeners);
              
              // Try to get React fiber for React event listeners
              const reactFiber = shipmentBtn._reactInternalFiber || 
                                shipmentBtn.__reactInternalInstance ||
                                Object.keys(shipmentBtn).find(key => key.startsWith('__reactInternalInstance'));
              
              if (reactFiber) {
                console.log('React fiber found, checking props...');
                console.log('onClick prop:', shipmentBtn[reactFiber]?.memoizedProps?.onClick);
              }
            }
          });
        } catch (e) {
          console.log('   Error checking event listeners:', e.message);
        }
        
        // Monitor console before clicking
        console.log('\n6. Monitoring console logs before clicking...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Click the button
        console.log('7. Clicking the shipment button...');
        const clickResult = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
          const shipmentBtn = buttons.find(btn => {
            const text = btn.textContent?.toLowerCase().trim() || '';
            return text.includes('new shipment') || text.includes('shipment');
          });
          
          if (shipmentBtn) {
            console.log('About to click shipment button');
            try {
              shipmentBtn.click();
              return { success: true, message: 'Button clicked successfully' };
            } catch (error) {
              return { success: false, message: `Error clicking: ${error.message}` };
            }
          }
          return { success: false, message: 'Button not found for clicking' };
        });
        
        console.log(`   Click result: ${clickResult.success ? 'SUCCESS' : 'FAILED'} - ${clickResult.message}`);
        
        // Wait and monitor for changes
        console.log('8. Waiting for potential changes...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Take screenshot after clicking
        console.log('9. Taking screenshot after clicking...');
        await page.screenshot({ path: 'debug-after-click.png', fullPage: true });
        
        // Check for any modal dialogs or new elements
        console.log('10. Checking for modal dialogs or new elements...');
        const afterClickCheck = await page.evaluate(() => {
          const modals = document.querySelectorAll('[role="dialog"], .modal, .popup, .overlay');
          const newElements = document.querySelectorAll('[data-testid*="shipment"], [class*="shipment"]');
          
          return {
            modals: Array.from(modals).map(m => ({
              tagName: m.tagName,
              className: m.className,
              id: m.id,
              visible: getComputedStyle(m).display !== 'none'
            })),
            shipmentElements: Array.from(newElements).map(e => ({
              tagName: e.tagName,
              className: e.className,
              id: e.id,
              text: e.textContent?.substring(0, 100) || ''
            }))
          };
        });
        
        console.log('   Modals found:', afterClickCheck.modals.length);
        afterClickCheck.modals.forEach(modal => {
          console.log(`     ${modal.tagName} (${modal.className}) - Visible: ${modal.visible}`);
        });
        
        console.log('   Shipment elements found:', afterClickCheck.shipmentElements.length);
        afterClickCheck.shipmentElements.forEach(el => {
          console.log(`     ${el.tagName} (${el.className}): ${el.text}`);
        });
        
      } else {
        console.log('❌ No shipment button found on the page');
        
        // Let's check the sidebar specifically
        console.log('   Checking sidebar content...');
        const sidebarContent = await page.evaluate(() => {
          const sidebar = document.querySelector('.sidebar, nav, [role="navigation"]');
          if (sidebar) {
            return {
              found: true,
              html: sidebar.innerHTML.substring(0, 1000) + '...',
              buttons: Array.from(sidebar.querySelectorAll('button, a')).map(btn => btn.textContent?.trim())
            };
          }
          return { found: false };
        });
        
        if (sidebarContent.found) {
          console.log('   Sidebar found with buttons:', sidebarContent.buttons);
        } else {
          console.log('   No sidebar found');
        }
      }
      
    }
    
    // Final summary
    console.log('\n📋 DEBUGGING SUMMARY:');
    console.log('==================');
    console.log(`Button found: ${buttonInfo?.found || false}`);
    if (buttonInfo?.found) {
      console.log(`Button text: "${buttonText}"`);
      console.log(`Button location: ${buttonLocation}`);
      console.log(`Button visible: ${buttonInfo.isVisible}`);
      console.log(`Has click handler: ${buttonInfo.hasClickHandler}`);
    }
    console.log('\nScreenshots saved:');
    console.log('- debug-initial.png (initial page state)');
    console.log('- debug-button-highlighted.png (button highlighted)');
    console.log('- debug-after-click.png (after clicking)');
    
  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    console.log('\nKeeping browser open for manual inspection...');
    console.log('Press Ctrl+C to close when done.');
    
    // Keep browser open for manual inspection
    // await browser.close();
  }
}

// Run the debugging function
debugShipmentButton().catch(console.error);
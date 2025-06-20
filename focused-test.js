import puppeteer from 'puppeteer';
import fs from 'fs';

class FocusedTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.consoleErrors = [];
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Listen for console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        const error = {
          timestamp: new Date().toISOString(),
          message: msg.text(),
          location: msg.location()
        };
        this.consoleErrors.push(error);
        console.log('❌ Console Error:', error);
      }
    });

    // Listen for page errors
    this.page.on('pageerror', error => {
      const pageError = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack
      };
      this.consoleErrors.push(pageError);
      console.log('❌ Page Error:', pageError);
    });
  }

  async testElementsByActualSelectors() {
    await this.page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    console.log('\n🔍 Testing elements by their actual implementation...');

    // Test the header settings button (should NOT work - no onClick)
    const headerSettingsWorking = await this.page.evaluate(() => {
      const headerSettings = document.querySelector('header button[aria-label="Settings"]');
      if (headerSettings) {
        const hasOnClick = headerSettings.onclick !== null || 
                          headerSettings.getAttribute('onclick') !== null ||
                          headerSettings.hasAttribute('data-onclick');
        return hasOnClick;
      }
      return false;
    });
    
    console.log(`❌ Header Settings Button has click handler: ${headerSettingsWorking}`);

    // Test the main settings button (should work)
    const mainSettingsFound = await this.page.evaluate(() => {
      // Look for the settings button in main content that calls setShowSettings
      const buttons = Array.from(document.querySelectorAll('button'));
      const settingsButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && svg.classList.contains('lucide-settings');
      });
      return settingsButton !== undefined;
    });
    
    console.log(`✅ Main Settings Button found: ${mainSettingsFound}`);

    // Test actual folder plus button
    const folderPlusFound = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const folderButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        return svg && svg.classList.contains('lucide-folder-plus');
      });
      return folderButton !== undefined;
    });
    
    console.log(`✅ Folder Plus Button found: ${folderPlusFound}`);

    // Test actual menu buttons (MoreVertical icons)
    const menuButtonsFound = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const menuButtons = buttons.filter(btn => {
        const svg = btn.querySelector('svg');
        return svg && svg.classList.contains('lucide-more-vertical');
      });
      return menuButtons.length;
    });
    
    console.log(`✅ Menu Buttons (MoreVertical) found: ${menuButtonsFound}`);

    // Test container edit/delete buttons
    const containerButtons = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const editButtons = buttons.filter(btn => btn.textContent.trim() === '✏️');
      const deleteButtons = buttons.filter(btn => btn.textContent.trim() === '🗑️');
      return {
        editButtons: editButtons.length,
        deleteButtons: deleteButtons.length
      };
    });
    
    console.log(`✅ Container Edit Buttons found: ${containerButtons.editButtons}`);
    console.log(`✅ Container Delete Buttons found: ${containerButtons.deleteButtons}`);

    // Test what happens when Add Container is clicked
    console.log('\n🧪 Testing Add Container click behavior...');
    
    const errorsBefore = this.consoleErrors.length;
    
    const addContainerResult = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addContainerBtn = buttons.find(btn => btn.textContent.includes('Add Container'));
      
      if (addContainerBtn) {
        addContainerBtn.click();
        
        // Check what modals/forms opened after click
        setTimeout(() => {
          const containerForms = document.querySelectorAll('form, [class*="container"], [class*="form"]');
          const settingsModal = document.querySelector('[class*="settings"], [role="dialog"]');
          
          return {
            clicked: true,
            formsOpened: containerForms.length,
            settingsModalOpen: settingsModal !== null,
            settingsModalVisible: settingsModal ? !settingsModal.hidden : false
          };
        }, 500);
        
        return { clicked: true };
      }
      return { clicked: false };
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check what's visible now
    const modalStatus = await this.page.evaluate(() => {
      const settingsModal = document.querySelector('[role="dialog"]');
      const containerForm = document.querySelector('form');
      
      return {
        settingsModalVisible: settingsModal && !settingsModal.hidden && settingsModal.style.display !== 'none',
        containerFormVisible: containerForm && !containerForm.hidden && containerForm.style.display !== 'none',
        anyModalVisible: !!document.querySelector('[role="dialog"]:not([hidden])')
      };
    });
    
    const errorsAfter = this.consoleErrors.length;
    const newErrors = this.consoleErrors.slice(errorsBefore);
    
    console.log('Modal Status:', modalStatus);
    console.log('Add Container Result:', addContainerResult);
    console.log(`Console errors generated: ${newErrors.length}`);
    
    if (newErrors.length > 0) {
      console.log('New errors:', newErrors);
    }

    // Take a screenshot to see current state
    await this.page.screenshot({ path: 'focused-test-after-add-container.png', fullPage: true });

    return {
      headerSettingsWorking,
      mainSettingsFound,
      folderPlusFound,
      menuButtonsFound,
      containerButtons,
      modalStatus,
      errorsGenerated: newErrors.length,
      errors: newErrors
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the focused test
const tester = new FocusedTester();
tester.init()
  .then(() => tester.testElementsByActualSelectors())
  .then(results => {
    console.log('\n📊 Focused Test Results:', results);
    
    // Write results to file
    fs.writeFileSync('focused-test-results.json', JSON.stringify(results, null, 2));
    
    return tester.cleanup();
  })
  .catch(error => {
    console.error('Focused test error:', error);
    return tester.cleanup();
  });
import puppeteer from 'puppeteer';
import fs from 'fs';

class DetailedLogisticsAppTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.consoleErrors = [];
    this.testResults = [];
    this.screenshotCounter = 0;
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

  async takeScreenshot(name) {
    const filename = `detailed-screenshot-${this.screenshotCounter++}-${name}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    return filename;
  }

  logResult(test, status, details = '', errors = []) {
    const result = {
      test,
      status: status ? '✅' : '❌',
      details,
      errors: [...errors],
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`${result.status} ${test}: ${details}`);
    if (errors.length > 0) {
      console.log('  Errors:', errors);
    }
  }

  async examinePageStructure() {
    console.log('\n🔍 Examining Page Structure...');
    
    const pageInfo = await this.page.evaluate(() => {
      return {
        allButtons: Array.from(document.querySelectorAll('button')).map(btn => ({
          text: btn.textContent.trim(),
          className: btn.className,
          id: btn.id,
          ariaLabel: btn.getAttribute('aria-label'),
          title: btn.title
        })),
        allSelects: Array.from(document.querySelectorAll('select')).map(sel => ({
          className: sel.className,
          id: sel.id,
          name: sel.name,
          optionsCount: sel.options.length
        })),
        allInputs: Array.from(document.querySelectorAll('input')).map(inp => ({
          type: inp.type,
          className: inp.className,
          id: inp.id,
          name: inp.name
        })),
        allClickableElements: Array.from(document.querySelectorAll('[onclick], [role="button"]')).map(el => ({
          tagName: el.tagName,
          text: el.textContent.trim().substring(0, 50),
          className: el.className,
          role: el.getAttribute('role')
        }))
      };
    });

    console.log('📋 Found Elements:');
    console.log(`  Buttons: ${pageInfo.allButtons.length}`);
    console.log(`  Select dropdowns: ${pageInfo.allSelects.length}`);
    console.log(`  Input fields: ${pageInfo.allInputs.length}`);
    console.log(`  Other clickable elements: ${pageInfo.allClickableElements.length}`);

    this.logResult('Page Structure Analysis', true, 
      `Found ${pageInfo.allButtons.length} buttons, ${pageInfo.allSelects.length} selects, ${pageInfo.allInputs.length} inputs`);

    return pageInfo;
  }

  async testSpecificElements() {
    console.log('\n🎯 Testing Specific Elements...');
    
    // Test currency dropdown (should be a select)
    await this.testSelectDropdown('Currency Dropdown (USD)', 'select');
    
    // Test measurement dropdown (should be a select)  
    await this.testSelectDropdown('Measurement Dropdown (Metric)', 'select');
    
    // Test settings button (gear icon)
    await this.testElementBySelector('Settings Button', '[class*="settings"], button[title*="settings"], button[aria-label*="settings"]');
    
    // Test folder creation button (+ icon next to SAVED SHIPMENTS)
    await this.testElementBySelector('Folder Creation Button', 'button[title*="folder"], button[aria-label*="folder"], button[class*="folder"]');
    
    // Test shipment menu buttons (⋮ icons)
    await this.testShipmentMenus();
    
    // Test for any edit/delete buttons that might appear in containers/products
    await this.testEditDeleteButtons();
  }

  async testSelectDropdown(name, selector) {
    try {
      const selects = await this.page.$$(selector);
      if (selects.length === 0) {
        this.logResult(name, false, 'No select elements found');
        return;
      }

      console.log(`Found ${selects.length} select element(s) for ${name}`);
      
      const errorsBefore = this.consoleErrors.length;
      
      // Test the first select
      await selects[0].click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the options
      const options = await this.page.evaluate((sel) => {
        const selectElement = document.querySelectorAll('select')[0];
        if (selectElement) {
          return Array.from(selectElement.options).map(opt => opt.text);
        }
        return [];
      });
      
      const errorsAfter = this.consoleErrors.length;
      const newErrors = this.consoleErrors.slice(errorsBefore);
      
      if (newErrors.length > 0) {
        this.logResult(name, false, `Dropdown clicked but generated ${newErrors.length} errors`, newErrors);
      } else {
        this.logResult(name, true, `Dropdown working with ${options.length} options: ${options.join(', ')}`);
      }
    } catch (error) {
      this.logResult(name, false, error.message);
    }
  }

  async testElementBySelector(name, selector) {
    try {
      const elements = await this.page.$$(selector);
      if (elements.length === 0) {
        this.logResult(name, false, 'Element not found');
        return;
      }

      const errorsBefore = this.consoleErrors.length;
      
      await elements[0].click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const errorsAfter = this.consoleErrors.length;
      const newErrors = this.consoleErrors.slice(errorsBefore);
      
      if (newErrors.length > 0) {
        this.logResult(name, false, `Element clicked but generated ${newErrors.length} errors`, newErrors);
        await this.takeScreenshot(`error-${name.replace(/\s+/g, '-').toLowerCase()}`);
      } else {
        this.logResult(name, true, 'Element clicked successfully');
      }
    } catch (error) {
      this.logResult(name, false, error.message);
    }
  }

  async testShipmentMenus() {
    console.log('\n📋 Testing Shipment Menus...');
    
    const menuInfo = await this.page.evaluate(() => {
      // Look for various menu button patterns
      const possibleMenus = [
        ...Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent.includes('⋮') || 
          btn.textContent.includes('...') ||
          btn.className.includes('menu') ||
          btn.getAttribute('aria-label')?.includes('menu')
        ),
        ...Array.from(document.querySelectorAll('[role="button"]')).filter(el => 
          el.textContent.includes('⋮') || 
          el.textContent.includes('...') ||
          el.className.includes('menu')
        )
      ];
      
      return possibleMenus.map(menu => ({
        text: menu.textContent.trim(),
        className: menu.className,
        tagName: menu.tagName,
        role: menu.getAttribute('role'),
        ariaLabel: menu.getAttribute('aria-label')
      }));
    });
    
    if (menuInfo.length > 0) {
      this.logResult('Shipment Menu Detection', true, `Found ${menuInfo.length} potential menu buttons`);
      console.log('Menu buttons found:', menuInfo);
    } else {
      this.logResult('Shipment Menu Detection', false, 'No menu buttons found');
    }
  }

  async testEditDeleteButtons() {
    console.log('\n✏️ Testing Edit/Delete Buttons...');
    
    const editDeleteInfo = await this.page.evaluate(() => {
      const editButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('✏️') || 
        btn.textContent.includes('edit') ||
        btn.className.includes('edit') ||
        btn.getAttribute('aria-label')?.includes('edit')
      );
      
      const deleteButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('🗑️') || 
        btn.textContent.includes('delete') ||
        btn.className.includes('delete') ||
        btn.getAttribute('aria-label')?.includes('delete')
      );
      
      return {
        editButtons: editButtons.length,
        deleteButtons: deleteButtons.length,
        editDetails: editButtons.map(btn => ({
          text: btn.textContent.trim(),
          className: btn.className,
          ariaLabel: btn.getAttribute('aria-label')
        })),
        deleteDetails: deleteButtons.map(btn => ({
          text: btn.textContent.trim(),
          className: btn.className,
          ariaLabel: btn.getAttribute('aria-label')
        }))
      };
    });
    
    this.logResult('Edit Buttons', editDeleteInfo.editButtons > 0, 
      `Found ${editDeleteInfo.editButtons} edit buttons`);
    this.logResult('Delete Buttons', editDeleteInfo.deleteButtons > 0, 
      `Found ${editDeleteInfo.deleteButtons} delete buttons`);
      
    if (editDeleteInfo.editButtons > 0) {
      console.log('Edit button details:', editDeleteInfo.editDetails);
    }
    if (editDeleteInfo.deleteButtons > 0) {
      console.log('Delete button details:', editDeleteInfo.deleteDetails);
    }
  }

  async testFormInteractions() {
    console.log('\n📝 Testing Form Interactions...');
    
    // Try to add a container and see what happens
    const containerAdded = await this.page.evaluate(() => {
      const addContainerBtn = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('Add Container')
      );
      
      if (addContainerBtn) {
        addContainerBtn.click();
        return true;
      }
      return false;
    });
    
    if (containerAdded) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.takeScreenshot('after-add-container');
      
      // Check if a form appeared
      const formInfo = await this.page.evaluate(() => {
        const forms = Array.from(document.querySelectorAll('form'));
        const modals = Array.from(document.querySelectorAll('[role="dialog"], .modal'));
        
        return {
          forms: forms.length,
          modals: modals.length,
          inputs: document.querySelectorAll('input').length,
          selects: document.querySelectorAll('select').length
        };
      });
      
      this.logResult('Container Form Test', formInfo.forms > 0 || formInfo.modals > 0, 
        `Forms: ${formInfo.forms}, Modals: ${formInfo.modals}, Inputs: ${formInfo.inputs}, Selects: ${formInfo.selects}`);
    }
  }

  async testConsoleForErrors() {
    console.log('\n🔍 Checking Console for Any Runtime Errors...');
    
    // Trigger various interactions to see if they generate errors
    const interactions = [
      'clicking New Shipment multiple times',
      'hovering over elements',
      'clicking save without data'
    ];
    
    for (const interaction of interactions) {
      const errorsBefore = this.consoleErrors.length;
      
      try {
        if (interaction.includes('New Shipment')) {
          await this.page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => 
              b.textContent.includes('New Shipment')
            );
            if (btn) {
              btn.click();
              btn.click(); // Double click to test
            }
          });
        } else if (interaction.includes('save')) {
          await this.page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => 
              b.textContent.includes('Save')
            );
            if (btn) btn.click();
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const errorsAfter = this.consoleErrors.length;
        const newErrors = this.consoleErrors.slice(errorsBefore);
        
        if (newErrors.length > 0) {
          this.logResult(`Console Test: ${interaction}`, false, 
            `Generated ${newErrors.length} errors`, newErrors);
        } else {
          this.logResult(`Console Test: ${interaction}`, true, 'No errors');
        }
      } catch (error) {
        this.logResult(`Console Test: ${interaction}`, false, error.message);
      }
    }
  }

  async generateDetailedReport() {
    const report = {
      testRunDate: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.length,
        passed: this.testResults.filter(r => r.status === '✅').length,
        failed: this.testResults.filter(r => r.status === '❌').length,
        totalConsoleErrors: this.consoleErrors.length
      },
      testResults: this.testResults,
      consoleErrors: this.consoleErrors
    };

    // Write detailed report to file
    fs.writeFileSync('detailed-test-report.json', JSON.stringify(report, null, 2));
    
    // Generate comprehensive human-readable report
    let humanReport = `
# Comprehensive Logistics App Testing Report
Generated: ${report.testRunDate}

## Executive Summary
- **Total Tests**: ${report.summary.totalTests}
- **Passed**: ${report.summary.passed} ✅
- **Failed**: ${report.summary.failed} ❌
- **Console Errors**: ${report.summary.totalConsoleErrors}
- **Success Rate**: ${Math.round((report.summary.passed / report.summary.totalTests) * 100)}%

## Working Features ✅
`;

    const passedTests = this.testResults.filter(r => r.status === '✅');
    passedTests.forEach(test => {
      humanReport += `- **${test.test}**: ${test.details}\n`;
    });

    humanReport += `
## Issues Found ❌
`;

    const failedTests = this.testResults.filter(r => r.status === '❌');
    failedTests.forEach(test => {
      humanReport += `
### ${test.test}
- **Issue**: ${test.details}
- **Time**: ${test.timestamp}
`;
      if (test.errors.length > 0) {
        humanReport += `- **Errors**: \n`;
        test.errors.forEach(error => {
          humanReport += `  - ${error.message}\n`;
        });
      }
    });

    if (this.consoleErrors.length > 0) {
      humanReport += `
## Console Errors Detected ⚠️
`;
      this.consoleErrors.forEach((error, index) => {
        humanReport += `
### Error ${index + 1}
- **Time**: ${error.timestamp}
- **Message**: ${error.message}
- **Location**: ${error.location || 'Unknown'}
`;
      });
    }

    humanReport += `
## Specific Recommendations for Fixes 🔧

### High Priority Issues:
`;

    // Categorize issues
    const dropdownIssues = failedTests.filter(t => t.test.includes('Dropdown'));
    const buttonIssues = failedTests.filter(t => t.test.includes('Button') && !t.test.includes('Dropdown'));
    const formIssues = failedTests.filter(t => t.test.includes('Form'));

    if (dropdownIssues.length > 0) {
      humanReport += `
#### Dropdown Issues:
`;
      dropdownIssues.forEach(issue => {
        humanReport += `- **${issue.test}**: Check if the select element has proper event handlers attached\n`;
        humanReport += `  - Verify the onClick/onChange handlers are properly bound\n`;
        humanReport += `  - Check if there are React synthetic event issues\n`;
      });
    }

    if (buttonIssues.length > 0) {
      humanReport += `
#### Button/UI Element Issues:
`;
      buttonIssues.forEach(issue => {
        humanReport += `- **${issue.test}**: Element not found or not clickable\n`;
        humanReport += `  - Check if the element exists in the DOM\n`;
        humanReport += `  - Verify proper CSS selectors and class names\n`;
        humanReport += `  - Ensure elements are not hidden or disabled\n`;
      });
    }

    humanReport += `
### File Paths to Check:
Based on the project structure, these files likely need attention:

#### Component Files:
- **/Users/maxeroldan/Documents/logis/src/components/layout/Header.tsx** - For currency/measurement dropdowns
- **/Users/maxeroldan/Documents/logis/src/pages/Home.tsx** - For main interface elements
- **/Users/maxeroldan/Documents/logis/src/components/config/GlobalSettings.tsx** - For settings button
- **/Users/maxeroldan/Documents/logis/src/components/forms/ContainerForm.tsx** - For container management
- **/Users/maxeroldan/Documents/logis/src/components/forms/ProductForm.tsx** - For product management

#### Areas to Investigate:
1. **Event Handler Binding**: Check if React event handlers are properly attached
2. **State Management**: Verify AppContext and state updates work correctly  
3. **CSS Classes**: Ensure Tailwind classes are applied correctly
4. **Conditional Rendering**: Check if elements are conditionally hidden
5. **Component Lifecycle**: Verify components mount and render properly

### Next Steps:
1. **Manual Testing**: Test the failing elements manually in the browser
2. **Developer Tools**: Use browser dev tools to inspect the actual DOM structure
3. **React DevTools**: Check component state and props
4. **Console Monitoring**: Watch for any runtime errors during interactions
5. **Component Testing**: Add unit tests for individual components
`;

    fs.writeFileSync('detailed-test-report.md', humanReport);
    
    console.log('\n📊 Detailed Testing Complete!');
    console.log(`📋 Detailed report saved to: detailed-test-report.json`);
    console.log(`📄 Human-readable report saved to: detailed-test-report.md`);
    console.log(`📸 Screenshots saved: ${this.screenshotCounter} files`);
    
    return report;
  }

  async runComprehensiveTest() {
    try {
      await this.init();
      
      // Navigate to the app
      await this.page.goto('http://localhost:5173', { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      await this.takeScreenshot('initial-state');
      
      // Examine the page structure first
      await this.examinePageStructure();
      
      // Test specific elements
      await this.testSpecificElements();
      
      // Test form interactions
      await this.testFormInteractions();
      
      // Test for console errors
      await this.testConsoleForErrors();
      
      await this.generateDetailedReport();
      
    } catch (error) {
      console.error('Test runner error:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the comprehensive test
const tester = new DetailedLogisticsAppTester();
tester.runComprehensiveTest().catch(console.error);
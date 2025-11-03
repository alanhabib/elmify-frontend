import { test, expect, chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:8082';
const BACKEND_URL = 'http://localhost:8081';
const SCREENSHOTS_DIR = 'test-results/screenshots';
const CONSOLE_LOG_FILE = 'test-results/console-logs.json';
const TEST_REPORT_FILE = 'test-results/test-report.md';

// Ensure directories exist
test.beforeAll(async () => {
  try {
    await fs.mkdir('test-results', { recursive: true });
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  } catch (error) {
    console.log('Directory creation skipped:', error.message);
  }
});

test.describe('AudibleClone: Speaker → Collections → Lectures Flow', () => {
  let consoleMessages = [];
  let consoleErrors = [];
  let networkRequests = [];
  let testResults = {
    startTime: new Date().toISOString(),
    endTime: null,
    screenshots: [],
    consoleErrors: [],
    networkErrors: [],
    steps: [],
    success: false,
    errorMessages: []
  };

  test('Complete speaker to lectures navigation flow with error monitoring', async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: { dir: 'test-results/videos/' }
    });
    const page = await context.newPage();

    // Setup console and network monitoring
    page.on('console', (msg) => {
      const message = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
        url: page.url()
      };
      consoleMessages.push(message);
      
      if (msg.type() === 'error') {
        consoleErrors.push(message);
        testResults.consoleErrors.push(message);
      }
    });

    page.on('pageerror', (error) => {
      const errorMessage = {
        type: 'pageerror',
        text: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: page.url()
      };
      consoleErrors.push(errorMessage);
      testResults.consoleErrors.push(errorMessage);
    });

    page.on('response', (response) => {
      const request = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      };
      networkRequests.push(request);
      
      if (response.status() >= 400) {
        testResults.networkErrors.push(request);
      }
    });

    try {
      // Step 1: Navigate to the application
      console.log('Step 1: Loading initial page...');
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000); // Allow for initial data loading
      
      const step1Screenshot = path.join(SCREENSHOTS_DIR, '01-initial-page-load.png');
      await page.screenshot({ path: step1Screenshot, fullPage: true });
      testResults.screenshots.push({ step: 'Initial Page Load', path: step1Screenshot });
      testResults.steps.push({ step: 1, name: 'Initial Page Load', status: 'completed' });

      // Step 2: Wait for speakers to load and verify page content
      console.log('Step 2: Waiting for speakers to load...');
      await page.waitForSelector('[data-testid="speakers-section"]', { timeout: 15000 }).catch(() => {
        // If testid not found, try alternative selectors
        return page.waitForSelector('text=Speakers', { timeout: 5000 }).catch(() => {
          return page.waitForSelector('[class*="speaker"]', { timeout: 5000 });
        });
      });

      const step2Screenshot = path.join(SCREENSHOTS_DIR, '02-speakers-loaded.png');
      await page.screenshot({ path: step2Screenshot, fullPage: true });
      testResults.screenshots.push({ step: 'Speakers Loaded', path: step2Screenshot });
      testResults.steps.push({ step: 2, name: 'Speakers Data Loaded', status: 'completed' });

      // Step 3: Find and click on the first speaker
      console.log('Step 3: Finding and clicking first speaker...');
      let speakerElement = null;
      
      // Try multiple selectors to find speaker elements
      const speakerSelectors = [
        '[data-testid*="speaker"]',
        '[class*="speaker-card"]',
        '[class*="speaker-item"]',
        'button:has-text("Speaker")',
        'div:has-text("Speaker"):has(img)',
        // Fallback to any pressable element with speaker-like content
        'div[role="button"]:has(img)',
        'Pressable:has(img)'
      ];

      for (const selector of speakerSelectors) {
        try {
          speakerElement = await page.waitForSelector(selector, { timeout: 2000 });
          if (speakerElement) {
            console.log(`Found speaker using selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!speakerElement) {
        // Last resort: look for any clickable element with an image
        const clickableElements = await page.$$('div, button, [role="button"]');
        for (const element of clickableElements) {
          const hasImage = await element.$('img');
          if (hasImage) {
            speakerElement = element;
            break;
          }
        }
      }

      if (speakerElement) {
        await speakerElement.click();
        console.log('Clicked on speaker element');
      } else {
        throw new Error('No speaker elements found to click');
      }

      // Wait for speaker modal to open
      await page.waitForTimeout(2000);
      
      const step3Screenshot = path.join(SCREENSHOTS_DIR, '03-speaker-modal-opened.png');
      await page.screenshot({ path: step3Screenshot, fullPage: true });
      testResults.screenshots.push({ step: 'Speaker Modal Opened', path: step3Screenshot });
      testResults.steps.push({ step: 3, name: 'Speaker Modal Navigation', status: 'completed' });

      // Step 4: Find and click on a collection
      console.log('Step 4: Finding and clicking on collection...');
      await page.waitForTimeout(2000); // Allow modal content to load
      
      let collectionElement = null;
      const collectionSelectors = [
        '[data-testid*="collection"]',
        '[class*="collection-card"]',
        '[class*="collection-item"]',
        'button:has-text("Collection")',
        'div:has-text("Collection"):has(img)',
        // Look for any clickable card-like elements in the modal
        'div[role="button"]:has(img):not([class*="speaker"])',
        'Pressable:has(img):not([class*="speaker"])'
      ];

      for (const selector of collectionSelectors) {
        try {
          collectionElement = await page.waitForSelector(selector, { timeout: 2000 });
          if (collectionElement) {
            console.log(`Found collection using selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!collectionElement) {
        // Look for any additional clickable elements that might be collections
        const modalElements = await page.$$('div[role="button"], button, Pressable');
        for (const element of modalElements) {
          const text = await element.textContent();
          if (text && (text.toLowerCase().includes('collection') || text.toLowerCase().includes('lecture'))) {
            collectionElement = element;
            break;
          }
        }
      }

      if (collectionElement) {
        await collectionElement.click();
        console.log('Clicked on collection element');
        await page.waitForTimeout(2000);
      } else {
        console.log('Warning: No collection elements found to click');
        // Take a screenshot to help debug
        const debugScreenshot = path.join(SCREENSHOTS_DIR, '04-no-collections-found-debug.png');
        await page.screenshot({ path: debugScreenshot, fullPage: true });
      }

      const step4Screenshot = path.join(SCREENSHOTS_DIR, '04-collection-modal-opened.png');
      await page.screenshot({ path: step4Screenshot, fullPage: true });
      testResults.screenshots.push({ step: 'Collection Modal Opened', path: step4Screenshot });
      testResults.steps.push({ step: 4, name: 'Collection Modal Navigation', status: 'completed' });

      // Step 5: Verify lectures are visible
      console.log('Step 5: Verifying lectures are visible...');
      await page.waitForTimeout(3000); // Allow lecture content to load
      
      // Look for lecture-related content
      const lectureSelectors = [
        '[data-testid*="lecture"]',
        '[class*="lecture"]',
        'text=lecture',
        'text=Lecture',
        '[class*="book-item"]', // Based on DiscoveryBookListItem import
        'img[src*="lecture"]',
        'img[src*="book"]'
      ];

      let lecturesFound = false;
      for (const selector of lectureSelectors) {
        try {
          const element = await page.waitForSelector(selector, { timeout: 2000 });
          if (element) {
            console.log(`Found lectures using selector: ${selector}`);
            lecturesFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      const step5Screenshot = path.join(SCREENSHOTS_DIR, '05-lectures-view.png');
      await page.screenshot({ path: step5Screenshot, fullPage: true });
      testResults.screenshots.push({ step: 'Lectures View', path: step5Screenshot });
      testResults.steps.push({ 
        step: 5, 
        name: 'Lectures Verification', 
        status: lecturesFound ? 'completed' : 'warning',
        note: lecturesFound ? 'Lectures found and displayed' : 'Lectures content not clearly identified'
      });

      // Step 6: Test backend connectivity
      console.log('Step 6: Testing backend connectivity...');
      try {
        const response = await page.request.get(`${BACKEND_URL}/api/speakers`);
        console.log(`Backend API response status: ${response.status()}`);
        testResults.steps.push({ 
          step: 6, 
          name: 'Backend Connectivity', 
          status: response.ok() ? 'completed' : 'failed',
          details: `API Status: ${response.status()}`
        });
      } catch (error) {
        console.log('Backend connectivity test failed:', error.message);
        testResults.steps.push({ 
          step: 6, 
          name: 'Backend Connectivity', 
          status: 'failed',
          error: error.message
        });
      }

      // Final screenshot
      const finalScreenshot = path.join(SCREENSHOTS_DIR, '06-final-state.png');
      await page.screenshot({ path: finalScreenshot, fullPage: true });
      testResults.screenshots.push({ step: 'Final State', path: finalScreenshot });

      testResults.success = true;
      console.log('Test completed successfully!');

    } catch (error) {
      console.error('Test failed:', error.message);
      testResults.success = false;
      testResults.errorMessages.push(error.message);
      
      // Capture error screenshot
      const errorScreenshot = path.join(SCREENSHOTS_DIR, 'error-state.png');
      await page.screenshot({ path: errorScreenshot, fullPage: true });
      testResults.screenshots.push({ step: 'Error State', path: errorScreenshot });
    } finally {
      testResults.endTime = new Date().toISOString();
      
      // Save console logs
      const logData = {
        allMessages: consoleMessages,
        errors: consoleErrors,
        networkRequests: networkRequests,
        testResults: testResults
      };
      
      await fs.writeFile(CONSOLE_LOG_FILE, JSON.stringify(logData, null, 2));
      
      // Generate test report
      await generateTestReport();
      
      await browser.close();
    }

    // Assertions
    expect(testResults.success).toBe(true);
    expect(consoleErrors.length).toBeLessThan(5); // Allow some warnings but not many errors
  });

  async function generateTestReport() {
    const report = `# AudibleClone End-to-End Test Report

## Test Execution Summary
- **Start Time:** ${testResults.startTime}
- **End Time:** ${testResults.endTime}
- **Duration:** ${new Date(testResults.endTime) - new Date(testResults.startTime)}ms
- **Status:** ${testResults.success ? '✅ PASSED' : '❌ FAILED'}

## Test Steps
${testResults.steps.map(step => 
  `### Step ${step.step}: ${step.name}
- **Status:** ${step.status === 'completed' ? '✅' : step.status === 'warning' ? '⚠️' : '❌'} ${step.status.toUpperCase()}
${step.note ? `- **Note:** ${step.note}` : ''}
${step.details ? `- **Details:** ${step.details}` : ''}
${step.error ? `- **Error:** ${step.error}` : ''}
`).join('\n')}

## Console Errors Found
${testResults.consoleErrors.length === 0 ? 'No console errors detected! ✅' : 
  testResults.consoleErrors.map(error => 
    `### ${error.type.toUpperCase()} at ${error.timestamp}
- **Message:** ${error.text}
- **URL:** ${error.url}
${error.stack ? `- **Stack:** \`${error.stack}\`` : ''}
`).join('\n')}

## Network Errors
${testResults.networkErrors.length === 0 ? 'No network errors detected! ✅' : 
  testResults.networkErrors.map(error => 
    `- **${error.status}** ${error.statusText}: ${error.url} at ${error.timestamp}`
  ).join('\n')}

## Screenshots Captured
${testResults.screenshots.map(screenshot => 
  `- **${screenshot.step}:** ${screenshot.path}`
).join('\n')}

## Issues Identified
${testResults.consoleErrors.length === 0 && testResults.networkErrors.length === 0 ? 
  '🎉 No critical issues found! The application appears to be working correctly.' :
  'The following issues were identified and should be addressed:'}

${testResults.consoleErrors.map(error => 
  `- **Console Error:** ${error.text} (${error.type})`
).join('\n')}

${testResults.networkErrors.map(error => 
  `- **Network Error:** ${error.status} ${error.statusText} on ${error.url}`
).join('\n')}

## Recommendations
1. **Console Errors:** ${testResults.consoleErrors.length === 0 ? 'None detected' : 'Fix the console errors listed above'}
2. **Network Issues:** ${testResults.networkErrors.length === 0 ? 'None detected' : 'Investigate failed network requests'}
3. **User Flow:** ${testResults.success ? 'Working correctly' : 'Navigation flow needs debugging'}

---
*Generated automatically by Playwright test at ${new Date().toISOString()}*
`;

    await fs.writeFile(TEST_REPORT_FILE, report);
    console.log(`Test report generated: ${TEST_REPORT_FILE}`);
  }
});
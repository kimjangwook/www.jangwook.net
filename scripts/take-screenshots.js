/**
 * Screenshot Script for UX Psychology Implementation
 * Takes screenshots of 10 pages focusing on modified UX elements
 * - BlogCard with reading time badge
 * - Card hover effects
 * - Tag pills
 * - Back to top button
 * - Reading progress bar
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:4321';
const OUTPUT_DIR = path.join(__dirname, '../research/ux-psychology-implementation/new');

// 10 pages to screenshot with scroll positions
const PAGES = [
  {
    name: 'en-root',
    url: '/',
    actions: async (page) => {
      // Scroll to show blog cards section
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(500);
    }
  },
  {
    name: 'en-home',
    url: '/en/',
    actions: async (page) => {
      // Scroll to show latest posts with BlogCards
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForTimeout(500);
      // Hover over first blog card to show lift effect
      const card = await page.$('article');
      if (card) {
        await card.hover();
        await page.waitForTimeout(300);
      }
    }
  },
  {
    name: 'en-blog-list',
    url: '/en/blog/',
    actions: async (page) => {
      // Show blog cards with reading time badges and tags
      await page.waitForTimeout(500);
      // Hover over first card
      const card = await page.$('article');
      if (card) {
        await card.hover();
        await page.waitForTimeout(300);
      }
    }
  },
  {
    name: 'en-blog-post',
    url: '/en/blog/en/ux-psychology-frontend-design-skill/',
    actions: async (page) => {
      // Scroll down to show reading progress bar
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(500);
    }
  },
  {
    name: 'en-blog-post-bottom',
    url: '/en/blog/en/ux-psychology-frontend-design-skill/',
    actions: async (page) => {
      // Scroll to bottom to show Back to Top button and reading progress at 100%
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000));
      await page.waitForTimeout(800);
    }
  },
  {
    name: 'en-about',
    url: '/en/about/',
    actions: async (page) => {
      await page.waitForTimeout(500);
    }
  },
  {
    name: 'en-contact',
    url: '/en/contact/',
    actions: async (page) => {
      await page.waitForTimeout(500);
    }
  },
  {
    name: 'en-social',
    url: '/en/social/',
    actions: async (page) => {
      // Hover over social link to show hover effect
      const link = await page.$('a[href*="github"]');
      if (link) {
        await link.hover();
        await page.waitForTimeout(300);
      }
    }
  },
  {
    name: 'en-improvement-history',
    url: '/en/improvement-history/',
    actions: async (page) => {
      await page.waitForTimeout(500);
    }
  },
  {
    name: 'en-footer',
    url: '/en/',
    actions: async (page) => {
      // Scroll to footer to show Back to Top button
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(800);
    }
  },
];

async function takeScreenshots() {
  console.log('Starting screenshot capture with UX focus...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  for (const { name, url, actions } of PAGES) {
    const fullUrl = `${BASE_URL}${url}`;
    console.log(`Capturing: ${name} (${fullUrl})`);

    try {
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for initial animations
      await page.waitForTimeout(1000);

      // Execute custom actions (scroll, hover, etc.)
      if (actions) {
        await actions(page);
      }

      // Take viewport screenshot (not full page for focused captures)
      const screenshotPath = path.join(OUTPUT_DIR, `${name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: false, // Viewport only to show specific section
      });

      console.log(`  ✓ Saved: ${screenshotPath}`);
    } catch (error) {
      console.error(`  ✗ Error capturing ${name}: ${error.message}`);
    }
  }

  await browser.close();
  console.log('\nScreenshot capture complete!');
}

takeScreenshots().catch(console.error);

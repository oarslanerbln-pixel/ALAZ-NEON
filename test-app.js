const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.error(`[Page Error]: ${error.message}`);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Console Error]: ${msg.text()}`);
  });

  console.log('Testing Landing Page...');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(4500); // Wait for intro animation
  await page.screenshot({ path: 'C:/Users/oarsl/.gemini/antigravity/brain/a9439004-3e2c-4df5-ac10-3d1c63027e5a/landing.png' });
  
  console.log('Testing Host Setup...');
  await page.goto('http://localhost:5173/host/setup');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/oarsl/.gemini/antigravity/brain/a9439004-3e2c-4df5-ac10-3d1c63027e5a/host_setup.png' });

  console.log('Testing Player Join...');
  await page.goto('http://localhost:5173/join');
  await page.waitForTimeout(4500); // Wait for intro animation on join page too
  await page.screenshot({ path: 'C:/Users/oarsl/.gemini/antigravity/brain/a9439004-3e2c-4df5-ac10-3d1c63027e5a/player_join.png' });

  await browser.close();
  console.log('Test completed successfully. Screenshots saved.');
})();

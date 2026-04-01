const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:5174/admin/dashboard', { waitUntil: 'networkidle0' });
  
  // Wait a moment for any initial animations
  await new Promise(r => setTimeout(r, 2000));

  // Find and click the "Student Directory" button 
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Student Directory')) {
      await btn.click();
      console.log("Clicked Student Directory button");
      break;
    }
  }

  // Wait for the new view to fade in and data to load
  await new Promise(r => setTimeout(r, 2000));

  // Take a full-page screenshot
  await page.screenshot({ 
    path: '/Users/huey/.gemini/antigravity/brain/f180c634-01a6-44bd-a2c3-bdf412efe3bf/admin_students_view.png',
    fullPage: true 
  });
  
  console.log("Screenshot saved.");

  await browser.close();
})();

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:5174/admin/dashboard', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));

  // Open Promotions Section
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Student Promotions')) {
      await btn.click();
      console.log("Clicked Student Promotions");
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ 
    path: '/Users/huey/.gemini/antigravity/brain/f180c634-01a6-44bd-a2c3-bdf412efe3bf/admin_promotions_bulk.png',
    fullPage: false 
  });
  console.log("Screenshot bulk saved.");

  // Click Manual Tab
  const manualButtons = await page.$$('button');
  for (const btn of manualButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Manual Override')) {
      await btn.click();
      console.log("Clicked Manual Override / Repeat");
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ 
    path: '/Users/huey/.gemini/antigravity/brain/f180c634-01a6-44bd-a2c3-bdf412efe3bf/admin_promotions_manual.png',
    fullPage: false 
  });
  console.log("Screenshot manual saved.");

  await browser.close();
})();

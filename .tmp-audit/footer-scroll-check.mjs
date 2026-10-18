import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-nav-light-start]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => scrollTo({ top: document.querySelector("[data-nav-light-start]").getBoundingClientRect().top + scrollY - 400, behavior: "instant" }));
  await page.waitForTimeout(300);
  await page.getByRole("link", {name:"Главная",exact:true}).hover();
  await page.waitForTimeout(300);
  await page.screenshot({path:".tmp-audit/media-seam/menu-final.png"});
  console.log("labels",JSON.stringify(await page.locator(".navigation-rail-art").evaluateAll(es=>es.map(e=>({theme:e.dataset.theme,clip:getComputedStyle(e).clipPath,background:getComputedStyle(e).backgroundColor,labelBackground:e.querySelector(".navigation-rail-label")&&getComputedStyle(e.querySelector(".navigation-rail-label")).backgroundColor})))));
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(500);
  const state = () => page.evaluate(() => ({
    scrollY, innerHeight, documentHeight: document.documentElement.scrollHeight,
    footerBottom: document.querySelector('footer').getBoundingClientRect().bottom,
    footerTop: document.querySelector('footer').getBoundingClientRect().top,
    railTop: document.querySelector('.navigation-rail').getBoundingClientRect().top,
    railBottom: document.querySelector('.navigation-rail').getBoundingClientRect().bottom,
    overflowing: [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 2 && ['auto','scroll'].includes(getComputedStyle(e).overflowY)).map(e => ({tag:e.tagName, class:e.className, h:e.clientHeight, scrollHeight:e.scrollHeight, scrollTop:e.scrollTop})),
  }));
  console.log('before', JSON.stringify(await state()));
  await page.mouse.move(1395, 830);
  await page.mouse.wheel(0, 1800);
  await page.waitForTimeout(500);
  console.log('after', JSON.stringify(await state()));
  await page.screenshot({path:'.tmp-audit/media-seam/footer.png'});
} finally { await browser.close(); }

import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await page.goto('http://127.0.0.1:5173/translyatsii',{waitUntil:'domcontentloaded'});
const cards=page.locator('.broadcast-archive-card');await cards.first().waitFor();await page.evaluate(()=>document.fonts.ready);
for(const width of [390,1440]){
await page.setViewportSize({width,height:900});
assert(await cards.count()>0);
for(const card of await cards.all()){
const toggle=card.getByRole('button',{name:/информацию о концерте/});assert.equal(await toggle.getAttribute('aria-expanded'),'false');
const id=await toggle.getAttribute('aria-controls');assert.equal(await page.locator('[id="'+id+'"]').isVisible(),false);
}
const first=cards.first(),toggle=first.getByRole('button',{name:/информацию о концерте/});
const url=await first.locator('a').getAttribute('href');
await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
assert(await first.getByText('Композиторы',{exact:true}).isVisible());assert(await first.getByText('Исполнители',{exact:true}).isVisible());
const program=first.getByRole('button',{name:'программа'});assert(await program.isVisible());assert.equal(await program.getAttribute('aria-expanded'),'false');
await program.click();assert.equal(await program.getAttribute('aria-expanded'),'true');
const pid=await program.getAttribute('aria-controls');await page.locator('[id="'+pid+'"]').waitFor();
assert.equal(await cards.nth(1).getByRole('button',{name:/информацию о концерте/}).getAttribute('aria-expanded'),'false');
await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');
await toggle.click();assert.equal(await program.getAttribute('aria-expanded'),'false');
assert.equal(await first.locator('a').getAttribute('href'),url);
await toggle.click();
assert.equal(new URL(page.url()).pathname,'/translyatsii');
console.log(width,'details initially hidden, plus toggles independently, nested program resets, recording link preserved');
}
await page.setViewportSize({width:390,height:844});
await cards.first().screenshot({path:'.tmp-audit/archive-collapsed.png'});
}finally{await browser.close();}

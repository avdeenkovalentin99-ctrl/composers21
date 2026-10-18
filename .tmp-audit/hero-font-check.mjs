import { chromium } from 'playwright';
const b = await chromium.launch({headless:true});
const p = await b.newPage({viewport:{width:1672,height:941}});
await p.goto('http://127.0.0.1:5174/', {waitUntil:'domcontentloaded'});
await p.locator('.festival-hero').waitFor();
await p.evaluate(()=>document.fonts.ready);
for (const weight of [700, 750, 800]) {
  await p.locator('.festival-hero').evaluate((hero, weight)=>{
    hero.style.setProperty('--title-weight',weight);
    hero.style.setProperty('--title-variation','"opsz" 144, "wght" '+weight+', "GRAD" -100, "wdth" 25');
    hero.style.setProperty('--title-x','1.85cqw');
    const title=hero.querySelector('h1');
    hero.style.setProperty('--title-scale',(hero.clientWidth * 0.962 / title.offsetWidth).toString());
  },weight);
  await p.screenshot({path:'.tmp-audit/hero-fonts/weight-'+weight+'.png',clip:{x:0,y:290,width:1657,height:255}});
  console.log(weight, await p.locator('.festival-hero').evaluate(el=>el.style.getPropertyValue('--title-scale')));
}
await b.close();

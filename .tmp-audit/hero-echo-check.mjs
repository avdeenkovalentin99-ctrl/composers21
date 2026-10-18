import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
for(const [width,height] of [[1440,900],[1920,1080],[1920,800]]) {
 await page.setViewportSize({width,height});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
 await page.locator('.festival-hero__year-echo').waitFor();
 await page.evaluate(()=>document.fonts.ready);
 const s=await page.evaluate(()=>{const box=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width}};return {echo:box('.festival-hero__year-echo'),video:box('.festival-hero__media--violin'),lowerYears:document.querySelectorAll('.festival-hero__year, .festival-hero__year--inverted').length,hero:box('.festival-hero__composition'),width:document.documentElement.clientWidth}});
 if(height>=900 && (s.echo.left>=s.video.right || s.echo.right<=s.video.right))throw new Error('Year must lightly cross the video edge');
 if(s.echo.left<s.hero.left||s.echo.right>s.hero.right||s.echo.top<s.hero.top||s.lowerYears!==0)throw new Error('Year placement is wrong');
 console.log(JSON.stringify({viewport:[width,height],...s}));
 if(width===1440)await page.screenshot({path:'.tmp-audit/hero/year-intersection.png'});
}
await browser.close();

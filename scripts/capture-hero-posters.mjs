// Capture fallback frames from the current production videos using Chromium.
// Run after `npm run build`, with `npm run preview` on port 4173.
import fs from 'node:fs/promises';
import {chromium} from 'playwright';

const base=process.argv[2]||'http://127.0.0.1:4173';
const assets=await fs.readdir('dist/assets');
const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage();
  await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.fulfill({status:204,body:''}));
  await page.goto(base+'/privacy',{waitUntil:'domcontentloaded'});
  await fs.mkdir('src/assets/hero',{recursive:true});
  for(const [prefix,offset,output] of [['logo-film-wide-',0,'logo-film-wide-poster.webp'],['logo-film-portrait-',9,'logo-film-portrait-poster.webp']]){
    const file=assets.find(file=>file.startsWith(prefix)&&file.endsWith('.mp4'));
    if(!file)throw new Error('Missing production video: '+prefix);
    const frame=await page.evaluate(async({src,offset})=>{
      const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='auto';
      const ready=new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error('Video frame timed out')),20000);
        video.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Cannot decode video'));},{once:true});
        video.addEventListener('loadeddata',()=>{clearTimeout(timer);resolve();},{once:true});
      });
      video.src=src;await ready;
      if(offset){const seeked=new Promise(resolve=>video.addEventListener('seeked',resolve,{once:true}));video.currentTime=Math.min(offset,video.duration/2);await seeked;}
      const canvas=document.createElement('canvas');canvas.width=Math.min(640,video.videoWidth);canvas.height=Math.round(video.videoHeight*canvas.width/video.videoWidth);
      canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL('image/webp',0.9);video.removeAttribute('src');video.load();
      return data.split(',')[1];
    },{src:base+'/assets/'+file,offset});
    const bytes=Buffer.from(frame,'base64');await fs.writeFile('src/assets/hero/'+output,bytes);console.log(output+': '+bytes.length+' bytes');
  }
} finally { await browser.close(); }

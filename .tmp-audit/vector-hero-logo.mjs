import fs from 'node:fs';
import * as opentype from '../node_modules/three-stdlib/libs/opentype.js';
const fontBytes = fs.readFileSync('C:/Windows/Fonts/times.ttf'); const font = opentype.parse(fontBytes.buffer.slice(fontBytes.byteOffset, fontBytes.byteOffset + fontBytes.byteLength));
function lettering(text,x,y,width,height) {
 const path=font.getPath(text,0,0,100);
 const box=path.getBoundingBox();
 const sx=width/(box.x2-box.x1), sy=height/(box.y2-box.y1);
 return '<path fill="#fafaf8" transform="translate('+x+' '+y+') scale('+sx+' '+sy+') translate('+(-box.x1)+' '+(-box.y1)+')" d="'+path.toPathData(3)+'"/>';
}
const line='M6 104 C37 80 81 50 111 35 C129 24 132 31 124 47 C140 56 153 86 164 125 C170 103 178 91 195 84 C213 77 236 81 252 53';
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 585 185" fill="none"><title>Композиторы XXI века — инверсия</title><defs><clipPath id="masses"><path d="M62 5h88v164H62z M170 21h46v158h-46z"/></clipPath></defs><path fill="#fafaf8" d="M62 5h88v164H62z M170 21h46v158h-46z"/><path d="'+line+'" stroke="#fafaf8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="'+line+'" stroke="#080808" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#masses)"/><circle cx="237" cy="157" r="12.5" fill="#a50b35"/>'+lettering('композиторы',262,77,319,40)+lettering('xxi века',353,110,149,30)+'</svg>';
fs.writeFileSync('public/assets/hero/festival-logo-inverse.svg',svg);
let hero=fs.readFileSync('src/app/components/hero/ReferenceHomeHero.tsx','utf8');
hero=hero.replace('import { useId } from "react";\n','');
hero=hero.replace(/function InvertedFestivalLogo\(\) \{[\s\S]*?\n\}\n/,'');
hero=hero.replace(/      <div className="reference-hero__edition"[^\n]*\n/,'');
hero=hero.replace('<InvertedFestivalLogo />','<img className="reference-hero__logo" src="/assets/hero/festival-logo-inverse.svg" alt="" aria-hidden="true" fetchPriority="high" />');
fs.writeFileSync('src/app/components/hero/ReferenceHomeHero.tsx',hero);
let video=fs.readFileSync('src/app/components/hero/VideoHomeHero.tsx','utf8');
video=video.replace('useEffect, useRef','useEffect, useRef, useState');
video=video.replace('import "./VideoHomeHero.css";','import heroVideo from "../../../../herovidv2.mp4";\nimport mobileHeroVideo from "../../../../herovidmob.mp4";\nimport "./VideoHomeHero.css";');
video=video.replace('  const videoRef', '  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 1023px)").matches);\n  useEffect(() => {\n    const query = window.matchMedia("(max-width: 1023px)");\n    const syncSource = () => setIsMobile(query.matches);\n    query.addEventListener("change", syncSource);\n    return () => query.removeEventListener("change", syncSource);\n  }, []);\n  const videoSource = isMobile ? mobileHeroVideo : heroVideo;\n  const videoRef');
video=video.replace('  }, []);\n\n  return (','  }, [videoSource]);\n\n  return (');
video=video.replace('ref={videoRef} src="/assets/hero/PIanohero1c.webm" poster="/assets/hero/piano.png"','key={videoSource} ref={videoRef} src={videoSource}');
fs.writeFileSync('src/app/components/hero/VideoHomeHero.tsx',video);

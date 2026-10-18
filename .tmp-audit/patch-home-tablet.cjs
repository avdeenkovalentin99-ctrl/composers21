const fs = require('fs');
function edit(path, replacements) {
  let text = fs.readFileSync(path, 'utf8');
  for (const [from, to] of replacements) {
    if (!text.includes(from)) throw new Error(path + ': missing ' + from);
    text = text.replaceAll(from, to);
  }
  fs.writeFileSync(path, text);
}
fs.writeFileSync('src/app/layout/homeViewport.ts', '// Keep this query in sync with the home-desktop variant in globals.css.\nexport const homeDesktopQuery = "(min-width: 64rem) and (orientation: landscape), (min-width: 80rem)";\n');
edit('src/app/pages/FestivalPageLegacy.tsx', [
 ['import { useEffect, useState } from "react";', 'import { useEffect, useState } from "react";\nimport { homeDesktopQuery } from "../layout/homeViewport";'],
 ['window.matchMedia("(min-width: 1024px)")', 'window.matchMedia(homeDesktopQuery)'],
 ['lg:block', 'home-desktop:block'],
]);
for (const name of ['MobileHomeBroadcasts', 'MobileHomeMedia', 'MobileFestivalYear']) {
 edit('src/app/components/' + name + '.tsx', [['lg:hidden', 'home-desktop:hidden']]);
}
edit('src/app/components/hero/FestivalIntro.tsx', [['lg:', 'home-desktop:']]);
edit('src/app/components/hero/VideoHomeHero.tsx', [
 ['const mobileVideoQuery = "(max-width: 1023px)";', 'import { homeDesktopQuery } from "../../layout/homeViewport";'],
 ['window.matchMedia(mobileVideoQuery).matches', '!window.matchMedia(homeDesktopQuery).matches'],
 ['window.matchMedia(mobileVideoQuery)', 'window.matchMedia(homeDesktopQuery)'],
 ['setIsMobile(mediaQuery.matches)', 'setIsMobile(!mediaQuery.matches)'],
 ['lg:bg-black/28', 'home-desktop:bg-black/28'],
]);
edit('src/app/layout/SiteHeader.tsx', [
 ['import "./homeRailEntrance.css";', 'import "./homeRailEntrance.css";\nimport { homeDesktopQuery } from "./homeViewport";'],
 ['className="pointer-events-none fixed inset-y-0 right-0 z-[80] hidden lg:block"', 'className={`pointer-events-none fixed inset-y-0 right-0 z-[80] hidden ${pathname === "/" ? "home-desktop:block" : "lg:block"}`}'],
 ['const mobileQuery = window.matchMedia("(width < 64rem)");', 'const desktopQuery = window.matchMedia(location.pathname === "/" ? homeDesktopQuery : "(min-width: 64rem)");'],
 ['if (mobileQuery.matches)', 'if (!desktopQuery.matches)'],
 ['mobileQuery.addEventListener', 'desktopQuery.addEventListener'],
 ['mobileQuery.removeEventListener', 'desktopQuery.removeEventListener'],
 ['}, [openDesktopGroup]);', '}, [openDesktopGroup, location.pathname]);'],
]);
edit('src/app/layout/MobileNavigation.tsx', [
 ['import "./MobileNavigation.css";', 'import "./MobileNavigation.css";\nimport { homeDesktopQuery } from "./homeViewport";'],
 ['window.matchMedia("(min-width: 64rem)")', 'window.matchMedia(location.pathname === "/" ? homeDesktopQuery : "(min-width: 64rem)")'],
 ['desktopQuery.addEventListener("change", onChange);', 'onChange();\n    desktopQuery.addEventListener("change", onChange);'],
 ['  }, []);', '  }, [location.pathname]);'],
 ['className="mobile-navigation lg:hidden"', 'className={`mobile-navigation ${location.pathname === "/" ? "home-desktop:hidden" : "lg:hidden"}`}'],
]);
edit('src/app/styles/globals.css', [
 ['@import "tailwindcss";', '@import "tailwindcss";\n\n/* Keep in sync with homeDesktopQuery in layout/homeViewport.ts. */\n@custom-variant home-desktop (@media (min-width: 64rem) and (orientation: landscape), (min-width: 80rem));'],
]);
let css = fs.readFileSync('src/app/styles/globals.css','utf8');
css = css.replace(/@media \(min-width: 64rem\) \{(\r?\n  \/\* Keep the original dark rail)/, '@media (min-width: 64rem) and (orientation: landscape), (min-width: 80rem) {$1');
fs.writeFileSync('src/app/styles/globals.css',css);
fs.appendFileSync('src/app/components/hero/MobileHomeHero.css', '\n/* Fit the portrait artwork into a tablet screen without stretching the hero. */\n@media (min-width: 40rem) {\n  .mobile-festival-hero__stage {\n    width: min(100%, calc(100svh * 941 / 1672));\n    margin-inline: auto;\n  }\n}\n');
console.log('Homepage tablet layout updated');

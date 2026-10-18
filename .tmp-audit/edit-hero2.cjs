
const fs = require('fs');
const read = p => fs.readFileSync(p, 'utf8');
const write = (p, s) => fs.writeFileSync(p, s.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'));
const hero = 'src/app/components/hero/DesktopHomeHero.tsx';
write(hero, read(hero).replace('export function DesktopHomeHero() {', 'export function DesktopHomeHero({ variant = "paper" }: { variant?: "paper" | "graphite" }) {').replace('className="festival-hero" aria-labelledby', 'className={`festival-hero${variant === "graphite" ? " festival-hero--graphite" : ""}`} aria-labelledby'));
const css = 'src/app/components/hero/DesktopHomeHero.css';
write(css, read(css) + `
/* The alternate route keeps the same geometry on one continuous graphite field. */
.festival-hero--graphite {
  --hero-paper: #101315;
  color: #f4f4f2;
}

.festival-hero--graphite .festival-hero__composition {
  background: var(--hero-paper);
}

.festival-hero--graphite .festival-hero__title {
  color: #fff;
}

.festival-hero--graphite .festival-hero__century {
  color: #dedcda;
}

.festival-hero--graphite .festival-hero__metadata {
  color: #c2c4c5;
}

.festival-hero--graphite .festival-hero__media--violin {
  isolation: isolate;
}

.festival-hero--graphite .festival-hero__clip {
  mix-blend-mode: difference;
}
`);
const legacy = 'src/app/pages/FestivalPageLegacy.tsx';
let page = read(legacy);
const start = page.indexOf('      <section className="hidden bg-white text-neutral-950 lg:block" aria-labelledby="festival-about-title">');
const end = page.indexOf('      {activeBroadcast ?', start);
if (start < 0 || end < 0) throw Error('Festival intro section not found');
const intro = page.slice(start, end).trimEnd();
write('src/app/components/hero/FestivalIntro.tsx', 'import { Link } from "react-router-dom";\nimport { PageContainer } from "../../layout/PageContainer";\n\nexport function FestivalIntro() {\n  return (\n' + intro + '\n  );\n}\n');
page = page.slice(0, start) + '      <FestivalIntro />\n' + page.slice(end);
write(legacy, page.replace('import { DesktopHomeHero }', 'import { FestivalIntro } from "../components/hero/FestivalIntro";\nimport { DesktopHomeHero }'));
write('src/app/pages/HeroVariantPage.tsx', `import { Link } from "react-router-dom";
import { DesktopHomeHero } from "../components/hero/DesktopHomeHero";
import { FestivalIntro } from "../components/hero/FestivalIntro";

export function HeroVariantPage() {
  return (
    <>
      <DesktopHomeHero variant="graphite" />
      <FestivalIntro />
      <div className="font-editorial-sans flex justify-center border-t border-black/10 px-6 py-8 text-xs uppercase tracking-[0.12em]">
        <Link to="/" className="border-b border-black/30 pb-1 transition-colors hover:text-neutral-500">
          К первому варианту →
        </Link>
      </div>
    </>
  );
}
`);
const router = 'src/app/router.tsx';
write(router, read(router)
  .replace('const MediaPage =', 'const HeroVariantPage = lazy(() => import("./pages/HeroVariantPage").then((module) => ({ default: module.HeroVariantPage })));\nconst MediaPage =')
  .replace('  "/festival": {', '  "/hero2": {\n    title: "Композиторы XXI века — графитовый hero",\n    description: "Второй вариант главного экрана фестиваля.",\n    canonicalPath: "/hero2",\n    robots: "noindex, nofollow",\n  },\n  "/festival": {')
  .replace('location.pathname === "/" ? (', '(location.pathname === "/" || location.pathname === "/hero2") ? (')
  .replace('{ index: true, element: <FestivalPageLegacy /> },', '{ index: true, element: <FestivalPageLegacy /> },\n      { path: "hero2", element: <HeroVariantPage /> },'));
const header = 'src/app/layout/SiteHeader.tsx';
write(header, read(header).replace('data-home={pathname === "/"} data-entrance={pathname === "/" ? "hidden" : undefined}', 'data-home={pathname === "/" || pathname === "/hero2"} data-entrance={pathname === "/" || pathname === "/hero2" ? "hidden" : undefined}'));
const rail = 'src/app/layout/useHomeRailEntrance.ts';
write(rail, read(rail).replace('if (pathname !== "/") {', 'if (pathname !== "/" && pathname !== "/hero2") {'));
console.log('Created /hero2 graphite variant and shared festival introduction.');


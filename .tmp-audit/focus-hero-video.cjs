const fs = require('fs');
const componentPath = 'src/app/components/hero/DesktopHomeHero.tsx';
let component = fs.readFileSync(componentPath, 'utf8');
component = component.replace('import type { CSSProperties, ReactNode } from "react";', 'import { useState, type CSSProperties, type ReactNode } from "react";');
component = component.replace('function HeroMedia({ name, src, videoSrc, alt, position, children }: HeroMediaProps) {\n  return (', 'function HeroMedia({ name, src, videoSrc, alt, position, children }: HeroMediaProps) {\n  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);\n\n  return (');
component = component.replace('<video className="festival-hero__media-source" src={videoSrc} poster={src} autoPlay muted loop playsInline aria-label={alt} />', `<video
          className="festival-hero__media-source"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          data-playing={hasStartedPlaying ? "true" : "false"}
          onPlaying={name === "violin" ? () => setHasStartedPlaying(true) : undefined}
          aria-label={alt}
        />`);
fs.writeFileSync(componentPath, component.replace(/\r\n/g, '\n'));
const cssPath = 'src/app/components/hero/DesktopHomeHero.css';
let css = fs.readFileSync(cssPath, 'utf8');
const start = css.indexOf('/* Fade the frame while focusing only the video, keeping the title crisp. */');
if (start < 0) throw new Error('Previous reveal animation not found');
css = css.slice(0, start) + `/* Start focusing with actual playback; the frame and lettering stay sharp. */
@media (prefers-reduced-motion: no-preference) {
  .festival-hero__media--violin .festival-hero__media-source {
    animation: festival-hero-violin-focus 3.6s cubic-bezier(0.4, 0, 0.2, 1) both paused;
  }

  .festival-hero__media--violin .festival-hero__media-source[data-playing="true"] {
    animation-play-state: running;
  }
}

@keyframes festival-hero-violin-focus {
  from { filter: blur(48px); }
  to { filter: blur(0); }
}
`;
fs.writeFileSync(cssPath, css.replace(/\r\n/g, '\n'));
console.log('Removed video posters and fade. Focus starts with playback and lasts 3.6 seconds.');


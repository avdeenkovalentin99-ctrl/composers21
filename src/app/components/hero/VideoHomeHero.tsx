import { useEffect, useState } from "react";

import heroVideo from "../../../../herovidv2.mp4";
import mobileHeroVideo from "../../../../herovidmob.mp4";

const mobileVideoQuery = "(max-width: 1023px)";

export function VideoHomeHero() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(mobileVideoQuery).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(mobileVideoQuery);
    const updateVideoSource = () => setIsMobile(mediaQuery.matches);

    updateVideoSource();
    mediaQuery.addEventListener("change", updateVideoSource);

    return () => mediaQuery.removeEventListener("change", updateVideoSource);
  }, []);

  const videoSource = isMobile ? mobileHeroVideo : heroVideo;

  return (
    <div className="absolute inset-0 bg-black">
      <video
        key={videoSource}
        src={videoSource}
        className="block h-full w-full bg-black object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Видео фестиваля Композиторы XXI века"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/40 lg:bg-black/28"
      />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import heroVideo from "../../../../herovidv2.mp4";
import mobileHeroVideo from "../../../../herovidmob.mp4";
import "./VideoHomeHero.css";

export function VideoHomeHero() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 1023px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const syncSource = () => setIsMobile(query.matches);
    query.addEventListener("change", syncSource);
    return () => query.removeEventListener("change", syncSource);
  }, []);
  const videoSource = isMobile ? mobileHeroVideo : heroVideo;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const syncPlayback = () => {
      if (reducedMotion.matches || document.hidden || !visible) video.pause();
      else void video.play().catch(() => { /* Keep the poster when autoplay is unavailable. */ });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(video);
    reducedMotion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [videoSource]);

  return (
    <div className="home-hero-video" aria-hidden="true">
      <video key={videoSource} ref={videoRef} src={videoSource} muted loop playsInline preload="metadata" />
    </div>
  );
}

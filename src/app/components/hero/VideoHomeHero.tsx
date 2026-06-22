import heroVideo from "../../../../herovidv2.mp4";
import mobileHeroVideo from "../../../../herovidmob.mp4";

export function VideoHomeHero() {
  return (
    <div className="absolute inset-0 bg-black">
      <video
        className="block h-full w-full bg-black object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Видео фестиваля Композиторы XXI века"
      >
        <source src={mobileHeroVideo} type="video/mp4" media="(max-width: 1023px)" />
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/40 lg:bg-black/28"
      />
    </div>
  );
}

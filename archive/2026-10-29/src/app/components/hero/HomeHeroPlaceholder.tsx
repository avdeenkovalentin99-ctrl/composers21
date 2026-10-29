export function HomeHeroPlaceholder() {
  return (
    <section
      className="relative min-h-svh w-full bg-neutral-400"
      aria-labelledby="home-hero-title"
    >
      <h1 id="home-hero-title" className="sr-only">Композиторы XXI века</h1>
      <span
        data-hero-rail-trigger
        className="pointer-events-none absolute bottom-0 left-0 h-px w-px"
        aria-hidden="true"
      />
    </section>
  );
}

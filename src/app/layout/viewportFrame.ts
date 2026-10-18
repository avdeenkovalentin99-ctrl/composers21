// One passive scroll listener for the desktop rail.
// Measure every subscriber before committing any DOM writes.
type ViewportReader = () => void | (() => void);

const readers = new Set<ViewportReader>();
let frame: number | null = null;

export function requestViewportFrame() {
  if (frame === null && readers.size > 0) {
    frame = window.requestAnimationFrame(flushViewportFrame);
  }
}

function flushViewportFrame() {
  frame = null;
  const commits: Array<() => void> = [];
  for (const read of readers) {
    const commit = read();
    if (commit) commits.push(commit);
  }
  for (const commit of commits) commit();
}

export function subscribeViewportFrame(read: ViewportReader) {
  if (readers.size === 0) {
    window.addEventListener("scroll", requestViewportFrame, { passive: true });
    window.addEventListener("resize", requestViewportFrame);
    window.addEventListener("pageshow", requestViewportFrame);
    window.addEventListener("hashchange", requestViewportFrame);
  }
  readers.add(read);
  requestViewportFrame();

  return () => {
    readers.delete(read);
    if (readers.size === 0) {
      window.removeEventListener("scroll", requestViewportFrame);
      window.removeEventListener("resize", requestViewportFrame);
      window.removeEventListener("pageshow", requestViewportFrame);
      window.removeEventListener("hashchange", requestViewportFrame);
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
    }
  };
}

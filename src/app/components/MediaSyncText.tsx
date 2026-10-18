import type { ReactNode } from "react";

/** Padding lives outside the line box, preserving the original text geometry. */
export function MediaSyncText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span className="media-sync-text-mask" data-sync-text={id}>
      <span className="media-sync-text-content">{children}</span>
    </span>
  );
}

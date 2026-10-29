import { type RefObject, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

let scrollLocks = 0;
let previousOverflow: [string, string];

function lockScroll() {
  if (scrollLocks++ === 0) {
    previousOverflow = [document.documentElement.style.overflow, document.body.style.overflow];
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }
  return () => {
    if (--scrollLocks === 0) {
      [document.documentElement.style.overflow, document.body.style.overflow] = previousOverflow;
    }
  };
}

// A single focus/scroll lifecycle for modal navigation and content dialogs.
export function useFocusScope(ref: RefObject<HTMLElement | null>, open: boolean, onEscape: () => void, returnFocusRef?: RefObject<HTMLElement | null>) {
  const location = useLocation();
  const latest = useRef({ onEscape, key: location.key });
  const scopeVersion = useRef(0);
  latest.current = { onEscape, key: location.key };

  useLayoutEffect(() => {
    const root = ref.current;
    if (!open || !root) return;
    const version = ++scopeVersion.current;
    const trigger = returnFocusRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const entryKey = latest.current.key;
    const unlock = lockScroll();
    const background = new Map<HTMLElement, boolean>();
    let branch: HTMLElement = root;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement && !["SCRIPT", "STYLE"].includes(sibling.tagName)) {
          background.set(sibling, sibling.inert);
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
      if (branch === document.body) break;
    }
    const focusable = () => [...root.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]',
    )].filter(element => element.tabIndex >= 0 && !element.closest("[inert]") && element.getClientRects().length > 0);
    const focusFirst = () => (focusable()[0] ?? root).focus({ preventScroll: true });
    focusFirst();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        latest.current.onEscape();
      } else if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0], last = elements.at(-1);
        if (!first || !last) { event.preventDefault(); root.focus(); return; }
        if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
    };
    const onFocus = (event: FocusEvent) => {
      if (!root.contains(event.target as Node)) focusFirst();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocus);
      background.forEach((inert, element) => { element.inert = inert; });
      unlock();
      // React restores the pre-commit selection after layout-effect cleanup.
      // Return focus afterwards so it cannot jump back into the exiting drawer.
      queueMicrotask(() => {
        if (scopeVersion.current === version && latest.current.key === entryKey && trigger?.isConnected && !trigger.closest("[inert]")) {
          trigger.focus({ preventScroll: true });
        }
      });
    };
  }, [open, ref, returnFocusRef]);
}

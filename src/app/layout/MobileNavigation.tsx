import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navigationItems } from "../data/navigation";
import type { NavGroup } from "../data/types";
import "./MobileNavigation.css";
import { homeDesktopQuery } from "./homeViewport";
import { useMobileMenuEntrance } from "./useMobileMenuEntrance";

export function MobileNavigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const hasPassedLogo = useMobileMenuEntrance(location.pathname);
  const isTriggerVisible = isOpen || hasPassedLogo;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const groupTriggerRef = useRef<HTMLButtonElement>(null);
  const firstSubLinkRef = useRef<HTMLAnchorElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const activeGroup = navigationItems.find((item): item is NavGroup => "children" in item && item.label === openGroup);

  function closeMenu() {
    setIsOpen(false);
    setOpenGroup(null);
  }

  useEffect(closeMenu, [location.key]);

  useEffect(() => {
    const desktopQuery = window.matchMedia(location.pathname === "/" ? homeDesktopQuery : "(min-width: 64rem)");
    const onChange = () => { if (desktopQuery.matches) closeMenu(); };
    onChange();
    desktopQuery.addEventListener("change", onChange);
    return () => desktopQuery.removeEventListener("change", onChange);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => firstLinkRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.style.overflow = previousOverflow;
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!activeGroup) return;
    const frame = requestAnimationFrame(() => firstSubLinkRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [activeGroup]);

  useLayoutEffect(() => {
    if (!activeGroup) return;
    const root = rootRef.current;
    const trigger = groupTriggerRef.current;
    const primary = trigger?.closest(".mobile-navigation__primary");
    const secondary = secondaryRef.current;
    const submenu = secondary?.querySelector("nav");
    if (!root || !trigger || !primary || !secondary || !submenu) return;

    const alignSubmenu = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const firstRowHeight = firstSubLinkRef.current?.getBoundingClientRect().height ?? triggerRect.height;
      const top = triggerRect.top - root.getBoundingClientRect().top + (triggerRect.height - firstRowHeight) / 2;
      const bottomPadding = parseFloat(getComputedStyle(secondary).paddingBottom);
      const maxTop = Math.max(0, root.clientHeight - submenu.scrollHeight - bottomPadding);
      root.style.setProperty("--mobile-submenu-top", `${Math.min(Math.max(0, top), maxTop)}px`);
    };
    alignSubmenu();
    const observer = new ResizeObserver(alignSubmenu);
    observer.observe(root);
    observer.observe(trigger);
    observer.observe(submenu);
    if (firstSubLinkRef.current) observer.observe(firstSubLinkRef.current);
    primary.addEventListener("scroll", alignSubmenu, { passive: true });
    return () => {
      observer.disconnect();
      primary.removeEventListener("scroll", alignSubmenu);
    };
  }, [activeGroup]);

  function handleNavigation(event: React.MouseEvent<HTMLAnchorElement>, to: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    closeMenu();
    if (location.pathname === to) window.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <div ref={rootRef} className={`mobile-navigation ${location.pathname === "/" ? "home-desktop:hidden" : "lg:hidden"}`} data-open={isOpen} data-submenu-open={Boolean(activeGroup)} data-trigger-visible={isTriggerVisible}
      role={isOpen ? "dialog" : undefined} aria-modal={isOpen ? true : undefined}
      aria-label={isOpen ? "Мобильная навигация" : undefined}
      onKeyDown={(event) => {
        if (!isOpen) return;
        if (event.key === "Escape") {
          event.preventDefault();
          if (activeGroup) {
            setOpenGroup(null);
            groupTriggerRef.current?.focus({ preventScroll: true });
          } else closeMenu();
        }
        if (event.key === "Tab") {
          const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([tabindex="-1"])') ?? [])
            .filter((item) => !item.closest("[inert]"));
          const first = items[0], last = items[items.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <button className="mobile-navigation__backdrop" type="button" aria-label="Закрыть меню"
        tabIndex={-1} inert={!isOpen} aria-hidden={!isOpen} onClick={closeMenu} />
      <div ref={secondaryRef} className="mobile-navigation__secondary" inert={!isOpen || !activeGroup} aria-hidden={!isOpen || !activeGroup}>
        <nav id="mobile-festival-submenu" aria-label="Разделы 2026">
          {activeGroup?.children.map((item, index) => (
            <NavLink key={item.to} ref={index === 0 ? firstSubLinkRef : undefined} to={item.to}
              onClick={(event) => handleNavigation(event, item.to)}>{item.label}</NavLink>
          ))}
        </nav>
      </div>
      <div id="mobile-primary-menu" className="mobile-navigation__primary" inert={!isOpen} aria-hidden={!isOpen}>
        <nav aria-label="Основные разделы">
          {navigationItems.map((item, index) => "children" in item ? (
            <button key={item.label} ref={groupTriggerRef} type="button" aria-expanded={openGroup === item.label}
              aria-controls="mobile-festival-submenu"
              data-active={item.children.some((child) => location.pathname === child.to || location.pathname.startsWith(child.to + "/"))}
              onClick={() => setOpenGroup((current) => current === item.label ? null : item.label)}>
              <span className="mobile-navigation__label">{item.label}</span><span aria-hidden="true" className="mobile-navigation__chevron">›</span>
            </button>
          ) : (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} ref={index === 0 ? firstLinkRef : undefined}
              onClick={(event) => handleNavigation(event, item.to)}><span className="mobile-navigation__label">{item.label}</span></NavLink>
          ))}
        </nav>
      </div>
      <button ref={triggerRef} className="mobile-navigation__trigger" type="button"
        inert={!isTriggerVisible} aria-hidden={!isTriggerVisible}
        aria-label={isOpen ? "Закрыть навигацию" : "Открыть меню"} aria-expanded={isOpen} aria-controls="mobile-primary-menu"
        onClick={() => { if (isOpen) closeMenu(); else setIsOpen(true); }}>
        <span className="mobile-navigation__plaque" aria-hidden="true"><span /><span /></span>
      </button>
    </div>
  );
}

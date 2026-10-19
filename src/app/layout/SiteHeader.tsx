import { type CSSProperties, type FocusEvent, type RefObject, useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { navigationItems } from "../data/navigation";
import type { NavGroup, NavItem } from "../data/types";
import { MobileNavigation } from "./MobileNavigation";
import { type NavTheme, useNavigationRailTheme } from "./useNavigationRailTheme";
import { useHomeRailEntrance } from "./useHomeRailEntrance";
import "./homeRailEntrance.css";
import { homeDesktopQuery } from "./homeViewport";

function isNavItemActive(item: NavItem, pathname: string) {
  if (item.to === "/") {
    return pathname === "/";
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function isNavGroupActive(group: NavGroup, pathname: string) {
  return group.children.some((item) => isNavItemActive(item, pathname));
}

function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return "children" in item;
}

function DesktopNavigationRail({
  pathname,
  openGroup,
  onToggleGroup,
  onClose,
  navigationRef,
  navTheme,
}: {
  pathname: string;
  openGroup: string | null;
  onToggleGroup: (label: string) => void;
  onClose: () => void;
  navigationRef: RefObject<HTMLDivElement | null>;
  navTheme?: NavTheme;
}) {
  const [hoveredSubmenuIndex, setHoveredSubmenuIndex] = useState<number | null>(null);
  const [submenuIndicator, setSubmenuIndicator] = useState({ y: 0, height: 0 });
  const activeGroup = navigationItems.find((item): item is NavGroup => isNavGroup(item) && item.label === openGroup);
  const railRef = useRef<HTMLElement | null>(null);
  const clipRef = useRef<SVGClipPathElement | null>(null);
  const clipId = `navigation-rail-${useId().replace(/:/g, "")}`;
  const [hoveredRailIndex, setHoveredRailIndex] = useState<number | null>(null);
  const [focusedRailIndex, setFocusedRailIndex] = useState<number | null>(null);
  useNavigationRailTheme({ railRef, clipRef, pathname, navTheme });
  useHomeRailEntrance({ railRef, pathname });

  const railItemClassName = "font-editorial-sans relative flex min-h-0 flex-1 items-center justify-center text-[11px] font-medium uppercase leading-none tracking-[0.14em]";
  const renderArtwork = (theme: NavTheme) => (
    <div
      aria-hidden="true"
      data-theme={theme}
      className="navigation-rail-art pointer-events-none absolute inset-0 flex flex-col"
      style={theme === "dark" ? { clipPath: `url(#${clipId})` } : undefined}
    >
      {navigationItems.map((item, index) => {
        const isActive = isNavGroup(item) ? isNavGroupActive(item, pathname) || openGroup === item.label : isNavItemActive(item, pathname);
        return (
          <div
            key={item.label}
            className={`${railItemClassName} navigation-rail-art-item`}
            style={{ "--rail-step": index } as CSSProperties}
            data-emphasized={isActive || hoveredRailIndex === index || focusedRailIndex === index}
            data-focused={focusedRailIndex === index}
          >
            {!isNavGroup(item) && item.to === "/" ? (
              <span className="navigation-rail-indicator-space relative p-2">
                <span className="block h-3 w-3" />
                <span
                  className={`pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-[8px] font-medium leading-none tracking-[0.08em] transition-[opacity,translate] duration-200 motion-reduce:transition-none ${hoveredRailIndex === 0 || focusedRailIndex === 0 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
                >
                  Главная
                </span>
              </span>
            ) : (
              <span className="navigation-rail-label">{item.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );

  useEffect(() => setHoveredSubmenuIndex(null), [openGroup]);

  return (
    <div ref={navigationRef} className={`pointer-events-none fixed inset-y-0 right-0 z-[80] hidden ${pathname === "/" ? "home-desktop:block" : "lg:block"}`}>
      <AnimatePresence>
        {activeGroup ? (
          <motion.button
            key="desktop-navigation-backdrop"
            type="button"
            aria-label="Закрыть подменю"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
            className="pointer-events-auto fixed inset-y-0 left-0 right-14 z-0 cursor-default bg-black/14"
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {activeGroup ? (
          <motion.aside
            id="desktop-navigation-drawer"
            initial={{ x: 340 }}
            animate={{ x: 0 }}
            exit={{ x: 340 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto fixed inset-y-0 right-14 z-10 flex w-[340px] items-center border-r border-black/12 !bg-white"
            aria-label={`Подменю «${activeGroup.label}»`}
          >
            <div className="w-full px-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={activeGroup.label} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}>
                  {activeGroup.label !== "2026" ? <p className="font-editorial-sans mb-8 text-[10px] font-medium uppercase tracking-[0.18em] text-[#64111f]">{activeGroup.label}</p> : null}
                  {activeGroup.label === "2026" ? (
                    <nav className="relative flex flex-col border-y border-black/12" aria-label="Навигация фестиваля 2026" onMouseLeave={() => setHoveredSubmenuIndex(null)}>
                      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 bg-black" initial={false} animate={{ y: submenuIndicator.y, height: submenuIndicator.height, opacity: hoveredSubmenuIndex === null ? 0 : 1 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} />
                      {activeGroup.children.map((item, index) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={onClose}
                          onMouseEnter={(event) => {
                            setHoveredSubmenuIndex(index);
                            setSubmenuIndicator({ y: event.currentTarget.offsetTop, height: event.currentTarget.offsetHeight });
                          }}
                          className={({ isActive }) => [
                            "font-editorial-sans relative z-10 px-5 py-4 text-[11px] font-medium uppercase leading-none tracking-[0.15em] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#64111f]",
                            hoveredSubmenuIndex === index ? "!text-white" : isActive ? "!text-[#64111f]" : "!text-neutral-800",
                          ].join(" ")}
                        >{item.label}</NavLink>
                      ))}
                    </nav>
                  ) : (
                    <nav className="flex flex-col border-y border-black/12" aria-label="Навигация раздела фестиваля">
                      {activeGroup.children.map((item) => (
                        <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => [
                          "font-editorial-sans relative border-b border-black/12 px-5 py-4 text-[11px] font-medium uppercase leading-none tracking-[0.15em] transition-colors duration-150 last:border-b-0 before:absolute before:bottom-3 before:left-0 before:top-3 before:w-[2px] before:bg-[#64111f] before:transition-opacity before:duration-150 hover:!text-[#64111f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#64111f]",
                          isActive ? "!text-[#64111f] before:opacity-100" : "!text-neutral-800 before:opacity-0 hover:before:opacity-100",
                        ].join(" ")}>{item.label}</NavLink>
                      ))}
                    </nav>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
      <nav ref={railRef} data-section-background={pathname === "/"} data-home={pathname === "/" || pathname === "/hero2" || pathname === "/hero3"} data-entrance={pathname === "/" || pathname === "/hero2" || pathname === "/hero3" ? "hidden" : undefined} className="navigation-rail pointer-events-auto fixed inset-y-0 right-0 z-20 w-14" aria-label="Основная навигация">
        <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute h-0 w-0">
          <defs><clipPath ref={clipRef} id={clipId} clipPathUnits="userSpaceOnUse" /></defs>
        </svg>
        <div aria-hidden="true" className="navigation-rail-light-window pointer-events-none absolute inset-0">
          {renderArtwork("light")}
        </div>
        {renderArtwork("dark")}
        <div aria-hidden="true" className="navigation-rail-footer-window pointer-events-none absolute inset-0">
          {renderArtwork("dark")}
        </div>
        <div className="relative z-10 flex h-full flex-col border-l border-transparent">
        {navigationItems.map((item, index) => {
          const hasSubmenu = isNavGroup(item);
          const isOpen = hasSubmenu && openGroup === item.label;
          const interactionProps = {
            className: `${railItemClassName} navigation-rail-action group focus-visible:outline-none`,
            style: { "--rail-step": index } as CSSProperties,
            "data-rail-step": index,
            onMouseEnter: () => setHoveredRailIndex(index),
            onMouseLeave: () => setHoveredRailIndex(null),
            onPointerDown: () => setFocusedRailIndex(null),
            onFocus: (event: FocusEvent<HTMLElement>) => setFocusedRailIndex(event.currentTarget.matches(":focus-visible") ? index : null),
            onBlur: () => setFocusedRailIndex(null),
          };
          return hasSubmenu ? (
            <button key={item.label} type="button" {...interactionProps} aria-expanded={isOpen} aria-controls="desktop-navigation-drawer" onClick={() => onToggleGroup(item.label)}>
              <span className="sr-only">{item.label}</span>
            </button>
          ) : (
            <NavLink key={item.to} to={item.to} onClick={onClose} {...interactionProps} aria-label={item.to === "/" ? "Главная" : undefined}>
              {item.to === "/" ? (
                <span className="navigation-rail-indicator p-2" aria-hidden="true">
                  <span className="block h-3 w-3 bg-[#64111f] transition-transform duration-200 ease-in-out group-hover:rotate-45 group-focus-visible:rotate-45 motion-reduce:transition-none" />
                </span>
              ) : (
                <span className="sr-only">{item.label}</span>
              )}
            </NavLink>
          );
        })}
        </div>
      </nav>
    </div>
  );
}

type SiteHeaderMode = "default" | "home-old-hero" | "home-old-solid";

export function SiteHeader({ mode = "default", navTheme }: { mode?: SiteHeaderMode; navTheme?: NavTheme }) {
  const location = useLocation();
  const [openDesktopGroup, setOpenDesktopGroup] = useState<string | null>(null);
  const desktopNavigationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setOpenDesktopGroup(null), [location.pathname]);

  useEffect(() => {
    if (!openDesktopGroup) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!desktopNavigationRef.current?.contains(event.target as Node)) setOpenDesktopGroup(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenDesktopGroup(null);
    };
    const desktopQuery = window.matchMedia(location.pathname === "/" ? homeDesktopQuery : "(min-width: 64rem)");
    const handleResize = () => { if (!desktopQuery.matches) setOpenDesktopGroup(null); };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleResize);
    const previousRootOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleResize);
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [openDesktopGroup, location.pathname]);

  if (mode === "home-old-solid") return null;

  return (
    <>
      <MobileNavigation />
      <DesktopNavigationRail
        pathname={location.pathname}
        openGroup={openDesktopGroup}
        onToggleGroup={(label) => setOpenDesktopGroup((current) => current === label ? null : label)}
        onClose={() => setOpenDesktopGroup(null)}
        navigationRef={desktopNavigationRef}
        navTheme={navTheme}
      />
    </>
  );
}

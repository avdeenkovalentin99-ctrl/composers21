import { MouseEvent, useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { navigationGroups, navigationItems } from "../data/navigation";
import type { NavGroup, NavItem } from "../data/types";
import { PageContainer } from "./PageContainer";

const HEADER_ROUTE_SETTLE_MS = 560;
const MOBILE_NAVIGATION_DELAY_MS = 250;

function getNavClassName(isActive: boolean) {
  return [
    "font-editorial-sans relative text-[12px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200",
    isActive
      ? "bg-neutral-900 px-2 py-[1px] !text-white"
      : "text-neutral-600 hover:text-neutral-900",
  ].join(" ");
}

function getNavGroupClassName(isActive: boolean) {
  return [
    "font-editorial-sans relative inline-flex text-[12px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200",
    isActive ? "bg-neutral-900 px-2 py-[1px] !text-white" : "text-neutral-600 hover:text-neutral-900",
  ].join(" ");
}

function isNavItemActive(item: NavItem, pathname: string) {
  if (item.to === "/") {
    return pathname === "/";
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function isNavGroupActive(group: NavGroup, pathname: string) {
  return group.children.some((item) => isNavItemActive(item, pathname));
}

function DropdownNavItem({
  group,
  pathname,
  onHomeClick,
  isOpen,
  onOpen,
  onClose,
  onToggle,
  onItemClick,
  useHoverInteraction,
}: {
  group: NavGroup;
  pathname: string;
  onHomeClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  onItemClick: () => void;
  useHoverInteraction: boolean;
}) {
  const isActive = isNavGroupActive(group, pathname);
  const groupTarget = group.to ?? group.children[0]?.to ?? "/";

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={useHoverInteraction ? onOpen : undefined}
      onMouseLeave={useHoverInteraction ? onClose : undefined}
    >
      <a
        href={groupTarget}
        className={getNavGroupClassName(isActive)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={(event) => {
          if (useHoverInteraction) {
            return;
          }

          event.preventDefault();
          onToggle();
        }}
      >
        {group.label}
      </a>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-full z-10 inline-flex w-fit max-w-[calc(100vw-2.5rem)] -translate-x-[38%] pt-4"
        >
          <div className="inline-flex w-fit border border-black/[0.07] bg-white/[0.92] px-1 py-0.5">
            <div className="inline-flex w-fit flex-nowrap items-center gap-x-5 gap-y-1.5">
              {group.children.map((item, index) => (
                <motion.span
                  key={`${group.label}-${item.to}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink
                    to={item.to}
                    onClick={(event) => {
                      if (item.to === "/") {
                        onHomeClick(event);
                      }
                      onItemClick();
                    }}
                    className={({ isActive: isChildActive }) =>
                      [
                        "font-editorial-sans whitespace-nowrap text-[10px] font-normal uppercase tracking-[0.12em] leading-none transition-colors duration-200",
                        isChildActive ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-900",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

function MobileNavGroup({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, to: string) => void;
}) {
  const isActive = isNavGroupActive(group, pathname);
  const labelClassName = [
    "font-editorial-sans inline-flex text-[13px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:text-[14px]",
    isActive ? "text-neutral-900" : "text-neutral-600",
  ].join(" ");
  const labelContent = isActive ? (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true">|</span>
      <span>{group.label}</span>
      <span aria-hidden="true">|</span>
    </span>
  ) : (
    group.label
  );

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {group.to ? (
        <NavLink to={group.to} onClick={(event) => onNavigate(event, group.to!)} className={labelClassName}>
          {labelContent}
        </NavLink>
      ) : (
        <span className={labelClassName}>{labelContent}</span>
      )}
      <div className="flex translate-x-8 flex-col items-start gap-4 text-left">
        {group.children.map((item) => (
          <NavLink
            key={`${group.label}-${item.to}`}
            to={item.to}
            onClick={(event) => onNavigate(event, item.to)}
            className={({ isActive: isChildActive }) =>
              [
                "font-editorial-sans inline-flex text-[11px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:text-[12px]",
                isChildActive ? "bg-neutral-900 px-2 py-[1px] !text-white" : "text-neutral-500 hover:text-neutral-900",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [useHoverInteraction, setUseHoverInteraction] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDesktopGroup, setOpenDesktopGroup] = useState<string | null>(null);
  const [isParticipantsLeaving, setIsParticipantsLeaving] = useState(false);
  const [isRouteSettling, setIsRouteSettling] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const previousPathnameRef = useRef(location.pathname);
  const mobileNavigationTimeoutRef = useRef<number | null>(null);
  const hasSolidHeaderBackground = isParticipantsLeaving || isScrolled || isRouteSettling;
  const hasHeaderBorder = isScrolled && !isParticipantsLeaving;
  const [homeItem, partnersItem] = navigationItems;
  const [festivalGroup, archiveGroup] = navigationGroups;

  const handleFestivalClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.currentTarget.getAttribute("href") !== "/") {
      return;
    }

    event.preventDefault();
    setMenuOpen(false);
    setOpenDesktopGroup(null);

    if (location.pathname !== "/") {
      navigate("/");
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  const handleMobileNavigation = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    event.preventDefault();
    setMenuOpen(false);

    if (mobileNavigationTimeoutRef.current !== null) {
      window.clearTimeout(mobileNavigationTimeoutRef.current);
    }

    mobileNavigationTimeoutRef.current = window.setTimeout(() => {
      mobileNavigationTimeoutRef.current = null;

      if (location.pathname !== to) {
        navigate(to);
        return;
      }

      window.scrollTo({ top: 0, behavior: "auto" });
    }, MOBILE_NAVIGATION_DELAY_MS);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateInteractionMode = () => {
      setUseHoverInteraction(mediaQuery.matches);
      setOpenDesktopGroup(null);
    };

    updateInteractionMode();
    mediaQuery.addEventListener("change", updateInteractionMode);

    return () => {
      mediaQuery.removeEventListener("change", updateInteractionMode);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDesktopGroup(null);

    if (previousPathnameRef.current === location.pathname) {
      return;
    }

    previousPathnameRef.current = location.pathname;
    setIsRouteSettling(true);

    const settleTimeoutId = window.setTimeout(() => {
      setIsRouteSettling(false);
    }, HEADER_ROUTE_SETTLE_MS);

    return () => {
      window.clearTimeout(settleTimeoutId);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!openDesktopGroup) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const headerElement = headerRef.current;

      if (headerElement?.contains(event.target as Node)) {
        return;
      }

      setOpenDesktopGroup(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopGroup(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDesktopGroup]);

  useEffect(() => {
    const handleParticipantsLeave = () => setIsParticipantsLeaving(true);

    window.addEventListener("participants:leave", handleParticipantsLeave);

    return () => {
      if (mobileNavigationTimeoutRef.current !== null) {
        window.clearTimeout(mobileNavigationTimeoutRef.current);
      }

      window.removeEventListener("participants:leave", handleParticipantsLeave);
    };
  }, []);

  useEffect(() => {
    setIsParticipantsLeaving(false);
  }, [location.pathname]);

  return (
    <>
      <header
        ref={headerRef}
        className={[
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-150",
          hasSolidHeaderBackground ? "bg-white duration-300" : "bg-transparent duration-500",
          hasHeaderBorder ? "border-black/70" : "border-transparent",
        ].join(" ")}
      >
        <PageContainer>
          <div className="mb-1 flex items-center justify-between gap-6 py-4 sm:mb-1">
            <nav className="hidden items-center gap-x-8 lg:flex xl:gap-x-12 2xl:gap-x-16" aria-label="Основная навигация">
              {homeItem ? (
                <NavLink
                  to={homeItem.to}
                  onClick={homeItem.to === "/" ? handleFestivalClick : undefined}
                  className={({ isActive }) => getNavClassName(isActive)}
                >
                  {homeItem.label}
                </NavLink>
              ) : null}
              {festivalGroup ? (
                <DropdownNavItem
                  group={festivalGroup}
                  pathname={location.pathname}
                  onHomeClick={handleFestivalClick}
                  isOpen={openDesktopGroup === festivalGroup.label}
                  onOpen={() => setOpenDesktopGroup(festivalGroup.label)}
                  onClose={() => setOpenDesktopGroup(null)}
                  onToggle={() => setOpenDesktopGroup((current) => (current === festivalGroup.label ? null : festivalGroup.label))}
                  onItemClick={() => setOpenDesktopGroup(null)}
                  useHoverInteraction={useHoverInteraction}
                />
              ) : null}
              {archiveGroup ? (
                <DropdownNavItem
                  group={archiveGroup}
                  pathname={location.pathname}
                  onHomeClick={handleFestivalClick}
                  isOpen={openDesktopGroup === archiveGroup.label}
                  onOpen={() => setOpenDesktopGroup(archiveGroup.label)}
                  onClose={() => setOpenDesktopGroup(null)}
                  onToggle={() => setOpenDesktopGroup((current) => (current === archiveGroup.label ? null : archiveGroup.label))}
                  onItemClick={() => setOpenDesktopGroup(null)}
                  useHoverInteraction={useHoverInteraction}
                />
              ) : null}
              {partnersItem ? (
                <NavLink to={partnersItem.to} className={({ isActive }) => getNavClassName(isActive)}>
                  {partnersItem.label}
                </NavLink>
              ) : null}
            </nav>

            <NavLink
              to="/afisha"
              className={({ isActive }) =>
                [
                  "font-editorial-sans inline-flex items-center border text-[12px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:hidden",
                  isActive
                    ? "border-transparent bg-neutral-900 px-2 py-2 !text-white"
                    : "border-neutral-400 px-2 py-2 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900",
                ].join(" ")
              }
            >
              Афиша
            </NavLink>

            <div className="ml-auto flex items-center gap-3">
              <NavLink
                to="/afisha"
                className={({ isActive }) =>
                  [
                    "font-editorial-sans hidden items-center border text-[12px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:inline-flex",
                    isActive
                      ? "border-transparent bg-neutral-900 px-2 py-2 !text-white"
                      : "border-neutral-400 px-2 py-2 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900",
                  ].join(" ")
                }
              >
                Афиша
              </NavLink>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="font-editorial-sans inline-flex items-center gap-2 text-[0.74rem] font-light uppercase tracking-[0.18em] leading-none text-black/72 lg:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
              >
                {menuOpen ? <X size={18} strokeWidth={1.6} /> : <Menu size={18} strokeWidth={1.6} />}
                Меню
              </button>
            </div>
          </div>
        </PageContainer>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-40 bg-white/99 pt-24 lg:hidden"
          >
            <PageContainer className="flex h-full flex-col pb-10">
              <nav className="flex flex-col items-center gap-8 text-center" aria-label="Мобильная навигация">
                {homeItem ? (
                  <NavLink
                    to={homeItem.to}
                    onClick={(event) => handleMobileNavigation(event, homeItem.to)}
                    className={({ isActive }) =>
                      [
                        "font-editorial-sans inline-flex text-[13px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:text-[14px]",
                        isActive ? "bg-neutral-900 px-2 py-[1px] !text-white" : "text-neutral-600 hover:text-neutral-900",
                      ].join(" ")
                    }
                  >
                    {homeItem.label}
                  </NavLink>
                ) : null}
                {festivalGroup ? (
                  <MobileNavGroup
                    group={festivalGroup}
                    pathname={location.pathname}
                    onNavigate={handleMobileNavigation}
                  />
                ) : null}
                {archiveGroup ? (
                  <MobileNavGroup
                    group={archiveGroup}
                    pathname={location.pathname}
                    onNavigate={handleMobileNavigation}
                  />
                ) : null}
                {partnersItem ? (
                  <NavLink
                    to={partnersItem.to}
                    onClick={(event) => handleMobileNavigation(event, partnersItem.to)}
                    className={({ isActive }) =>
                      [
                        "font-editorial-sans inline-flex text-[13px] font-normal uppercase tracking-[0.11em] leading-none transition-colors duration-200 sm:text-[14px]",
                        isActive ? "bg-neutral-900 px-2 py-[1px] !text-white" : "text-neutral-600 hover:text-neutral-900",
                      ].join(" ")
                    }
                  >
                    {partnersItem.label}
                  </NavLink>
                ) : null}
              </nav>
            </PageContainer>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

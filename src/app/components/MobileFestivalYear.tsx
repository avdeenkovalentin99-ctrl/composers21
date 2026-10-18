import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useFestivalYearEntrance } from "./useFestivalYearEntrance";
import "./MobileFestivalYear.css";

const sections = [
  { label: "Программа", to: "/afisha" },
  { label: "Участники", to: "/participants" },
  { label: "Академии", to: "/academies" },
  { label: "Партнёры", to: "/partners" },
  { label: "Команда", to: "/team" },
];

export function MobileFestivalYear() {
  const { ref: entranceRef } = useFestivalYearEntrance("mobile");
  return (
    <section className="mobile-festival-year home-desktop:hidden" aria-labelledby="mobile-festival-year-title">
      <div ref={entranceRef} className="mobile-festival-year__inner">
        <div className="mobile-festival-year__composition">
          <h2 data-year-title id="mobile-festival-year-title">фестиваль<span className="sr-only"> 2026</span></h2>
          {Array.from("2026").map((digit, index) => (
            <div className="mobile-festival-year__figure" data-digit-index={index} key={index} aria-hidden="true">
              {(index === 0 || index === 3) && <span data-year-graphic className="mobile-festival-year__square" />}
              {index === 0 && <span data-year-line="diagonal" className="mobile-festival-year__diagonal" />}
              {index === 2 && <span data-year-line="vertical" className="mobile-festival-year__hairline" />}
              <span data-year-digit className="mobile-festival-year__digit font-display-serif">{digit}</span>
              {index === 3 && (
                <span className="mobile-festival-year__dot-anchor font-display-serif">
                  <span className="mobile-festival-year__dot-spacer">{digit}</span>
                  <span data-year-dot className="mobile-festival-year__dot" />
                </span>
              )}
              {(index === 1 || index === 2) && (
                <span data-year-graphic className="year-graphic-mask">
                  <span className="mobile-festival-year__inversion">
                    <span className="year-inversion-counter">
                      <span data-year-digit className="mobile-festival-year__digit font-display-serif">{digit}</span>
                    </span>
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>
        <nav className="mobile-festival-year__links" aria-label="Разделы фестиваля">
          {sections.map(({ label, to }, index) => (
            <Link data-year-nav-label style={{ "--year-nav-index": index } as CSSProperties} to={to} key={to}>{label}<span aria-hidden="true">→</span></Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

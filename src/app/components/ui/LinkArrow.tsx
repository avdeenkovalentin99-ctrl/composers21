import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

type LinkArrowProps = {
  to: string;
  children: string;
};

export function LinkArrow({ to, children }: LinkArrowProps) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-[var(--color-text)] transition-colors duration-300 hover:text-[var(--color-accent)]"
    >
      <span>{children}</span>
      <ArrowUpRight
        size={16}
        strokeWidth={1.5}
        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </Link>
  );
}

import { Link, type LinkProps } from "react-router-dom";
import "./EditorialCta.css";

type EditorialCtaProps = Omit<LinkProps, "children"> & { children: string };

export function EditorialCta({ children, className = "", ...props }: EditorialCtaProps) {
  return (
    <Link {...props} className={"editorial-cta " + className}>
      <span className="editorial-cta-label">{children}</span>
      <span aria-hidden="true" className="editorial-cta-fill">{children}</span>
    </Link>
  );
}

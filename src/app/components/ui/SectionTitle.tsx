import type { PropsWithChildren } from "react";

type SectionTitleProps = PropsWithChildren<{
  eyebrow?: string;
  className?: string;
  titleClassName?: string;
}>;

export function SectionTitle({
  eyebrow,
  className = "",
  titleClassName = "",
  children,
}: SectionTitleProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {eyebrow ? (
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--color-muted)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`max-w-3xl text-3xl leading-tight font-normal tracking-[-0.03em] sm:text-4xl lg:text-5xl ${titleClassName}`}>
        {children}
      </h2>
    </div>
  );
}

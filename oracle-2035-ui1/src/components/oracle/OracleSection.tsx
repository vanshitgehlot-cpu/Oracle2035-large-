import React from "react";

export interface OracleSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const OracleSection: React.FC<OracleSectionProps> = ({
  title,
  subtitle,
  eyebrow,
  headerAction,
  children,
  spacing = "lg",
  className = "",
  ...props
}) => {
  const spacingClasses = {
    sm: "py-6 sm:py-8",
    md: "py-10 sm:py-12",
    lg: "py-14 sm:py-18",
    xl: "py-20 sm:py-24",
  };

  return (
    <section className={`relative w-full ${spacingClasses[spacing]} ${className}`} {...props}>
      {(title || eyebrow || headerAction) && (
        <div className="oracle-section-heading mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
          <div>
            {eyebrow && <span className="oracle-kicker block">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </section>
  );
};

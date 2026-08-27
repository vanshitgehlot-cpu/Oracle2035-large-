import React from "react";

export interface OracleContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export const OracleContainer: React.FC<OracleContainerProps> = ({
  children,
  maxWidth = "xl",
  className = "",
  ...props
}) => {
  const maxClasses = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${maxClasses[maxWidth]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

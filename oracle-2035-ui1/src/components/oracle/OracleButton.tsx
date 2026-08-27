/** Evidence Ledger button primitive: presentation-only semantic variants. */
import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { Loader2 } from "lucide-react";

export type OracleButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "ghost";
export type OracleButtonSize = "sm" | "md" | "lg";

export interface OracleButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: OracleButtonVariant;
  size?: OracleButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const OracleButton = React.forwardRef<HTMLButtonElement, OracleButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const sizeClasses: Record<OracleButtonSize, string> = {
      sm: "px-3 py-1.5 text-xs tracking-wide gap-1.5 min-h-[44px]",
      md: "px-4 py-2.5 text-sm tracking-normal gap-2 min-h-[44px]",
      lg: "px-5 py-3 text-sm tracking-normal gap-2.5 min-h-[48px]",
    };

    const variantClasses: Record<OracleButtonVariant, string> = {
      primary: "oracle-button-primary font-bold",
      secondary: "oracle-button-secondary font-bold",
      tertiary: "oracle-button-tertiary font-semibold",
      destructive: "oracle-button-destructive font-bold",
      ghost: "oracle-button-ghost font-semibold",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
        disabled={disabled || isLoading}
        className={`oracle-button inline-flex items-center justify-center select-none focus-visible:ring-2 focus-visible:ring-[var(--oracle-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--oracle-canvas)] focus-visible:outline-none disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" /> : leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  },
);

OracleButton.displayName = "OracleButton";

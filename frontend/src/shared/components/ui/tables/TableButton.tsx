import type { ReactNode } from "react";
import { Link } from "react-router";

import { cn } from "@/shared/lib/utils";
import {
  ACCIONES_STYLES,
  type AccionesType,
} from "@/shared/lib/themes/status-theme";

interface BaseProps {
  children: ReactNode;
  title: string;
  variant?: AccionesType;
  className?: string;
}

interface AsButtonProps extends BaseProps {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

interface AsLinkProps extends BaseProps {
  href: string;
  onClick?: never;
  type?: never;
}

type TableButtonProps = AsButtonProps | AsLinkProps;

const sharedClasses = [
  "inline-flex items-center justify-center rounded-xl border p-2.5",
  "transition-colors duration-200 active:scale-95",
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-amber-500 focus-visible:ring-offset-2",
  "dark:focus-visible:ring-offset-gray-900",
].join(" ");

export function TableButton({
  children,
  title,
  variant = "DEFAULT",
  className,
  href,
  onClick,
  type = "button",
}: TableButtonProps) {
  const classes = cn(sharedClasses, ACCIONES_STYLES[variant], className);

  if (href !== undefined) {
    return (
      <Link to={href} className={classes} title={title} aria-label={title}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

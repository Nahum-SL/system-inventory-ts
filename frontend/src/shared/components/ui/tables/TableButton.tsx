// src/components/ui/table/TableButton.tsx
"use client";

import { Link } from "react-router";
import { cn } from "@/shared/lib/utils";
import {
  ACCIONES_STYLES,
  type AccionesType,
} from "@/shared/lib/themes/status-theme";

// Base de propiedades compartidas por ambos tipos de render
interface BaseProps {
  children: React.ReactNode;
  title: string;
  variant?: AccionesType;
  className?: string;
}

// Tipo específico cuando actúa como un Botón de acción nativo
interface AsButtonProps extends BaseProps {
  href?: never; // Prohibe el uso de href si es botón
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

// Tipo específico cuando actúa como un Link de redirección
interface AsLinkProps extends BaseProps {
  href: string; // href es obligatorio si es Link
  onClick?: never; // Prohibe el uso de onClick si es Link
  type?: never;
}

type TableButtonProps = AsButtonProps | AsLinkProps;

export function TableButton({
  children,
  title,
  variant = "DEFAULT",
  className,
  href,
  onClick,
  type = "button",
}: TableButtonProps) {
  // Estilos compartidos de estructura y transiciones (Consistencia visual absoluta)
  const sharedClasses = cn(
    "p-2.5 inline-flex items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer",
    ACCIONES_STYLES[variant],
    className,
  );

  // Variante 1: Redirección semántica (Next.js Link)
  if (href) {
    return (
      <Link to={href} className={sharedClasses} title={title}>
        {children}
      </Link>
    );
  }

  // Variante 2: Acción de Javascript (Click/Submit/Modal)
  return (
    <button
      type={type}
      onClick={onClick}
      className={sharedClasses}
      title={title}
    >
      {children}
    </button>
  );
}

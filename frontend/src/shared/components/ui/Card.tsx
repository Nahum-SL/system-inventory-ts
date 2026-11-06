import type { HTMLAttributes } from "react";

import { CARD_STYLES } from "@/shared/lib/themes/surface-theme";
import { cn } from "@/shared/lib/utils";

interface Props extends HTMLAttributes<HTMLElement> {
  /** Etiqueta HTML; `section` por defecto. Usa `div` si no es un bloque con título. */
  as?: "section" | "div" | "article";
  /** `false` para listas o tablas que llegan hasta el borde. */
  padded?: boolean;
}

export default function Card({
  as: Tag = "section",
  padded = true,
  className,
  ...rest
}: Props) {
  return (
    <Tag
      className={cn(CARD_STYLES.base, padded && CARD_STYLES.padded, className)}
      {...rest}
    />
  );
}

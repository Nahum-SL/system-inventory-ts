import type { CSSProperties } from "react";

import type { Asset } from "../../types";
import { LABEL_SIZES } from "../../constant/labelSize";

export type LabelSizeId = keyof typeof LABEL_SIZES;

export interface LabelItem {
  asset: Asset;
  svg?: string;
}

export default function LabelSheet({
  items,
  size,
}: {
  items: LabelItem[];
  size: LabelSizeId;
}) {
  const config = LABEL_SIZES[size];

  return (
    <div className="flex flex-wrap content-start gap-[2mm] rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-950 print:gap-[2mm] print:rounded-none print:border-0 print:bg-white print:p-0">
      {items.map(({ asset, svg }) => {
        const labelStyle: CSSProperties = {
          width: `${config.width}mm`,
          height: `${config.height}mm`,
        };

        const qrStyle: CSSProperties = {
          width: `${config.qr}mm`,
          height: `${config.qr}mm`,
        };

        return (
          <article
            key={asset.id}
            style={labelStyle}
            className={[
              "flex shrink-0 break-inside-avoid items-center gap-[2mm] overflow-hidden",
              "border border-dashed border-slate-400 bg-white p-[2mm] text-black",
              "print:break-inside-avoid print:border-slate-500 print:bg-white",
            ].join(" ")}
          >
            {svg ? (
              <img
                alt={`Código QR del activo ${asset.codigoInventario}`}
                style={qrStyle}
                className="block shrink-0 object-contain"
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
              />
            ) : (
              <div
                role="img"
                aria-label={`QR no disponible para ${asset.codigoInventario}`}
                style={qrStyle}
                className="flex shrink-0 items-center justify-center bg-slate-100 text-center text-[6pt] text-slate-500"
              >
                QR no disponible
              </div>
            )}

            <div className="min-w-0 flex-1 overflow-hidden text-black">
              <p className="break-all font-mono text-[11pt] font-bold leading-tight">
                {asset.codigoInventario}
              </p>

              <p className="mt-[1mm] line-clamp-3 wrap-break-word text-[7pt] leading-tight">
                {asset.descripcion}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

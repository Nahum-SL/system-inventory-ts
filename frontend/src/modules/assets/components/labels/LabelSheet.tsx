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
  const s = LABEL_SIZES[size];

  return (
    <div className="flex flex-wrap gap-[2mm]">
      {items.map(({ asset, svg }) => (
        <div
          key={asset.id}
          style={{ width: `${s.width}mm`, height: `${s.height}mm` }}
          className="flex break-inside-avoid items-center gap-[2mm] overflow-hidden border border-dashed border-slate-400 bg-white p-[2mm]"
        >
          {svg ? (
            <img
              alt={`QR de ${asset.codigoInventario}`}
              style={{ width: `${s.qr}mm`, height: `${s.qr}mm` }}
              className="shrink-0"
              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
            />
          ) : (
            <div
              style={{ width: `${s.qr}mm`, height: `${s.qr}mm` }}
              className="shrink-0 bg-slate-100"
            />
          )}

          <div className="min-w-0 text-black">
            <p className="font-mono text-[11pt] font-bold leading-tight">
              {asset.codigoInventario}
            </p>
            <p className="mt-[1mm] line-clamp-3 text-[7pt] leading-tight">
              {asset.descripcion}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

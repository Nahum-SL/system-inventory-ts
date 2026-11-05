
import { useState } from "react";
import { Download, Printer, QrCode, Loader2 } from "lucide-react";

import { useAssetQrs } from "../hooks/useAssetQrs";

interface Props {
  id: number;
  codigo: string;
}

export default function AssetQr({ id, codigo }: Props) {
  const [result] = useAssetQrs([id]);
  const svg = result?.data;
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const imageUrl = svg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    : "";

  const downloadPng = async () => {
    if (!svg || downloading) return;

    setDownloading(true);
    setError("");

    try {
      const blob = new Blob([svg], {
        type: "image/svg+xml;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);

      try {
        const image = new Image();

        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () =>
            reject(new Error("No se pudo cargar el código QR."));
          image.src = url;
        });

        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 800;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas no disponible.");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 800, 800);
        ctx.drawImage(image, 0, 0, 800, 800);

        const png = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (file) =>
              file
                ? resolve(file)
                : reject(new Error("No se pudo crear el PNG.")),
            "image/png",
          );
        });

        const pngUrl = URL.createObjectURL(png);

        try {
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `QR-${codigo}.png`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        } finally {
          setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
        }
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al descargar QR.",
      );
    } finally {
      setDownloading(false);
    }
  };

  const printQr = () => {
    if (!svg) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError("Permite las ventanas emergentes para imprimir.");
      return;
    }

    const safeCode = codigo.replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[char];
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Etiqueta QR</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 32px;
              color: #111827;
            }
            img { width: 240px; height: 240px; }
            h2 { margin-bottom: 8px; }
            p { font-size: 13px; color: #64748b; }
          </style>
        </head>
        <body>
          <h2>YONDA INVENTORY</h2>
          <img id="qr" alt="Código QR" />
          <h3>${safeCode}</h3>
          <p>Identificación del activo</p>
        </body>
      </html>
    `);

    printWindow.document.close();

    const image = printWindow.document.getElementById(
      "qr",
    ) as HTMLImageElement | null;

    if (image) {
      image.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
      image.src = imageUrl;
    }
  };

  return (
    <section className="space-y-5 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
        <QrCode size={25} />
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Código QR del activo
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Escanea el código para identificar el activo.
        </p>
      </div>

      {svg ? (
        <div className="mx-auto w-fit rounded-2xl bg-white p-5 shadow-lg">
          <img
            src={imageUrl}
            alt={`Código QR de ${codigo}`}
            className="size-52 object-contain"
          />
        </div>
      ) : (
        <div className="flex min-h-52 items-center justify-center text-sm text-slate-400">
          QR no disponible
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#34415f] dark:bg-[#141e33]">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Código de inventario
        </p>
        <p className="mt-1 font-mono font-bold text-slate-900 dark:text-white">
          {codigo}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!svg || downloading}
          onClick={downloadPng}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Descargar
        </button>

        <button
          type="button"
          disabled={!svg}
          onClick={printQr}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-[#34415f] dark:bg-[#141e33] dark:text-white dark:hover:bg-[#293756]"
        >
          <Printer size={16} />
          Imprimir
        </button>
      </div>
    </section>
  );
}

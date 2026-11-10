import { useEffect, useId, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    // Evita notificar un cierre que ya solicitó el componente padre.
    if (open) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          ref.current?.close();
        }
      }}
      aria-labelledby={titleId}
      className={[
        "m-auto w-[calc(100%-2rem)] max-w-md",
        "max-h-[calc(100dvh-2rem)] overflow-y-auto",
        "rounded-xl border border-slate-200 bg-white p-0",
        "text-slate-900 shadow-xl backdrop:bg-black/50",
        "dark:border-gray-700 dark:bg-gray-900 dark:text-slate-100",
      ].join(" ")}
    >
      {open && (
        <div className="space-y-4 p-5">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>

          {children}
        </div>
      )}
    </dialog>
  );
}

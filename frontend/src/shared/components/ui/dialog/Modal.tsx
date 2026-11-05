
import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg";
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

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

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      aria-label={title}
      className={`
        m-auto w-[calc(100%-2rem)]
        max-h-[92dvh] overflow-y-auto
        rounded-2xl border border-[#3b4965]
        bg-[#202b45] p-0 text-white
        shadow-2xl
        backdrop:bg-[#020617]/80
        backdrop:backdrop-blur-sm
        ${size === "lg" ? "max-w-2xl" : "max-w-lg"}
      `}
    >
      {open && (
        <>
          <div
            className="
              flex items-start justify-between gap-4
              border-b border-[#394764]
              px-5 py-5 sm:px-6
            "
          >
            <div>
              <p
                className="
                  mb-1 text-xs font-semibold
                  uppercase tracking-wide text-indigo-400
                "
              >
                YONDA · System Inventory
              </p>

              <h2 className="text-xl font-bold text-white">
                {title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="
                flex size-10 shrink-0 items-center
                justify-center rounded-xl
                border border-indigo-500/60
                text-slate-300 transition-colors
                hover:bg-indigo-500/15
                hover:text-white
              "
            >
              <X size={19} />
            </button>
          </div>

          <div className="px-5 py-5 sm:px-6">
            {children}
          </div>
        </>
      )}
    </dialog>
  );
}


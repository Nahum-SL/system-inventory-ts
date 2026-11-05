
import { UserRound, CheckCircle2 } from "lucide-react";

export interface AssignablePerson {
  id: string;
  nombre: string;
  cargo?: string | null;
  correo?: string | null;
  fotoUrl?: string | null;
}

interface Props {
  person: AssignablePerson;
  onClick: () => void;
}

export default function AssignPersonCard({
  person,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex w-full flex-col items-start gap-3
        rounded-2xl border border-[#34415f]
        bg-[#202b45] p-4 text-left
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-indigo-500
        hover:bg-[#293653]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-indigo-500
      "
    >
      <div className="flex w-full items-start justify-between">
        <div
          className="
            flex size-12 items-center justify-center
            overflow-hidden rounded-full
            bg-indigo-500/15 text-indigo-300
          "
        >
          {person.fotoUrl ? (
            <img
              src={person.fotoUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <UserRound size={24} />
          )}
        </div>

        <CheckCircle2
          size={19}
          className="text-emerald-400"
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0">
        <p className="truncate font-semibold text-white">
          {person.nombre}
        </p>

        {person.correo && (
          <p className="mt-1 truncate text-xs text-slate-400">
            {person.correo}
          </p>
        )}

        {person.cargo && (
          <span
            className="
              mt-2 inline-flex rounded-full
              bg-indigo-500/15 px-2.5 py-1
              text-xs font-medium text-indigo-300
            "
          >
            {person.cargo}
          </span>
        )}
      </div>
    </button>
  );
}

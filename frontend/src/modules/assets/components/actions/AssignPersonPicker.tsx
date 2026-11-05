
import { useMemo, useState } from "react";
import {
  Search,
  UserRound,
  ChevronRight,
  Users,
  AlertCircle,
} from "lucide-react";

import { usePeople } from "@/modules/catalogs/hooks/use-catalog-queries";

export interface AssignablePerson {
  id: string;
  nombre: string;
  documento?: string | null;
}

interface Props {
  onSelect: (person: AssignablePerson) => void;
}

export default function AssignPersonPicker({
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");

  // Consulta real del catálogo de personas
  const {
    data,
    isPending,
    error,
  } = usePeople();

  const filteredPeople = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();

    return (data ?? [])
      .filter((person) => {
        const fullName =
          `${person.nombres} ${person.apellidos}`;

        const reverseName =
          `${person.apellidos} ${person.nombres}`;

        const searchable = [
          fullName,
          reverseName,
          person.numerodoc,
        ]
          .join(" ")
          .toLocaleLowerCase();

        return searchable.includes(term);
      })
      .map((person): AssignablePerson => ({
        id: String(person.id),
        nombre:
          `${person.nombres} ${person.apellidos}`.trim(),
        documento: person.numerodoc,
      }));
  }, [data, search]);

  return (
    <section className="space-y-5">
      {/* ENCABEZADO */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Asignación del activo
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Busca una persona y selecciona su tarjeta
          para asignarle el activo.
        </p>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <Search
          size={19}
          aria-hidden="true"
          className="
            pointer-events-none absolute
            left-4 top-1/2 -translate-y-1/2
            text-slate-400
          "
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar por nombre, apellido o documento..."
          aria-label="Buscar personas"
          className="
            h-12 w-full rounded-xl
            border border-slate-200
            bg-white pl-11 pr-4
            text-sm text-slate-900
            placeholder:text-slate-400
            outline-none transition-colors
            focus:border-indigo-500
            focus:ring-2 focus:ring-indigo-500/20
            dark:border-[#46557c]
            dark:bg-[#111a2c]
            dark:text-white
            dark:placeholder:text-slate-500
          "
        />
      </div>

      {/* CARGANDO */}
      {isPending ? (
        <div
          role="status"
          className="py-10 text-center text-sm text-slate-400"
        >
          Cargando personas...
        </div>
      ) : error ? (
        /* ERROR DEL BACKEND */
        <div
          role="alert"
          className="
            flex items-center gap-3
            rounded-xl border border-red-500/30
            bg-red-500/10 p-4
            text-sm text-red-400
          "
        >
          <AlertCircle size={20} />
          No se pudo cargar la lista de personas.
        </div>
      ) : filteredPeople.length === 0 ? (
        /* SIN RESULTADOS */
        <div
          className="
            flex flex-col items-center gap-3
            rounded-xl border border-dashed
            border-slate-200 px-4 py-10
            text-center dark:border-[#34415f]
          "
        >
          <Users
            size={30}
            className="text-slate-500"
          />

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {search
              ? "No se encontraron personas con esa búsqueda."
              : "No hay personas registradas."}
          </p>
        </div>
      ) : (
        /* TARJETAS DE PERSONAS */
        <div
          className="
            grid grid-cols-1 gap-3
            sm:grid-cols-2 lg:grid-cols-3
          "
        >
          {filteredPeople.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => onSelect(person)}
              className="
                group flex min-w-0 flex-col
                items-start gap-3 rounded-xl
                border border-slate-200
                bg-white p-4 text-left
                transition-all duration-200
                hover:border-indigo-500
                hover:shadow-md
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-indigo-500
                dark:border-[#34415f]
                dark:bg-[#172137]
                dark:hover:bg-[#263452]
              "
            >
              {/* AVATAR */}
              <div className="flex w-full justify-between">
                <div
                  className="
                    flex size-12 items-center
                    justify-center rounded-full
                    bg-indigo-500/15
                    text-indigo-600
                    dark:text-indigo-300
                  "
                >
                  <UserRound size={25} />
                </div>

                <ChevronRight
                  size={18}
                  className="
                    text-slate-400
                    transition-colors
                    group-hover:text-indigo-400
                  "
                />
              </div>

              {/* INFORMACIÓN */}
              <div className="w-full min-w-0">
                <p
                  className="
                    truncate text-sm font-semibold
                    text-slate-900 dark:text-white
                  "
                >
                  {person.nombre}
                </p>

                {person.documento && (
                  <p
                    className="
                      mt-1 text-xs
                      text-slate-500 dark:text-slate-400
                    "
                  >
                    Documento: {person.documento}
                  </p>
                )}
              </div>

              <span
                className="
                  mt-auto text-xs font-medium
                  text-indigo-600 dark:text-indigo-300
                "
              >
                Seleccionar persona
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

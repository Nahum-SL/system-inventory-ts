export default function Spinner() {
  return (
    <div
      className="flex justify-center p-10"
      role="status"
      aria-label="Cargando"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
    </div>
  );
}

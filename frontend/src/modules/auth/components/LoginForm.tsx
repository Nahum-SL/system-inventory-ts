import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type LoginFormValues,
  type LoginInputValues,
} from "../schema";
import { useLogin } from "../hooks/useLogin";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputValues, unknown, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  // Al iniciar sesión, la sesión cambia y LoginPage redirige sola.
  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-xl font-semibold">Iniciar sesión</h1>

      <label className="block text-sm font-medium">
        Usuario
        <input
          className={inputClass}
          autoComplete="username"
          autoCapitalize="none"
          aria-invalid={!!errors.username}
          {...register("username")}
        />
        {errors.username && (
          <span className="text-xs text-red-600">
            {errors.username.message}
          </span>
        )}
      </label>

      <label className="block text-sm font-medium">
        Contraseña
        <input
          className={inputClass}
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <span className="text-xs text-red-600">
            {errors.password.message}
          </span>
        )}
      </label>

      {login.error && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-2 text-sm text-red-700"
        >
          {login.error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={login.isPending}
        className="w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {login.isPending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

import { Link, type LinkProps } from "react-router";

type NavigationLinkProps = LinkProps & {
  variant?: "outline" | "primary";
};

export function NavigationLink({
  variant = "outline",
  className,
  children,
  ...props
}: NavigationLinkProps) {
  return (
    <Link
      {...props}
      className={[
        "group relative isolate inline-flex min-h-10 items-center justify-center gap-2",
        "overflow-hidden rounded-xl border px-4 py-2",
        "text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-amber-500 focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-gray-900",

        variant === "outline" &&
          [
            "border-slate-200 bg-white text-slate-700",
            "hover:border-amber-600",
            "dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200",
            "dark:hover:border-amber-500",
          ].join(" "),

        variant === "primary" &&
          [
            "border-transparent bg-amber-600 text-white",
            "hover:bg-amber-700",
            "dark:bg-amber-500 dark:text-gray-950",
            "dark:hover:bg-amber-400",
          ].join(" "),

        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {variant === "outline" && (
        <span
          aria-hidden="true"
          className={[
            "absolute inset-0 -z-10 translate-y-full",
            "bg-amber-600 transition-transform duration-300 ease-out",
            "group-hover:translate-y-0",
            "dark:bg-amber-500",
            "motion-reduce:transition-none",
          ].join(" ")}
        />
      )}

      <span
        className={[
          "relative inline-flex items-center gap-2",
          variant === "outline" &&
            "transition-colors duration-300 group-hover:text-white dark:group-hover:text-gray-950",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </span>
    </Link>
  );
}

import { cn } from "../../lib/utils";

export function Button({ children, variant = "brand", size = "md", className, disabled, loading, onClick, type = "button", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    brand: "btn-brand",
    outline: "btn-brand-outline",
    ghost: "text-white/60 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg",
    destructive: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30",
    secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
  };

  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-7 py-3",
    icon: "w-10 h-10 p-0",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : children}
    </button>
  );
}

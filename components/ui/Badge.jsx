/**
 * MOTOSERVICE - Componente Badge reutilizable en JavaScript
 */

export function Badge({ children, variant = "default", className = "" }) {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors";

  const variants = {
    default: "bg-slate-800 text-slate-200 border border-slate-700",
    success: "bg-emerald-950/80 text-emerald-400 border border-emerald-700/50",
    warning: "bg-amber-950/80 text-amber-400 border border-amber-700/50",
    electric: "bg-cyan-950/80 text-cyan-400 border border-cyan-700/50",
    danger: "bg-rose-950/80 text-rose-400 border border-rose-700/50",
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span className={`${baseClasses} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
}

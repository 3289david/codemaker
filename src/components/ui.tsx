export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <p className={`text-sm rounded-md px-3 py-2 ${error ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
      {error || success}
    </p>
  );
}

export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function SectionTitle({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) {
  return (
    <div className="mb-8">
      {eyebrow && <p className="text-sm font-semibold text-indigo-600 mb-1">{eyebrow}</p>}
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">{title}</h2>
      {desc && <p className="text-neutral-500 mt-2">{desc}</p>}
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400">
      {"★".repeat(rating)}
      <span className="text-neutral-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

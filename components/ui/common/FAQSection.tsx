// FAQSection — reusable accordion FAQ (native <details>/<summary>, zero deps)
interface FAQItem {
  q: string;
  a: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
}

export default function FAQSection({
  title = "Perguntas Frequentes",
  subtitle,
  items,
}: FAQSectionProps) {
  return (
    <section className="py-20 md:py-28 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-mono mb-4 block">
            Duvidas
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] tracking-tighter">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-[var(--foreground-secondary)] leading-relaxed max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white/[0.02] border border-white/[0.06] open:bg-white/[0.03] transition-colors duration-150"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 sm:px-6 py-4 select-none">
                <span className="font-semibold text-[var(--foreground)]">{item.q}</span>
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center transition-transform duration-150 group-open:rotate-45">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="text-[var(--foreground-secondary)]"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 sm:px-6 pb-5">
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                  {item.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

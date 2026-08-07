import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Boxes, ShoppingBag, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

// Wireframe mock per showcase row — hints at the actual UI
const MOCKS: { icon: LucideIcon; render: () => JSX.Element }[] = [
  {
    icon: BarChart3,
    render: () => (
      <div className="flex flex-col gap-3 h-full p-4">
        <div className="flex items-center justify-between">
          <div className="h-3 w-28 rounded bg-white/25" />
          <div className="h-3 w-12 rounded bg-white/10" />
        </div>
        {/* Stat row */}
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((s) => (
            <div key={s} className="rounded-lg bg-white/5 p-2 flex flex-col gap-1.5">
              <div className="h-2 w-8 rounded bg-white/20" />
              <div className="h-2.5 w-10 rounded bg-primary/60" />
            </div>
          ))}
        </div>
        {/* Bar chart */}
        <div className="flex-1 rounded-lg bg-white/5 p-3 flex flex-col gap-2 min-h-0">
          <div className="h-2 w-20 rounded bg-white/20" />
          <div className="flex-1 flex items-end gap-1.5 pt-1">
            {[45, 70, 55, 85, 60, 95, 75].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-[hsl(var(--color-secondary))]/70"
              />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Boxes,
    render: () => (
      <div className="flex flex-col gap-2.5 h-full p-4">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-white/25" />
          <div className="h-6 w-16 rounded-md bg-primary/50" />
        </div>
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-2 py-1.5">
          <div className="col-span-6 h-2 rounded bg-white/15" />
          <div className="col-span-3 h-2 rounded bg-white/15" />
          <div className="col-span-3 h-2 rounded bg-white/15" />
        </div>
        {/* Table rows */}
        {[
          { tone: 'bg-primary/40', warn: false },
          { tone: 'bg-[hsl(var(--color-secondary))]/50', warn: false },
          { tone: 'bg-white/10', warn: true },
          { tone: 'bg-white/10', warn: false },
        ].map((row, r) => (
          <div
            key={r}
            className="grid grid-cols-12 gap-2 items-center rounded-md bg-white/5 px-2 py-2"
          >
            <div className="col-span-6 flex items-center gap-2">
              <span className={`w-5 h-5 rounded ${row.tone}`} />
              <div className="h-2 w-20 rounded bg-white/25" />
            </div>
            <div className="col-span-3 h-2 rounded bg-white/20" />
            <div className="col-span-3">
              {row.warn ? (
                <span className="inline-block h-2 w-10 rounded bg-[hsl(var(--color-accent))]/70" />
              ) : (
                <span className="inline-block h-2 w-8 rounded bg-white/20" />
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: ShoppingBag,
    render: () => (
      <div className="flex h-full">
        {/* Product grid */}
        <div className="flex-1 p-4 grid grid-cols-2 gap-2.5 content-start">
          <div className="flex items-center justify-between">
            <ShoppingBag className="w-4 h-4 text-white/40" />
          </div>
          {[
            { tone: 'from-primary/30 to-primary/10' },
            { tone: 'from-[hsl(var(--color-secondary))]/30 to-[hsl(var(--color-secondary))]/10' },
            { tone: 'from-[hsl(var(--color-accent))]/30 to-[hsl(var(--color-accent))]/10' },
            { tone: 'from-sky-500/30 to-sky-500/10' },
          ].map((p, idx) => (
            <div
              key={idx}
              className={`rounded-lg bg-gradient-to-br ${p.tone} p-2.5 flex flex-col gap-1.5 justify-end h-20`}
            >
              <div className="h-2 w-12 rounded bg-white/30" />
              <div className="h-2 w-8 rounded bg-white/20" />
            </div>
          ))}
        </div>
        {/* Cart panel */}
        <div className="w-1/3 border-l border-white/10 p-3 flex flex-col gap-2">
          <div className="h-2.5 w-16 rounded bg-white/25" />
          {[0, 1, 2].map((c) => (
            <div key={c} className="flex items-center gap-2 rounded-md bg-white/5 p-1.5">
              <span className="w-4 h-4 rounded bg-white/15" />
              <div className="flex-1 h-2 rounded bg-white/15" />
            </div>
          ))}
          <div className="mt-auto rounded-lg bg-primary/30 p-2 flex items-center justify-between">
            <div className="h-2 w-8 rounded bg-white/40" />
            <div className="h-2 w-6 rounded bg-white/40" />
          </div>
        </div>
      </div>
    ),
  },
];

export default function ShowcaseSection() {
  const { t, language } = useTranslation();
  const reduceMotion = useReducedMotion();

  const items = translations[language].landing.showcase.items;

  return (
    <section id="showcase" className="py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.2, 0, 0, 1] as const }}
          className="text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t('landing.showcase.label')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">
            {t('landing.showcase.title')}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {t('landing.showcase.subtitle')}
          </p>
        </motion.div>

        {/* Alternating rows */}
        <div className="mt-16 flex flex-col gap-20">
          {items.map((row, i) => {
            const screenshotFirst = i % 2 === 0; // odd rows screenshot left
            const mock = MOCKS[i % MOCKS.length];
            const MockIcon = mock.icon;

            return (
              <motion.div
                key={row.title}
                initial={reduceMotion ? {} : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.2, 0, 0, 1] as const }}
                className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center"
              >
                {/* Screenshot side */}
                <div
                  className={`${
                    screenshotFirst ? 'md:order-1' : 'md:order-2'
                  }`}
                >
                  <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-primary via-[hsl(var(--color-secondary))] to-[hsl(var(--color-accent))] shadow-xl shadow-primary/10">
                    <div
                      role="img"
                      aria-label={row.alt}
                      className="relative aspect-[16/10] rounded-[1.4rem] bg-[hsl(190_6%_12%)] overflow-hidden"
                    >
                      {/* Window chrome */}
                      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                        <span className="ml-3 inline-flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                          <MockIcon className="w-3 h-3" />
                          vaporpos.app
                        </span>
                      </div>
                      {/* Wireframe body */}
                      <div className="h-[calc(100%-2.75rem)]">{mock.render()}</div>
                      {/* Scanline */}
                      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(0deg,white,white_1px,transparent_1px,transparent_3px)]" />
                    </div>
                  </div>
                </div>

                {/* Text side */}
                <div
                  className={`flex flex-col justify-center ${
                    screenshotFirst ? 'md:order-2' : 'md:order-1'
                  }`}
                >
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <span className="grid place-items-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {t('landing.showcase.label')}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold mt-3 text-foreground">
                    {row.title}
                  </h3>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    {row.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
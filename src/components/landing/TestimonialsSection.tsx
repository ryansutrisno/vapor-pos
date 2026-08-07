import { motion, useReducedMotion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

// Gradient avatar backgrounds — deterministic per index
const AVATAR_GRADIENTS = [
  'from-primary to-[hsl(var(--color-secondary))]',
  'from-[hsl(var(--color-accent))] to-rose-400',
  'from-sky-500 to-indigo-500',
];

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function TestimonialsSection() {
  const { t, language } = useTranslation();
  const reduceMotion = useReducedMotion();

  const items = translations[language].landing.testimonials.items;

  return (
    <section id="testimonials" className="py-24 bg-secondary/30">
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
            {t('landing.testimonials.label')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {t('landing.testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Cards — grid on desktop, snap carousel on mobile */}
        <div className="mt-14 flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 scroll-px-6">
          {items.map((item, i) => (
            <motion.figure
              key={item.name}
              initial={reduceMotion ? {} : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: reduceMotion ? 0 : 0.55,
                delay: reduceMotion ? 0 : i * 0.1,
                ease: [0.2, 0, 0, 1] as const,
              }}
              className="relative shrink-0 w-[85%] sm:w-[70%] md:w-auto snap-center md:snap-normal p-6 rounded-2xl bg-card border border-border shadow-sm border-l-[3px] border-l-primary"
            >
              {/* 5-star rating */}
              <div className="flex items-center gap-1 text-[hsl(var(--color-accent))]">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <blockquote className="text-foreground italic leading-relaxed mt-3">
                “{item.quote}”
              </blockquote>

              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  className={`grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br ${
                    AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]
                  } text-white text-xs font-bold shrink-0`}
                  aria-hidden="true"
                >
                  {initials(item.name)}
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-sm">
                    {item.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.shop} · {item.city}
                  </span>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
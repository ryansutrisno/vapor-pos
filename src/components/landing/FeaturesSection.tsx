import { motion, useReducedMotion } from 'framer-motion';
import {
  Store as StoreIcon,
  Package as PackageIcon,
  Users as UsersIcon,
  BarChart3,
  Shield as ShieldIcon,
  Cloud as CloudIcon,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

const ICON_MAP: Record<string, LucideIcon> = {
  Store: StoreIcon,
  Package: PackageIcon,
  Users: UsersIcon,
  BarChart3,
  Shield: ShieldIcon,
  Cloud: CloudIcon,
};

// Soft tint per feature card — bg circle + matching icon color
const TINTS: { bg: string; fg: string }[] = [
  { bg: 'bg-primary/15', fg: 'text-primary' }, // purple
  { bg: 'bg-[hsl(var(--color-secondary))]/15', fg: 'text-[hsl(var(--color-secondary))]' }, // mint
  { bg: 'bg-[hsl(var(--color-accent))]/20', fg: 'text-[hsl(41_95%_45%)]' }, // amber
  { bg: 'bg-sky-500/15', fg: 'text-sky-500' }, // blue
  { bg: 'bg-rose-500/15', fg: 'text-rose-500' }, // rose
  { bg: 'bg-indigo-500/15', fg: 'text-indigo-500' }, // indigo
];

export default function FeaturesSection() {
  const { t, language } = useTranslation();
  const reduceMotion = useReducedMotion();

  const items = translations[language].landing.features.items;

  const container = {
    initial: {},
    whileInView: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
  };
  const item = {
    initial: reduceMotion ? {} : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: reduceMotion ? 0 : 0.55, ease: [0.2, 0, 0, 1] as const },
  };

  return (
    <section id="features" className="py-24">
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
            {t('landing.features.label')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">
            {t('landing.features.title')}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {items.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] ?? StoreIcon;
            const tint = TINTS[i % TINTS.length];
            return (
              <motion.div
                key={feature.title}
                variants={item}
                className="group p-6 rounded-2xl bg-secondary/50 border border-border/60 transition-all duration-300 ease-md hover:-translate-y-1 hover:shadow-md hover:bg-secondary/70"
              >
                <span
                  className={`grid place-items-center w-12 h-12 rounded-full ${tint.bg} ${tint.fg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="w-6 h-6" />
                </span>
                <h3 className="font-semibold text-lg mt-4 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export default function CtaSection() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gradient backdrop */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-[hsl(var(--color-secondary))]/10 to-[hsl(var(--color-accent))]/10"
        aria-hidden="true"
      />
      {/* Soft blobs */}
      <div
        className="pointer-events-none absolute -top-20 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-[hsl(var(--color-secondary))]/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto text-center px-6">
        <motion.h2
          initial={reduceMotion ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            ease: [0.2, 0, 0, 1] as const,
          }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
        >
          {t('landing.cta.title')}
        </motion.h2>

        <motion.p
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            delay: reduceMotion ? 0 : 0.1,
            ease: [0.2, 0, 0, 1] as const,
          }}
          className="mt-4 text-lg text-muted-foreground"
        >
          {t('landing.cta.subtitle')}
        </motion.p>

        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            delay: reduceMotion ? 0 : 0.2,
            ease: [0.2, 0, 0, 1] as const,
          }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl active:scale-95 transition-all duration-300 ease-md"
          >
            {t('landing.cta.cta_trial')}
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <a
            href="#showcase"
            className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-border bg-background text-foreground text-base font-semibold hover:bg-primary/5 hover:border-primary/40 active:scale-95 transition-all duration-300 ease-md"
          >
            {t('landing.cta.cta_demo')}
          </a>
        </motion.div>

        <motion.p
          initial={reduceMotion ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            delay: reduceMotion ? 0 : 0.35,
          }}
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ShieldCheck className="w-4 h-4 text-[hsl(var(--color-secondary))]" />
          {t('landing.cta.trust')}
        </motion.p>
      </div>
    </section>
  );
}
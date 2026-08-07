import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, PlayCircle, BarChart3, TrendingUp, Package, Users } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export default function HeroSection() {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? {} : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduceMotion ? 0 : 0.6,
      delay: reduceMotion ? 0 : delay,
      ease: [0.2, 0, 0, 1] as const,
    },
  });

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Atmospheric gradient mesh */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] rounded-full bg-[hsl(var(--color-secondary))]/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-[hsl(var(--color-accent))]/15 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <div className="flex flex-col">
            <motion.span
              {...fadeUp(0.05)}
              className="inline-flex items-center self-start gap-2 rounded-full bg-[hsl(var(--color-accent))]/15 text-[hsl(var(--color-accent-dark,41_95%_45%))] dark:text-[hsl(var(--color-accent))] px-4 py-1.5 text-xs font-semibold tracking-wide ring-1 ring-[hsl(var(--color-accent))]/30"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-accent))]" />
              {t('landing.hero.badge')}
            </motion.span>

            <motion.h1
              {...fadeUp(0.15)}
              className="mt-6 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]"
            >
              {t('landing.hero.title')}
            </motion.h1>

            <motion.p
              {...fadeUp(0.25)}
              className="mt-6 text-lg text-muted-foreground max-w-lg"
            >
              {t('landing.hero.subtitle')}
            </motion.p>

            <motion.div
              {...fadeUp(0.35)}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all duration-300 ease-md"
              >
                {t('landing.hero.cta_trial')}
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#showcase"
                className="group inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full border border-border bg-background/60 text-foreground text-base font-semibold backdrop-blur-sm hover:bg-primary/5 hover:border-primary/40 active:scale-95 transition-all duration-300 ease-md"
              >
                <PlayCircle className="w-5 h-5 text-primary" />
                {t('landing.hero.cta_demo')}
              </a>
            </motion.div>
          </div>

          {/* Right column - dashboard preview */}
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 32, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.8,
              delay: reduceMotion ? 0 : 0.3,
              ease: [0.2, 0, 0, 1] as const,
            }}
            className="relative"
          >
            {/* Gradient border wrapper */}
            <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-primary via-[hsl(var(--color-secondary))] to-[hsl(var(--color-accent))] shadow-2xl shadow-primary/20">
              <div
                role="img"
                aria-label={t('landing.hero.dashboard_alt')}
                className="relative aspect-[4/3] rounded-[1.4rem] bg-[hsl(190_6%_12%)] overflow-hidden"
              >
                {/* Fake window chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                  <span className="ml-3 text-[10px] text-white/40 font-mono">
                    vaporpos.app/dashboard
                  </span>
                </div>

                {/* Wireframe body */}
                <div className="flex h-[calc(100%-2.75rem)]">
                  {/* Sidebar */}
                  <div className="hidden sm:flex w-1/5 flex-col gap-3 p-3 border-r border-white/10">
                    <div className="h-7 rounded-md bg-white/10" />
                    <div className="h-5 rounded-md bg-primary/40" />
                    <div className="h-5 rounded-md bg-white/10" />
                    <div className="h-5 rounded-md bg-white/10" />
                    <div className="h-5 rounded-md bg-white/10" />
                    <div className="mt-auto h-5 rounded-md bg-white/5" />
                  </div>

                  {/* Main */}
                  <div className="flex-1 p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-24 rounded bg-white/20" />
                      <div className="h-4 w-10 rounded bg-white/10" />
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: TrendingUp, tone: 'bg-emerald-400/20' },
                        { icon: Package, tone: 'bg-sky-400/20' },
                        { icon: Users, tone: 'bg-violet-400/20' },
                      ].map((card, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-white/5 p-2 flex flex-col gap-1.5"
                        >
                          <card.icon className="w-3.5 h-3.5 text-white/60" />
                          <div className="h-2 w-10 rounded bg-white/20" />
                          <div className="h-1.5 w-8 rounded bg-white/10" />
                        </div>
                      ))}
                    </div>

                    {/* Chart mock */}
                    <div className="flex-1 rounded-lg bg-white/5 p-3 flex flex-col gap-2 min-h-0">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-white/40" />
                        <div className="h-2 w-16 rounded bg-white/20" />
                      </div>
                      <div className="flex-1 flex items-end gap-1.5 pt-2">
                        {[40, 65, 50, 80, 55, 90, 70, 95, 60, 85, 75, 100].map(
                          (h, i) => (
                            <div
                              key={i}
                              style={{ height: `${h}%` }}
                              className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-[hsl(var(--color-secondary))]/60"
                            />
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtle scanline overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[repeating-linear-gradient(0deg,white,white_1px,transparent_1px,transparent_3px)]" />
              </div>
            </div>

            {/* Floating accent badge */}
            <motion.div
              initial={reduceMotion ? {} : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduceMotion ? 0 : 1, duration: reduceMotion ? 0 : 0.5 }}
              className="absolute -bottom-4 -left-4 hidden md:flex items-center gap-2 rounded-2xl bg-background border border-border shadow-xl px-4 py-3"
            >
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-[hsl(var(--color-secondary))]/15 text-[hsl(var(--color-secondary))]">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">+34%</span>
                <span className="text-sm font-semibold text-foreground">
                  Sales
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
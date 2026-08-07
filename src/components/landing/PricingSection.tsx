import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Star, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
};

/**
 * Convert a monthly price string like "50K" / "150K" / "250K" into its
 * yearly equivalent (price * 10) keeping the suffix, e.g. "50K" → "500K".
 * Non-numeric prices (e.g. "Custom") are returned untouched.
 */
function toYearlyPrice(price: string): string {
  const match = price.match(/^(\d+)\s*(K|M)?$/i);
  if (!match) return price;
  const num = parseInt(match[1], 10) * 10;
  const suffix = match[2] ? match[2].toUpperCase() : '';
  return `${num}${suffix}`;
}

export default function PricingSection() {
  const { t, language } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [yearly, setYearly] = useState(false);

  const plans = translations[language].landing.pricing.plans as Plan[];
  const verticalPlans = plans.slice(0, 3);
  const enterprise = plans[3];

  const yearlyPeriod = language === 'id' ? '/thn' : '/yr';

  // Shared animation variants — staggered reveal
  const container = {
    initial: {},
    whileInView: { transition: { staggerChildren: reduceMotion ? 0 : 0.1 } },
  };
  const item = {
    initial: reduceMotion ? {} : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: reduceMotion ? 0 : 0.55, ease: [0.2, 0, 0, 1] as const },
  };

  return (
    <section id="pricing" className="py-24">
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
            {t('landing.pricing.label')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-foreground">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {t('landing.pricing.subtitle')}
          </p>
        </motion.div>

        {/* Monthly / Yearly toggle */}
        <div className="mt-8 flex justify-center">
          <div className="relative inline-flex items-center gap-1 p-1 rounded-full bg-secondary/60 border border-border/60">
            {/* Sliding pill */}
            <span
              aria-hidden="true"
              className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-sm transition-transform duration-300 ease-out ${
                yearly ? 'translate-x-[calc(100%+0.25rem)]' : 'translate-x-0'
              }`}
            />
            <button
              type="button"
              onClick={() => setYearly(false)}
              aria-pressed={!yearly}
              className={`relative z-10 px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                !yearly ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('landing.pricing.monthly')}
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              aria-pressed={yearly}
              className={`relative z-10 flex items-center gap-2 px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                yearly ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('landing.pricing.yearly')}
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  yearly
                    ? 'bg-white/20 text-white'
                    : 'bg-[hsl(var(--color-secondary))]/15 text-[hsl(var(--color-secondary))]'
                }`}
              >
                {t('landing.pricing.save')}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <motion.div
          variants={container}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
        >
          {verticalPlans.map((plan) => {
            const isPopular = !!plan.popular;
            const displayPrice = yearly ? toYearlyPrice(plan.price) : plan.price;
            const displayPeriod = yearly ? yearlyPeriod : plan.period;

            return (
              <motion.div
                key={plan.id}
                variants={item}
                className={`relative p-6 rounded-2xl bg-card border transition-all duration-300 ease-md hover:-translate-y-1 hover:shadow-md ${
                  isPopular
                    ? 'border-primary shadow-sm ring-1 ring-primary/20'
                    : 'border-border/60'
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-[11px] font-semibold tracking-wide shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    {t('landing.pricing.popular')}
                  </span>
                )}

                {/* Plan name */}
                <h3 className="font-semibold text-lg text-foreground">{plan.name}</h3>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">
                    {displayPrice}
                  </span>
                  {displayPeriod && (
                    <span className="text-sm font-medium text-muted-foreground">
                      {displayPeriod}
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 grid place-items-center w-4 h-4 shrink-0 rounded-full bg-[hsl(var(--color-secondary))]/15">
                        <Check className="w-3 h-3 text-[hsl(var(--color-secondary))]" strokeWidth={3} />
                      </span>
                      <span className="text-muted-foreground leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to={`/order?plan=${plan.id}`}
                  className={`mt-8 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isPopular
                      ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-md'
                      : 'border border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  {t('landing.pricing.cta')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enterprise card — horizontal, full width */}
        {enterprise && (
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.2, 0, 0, 1] as const }}
            className="mt-6 relative overflow-hidden p-6 rounded-2xl bg-secondary/30 border border-border/60 border-l-[3px] border-l-primary"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left — name + description + inline features */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground">
                  {enterprise.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
                  {t('landing.pricing.subtitle')}
                </p>
                {/* Compact feature badges */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {enterprise.features.map((feat) => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-border/60 text-xs text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-secondary))]" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — custom price + CTA */}
              <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-6 md:pl-8 md:border-l md:border-border/60 shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-foreground">
                    {enterprise.price}
                  </span>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                >
                  {t('landing.pricing.contact')}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
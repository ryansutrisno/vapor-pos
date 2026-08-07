import { motion, useReducedMotion } from 'framer-motion';
import { Plus, Minus, LifeBuoy } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FaqSection() {
  const { t, language } = useTranslation();
  const reduceMotion = useReducedMotion();

  const items = translations[language].landing.faq.items;

  const container = {
    initial: {},
    whileInView: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
  };
  const item = {
    initial: reduceMotion ? {} : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: reduceMotion ? 0 : 0.45, ease: [0.2, 0, 0, 1] as const },
  };

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.2, 0, 0, 1] as const }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('landing.faq.title')}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            {t('landing.faq.subtitle')}
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={container}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12"
        >
          <Accordion type="single" collapsible defaultValue="item-0">
            {items.map((entry, i) => (
              <motion.div key={i} variants={item}>
                <AccordionItem
                  value={`item-${i}`}
                  className="border-b border-border/60 border-l-[3px] border-l-transparent data-[state=open]:border-l-primary data-[state=open]:bg-secondary/30 rounded-r-lg transition-colors duration-200"
                >
                  <AccordionTrigger className="group px-4 -mx-4 py-5 rounded-lg text-left text-base font-semibold text-foreground hover:no-underline hover:bg-secondary/50 [&>svg:last-child]:hidden transition-colors duration-200">
                    <span className="flex-1 pr-4">{entry.q}</span>
                    {/* Plus / Minus indicator */}
                    <span className="grid place-items-center w-7 h-7 shrink-0 rounded-full border border-border/60 bg-card text-primary transition-colors duration-200">
                      <Plus className="w-4 h-4 block group-data-[state=open]:hidden" />
                      <Minus className="w-4 h-4 hidden group-data-[state=open]:block" />
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 -mx-4 text-sm leading-relaxed text-muted-foreground">
                    {entry.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Support link */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.2, 0, 0, 1] as const }}
          className="mt-8 pt-6 border-t border-border text-center"
        >
          <p className="text-muted-foreground inline-flex flex-wrap items-center justify-center gap-2">
            <LifeBuoy className="w-4 h-4 text-primary" />
            {t('landing.faq.support_text')}
            <a
              href="#"
              className="text-primary font-medium underline underline-offset-4 hover:text-primary-dark transition-colors"
            >
              {t('landing.faq.support_link')}
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
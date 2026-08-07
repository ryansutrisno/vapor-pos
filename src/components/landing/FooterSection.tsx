import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Zap } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

const SOCIALS = [
  { Icon: Instagram, label: 'Instagram', href: '#' },
  { Icon: Twitter, label: 'Twitter', href: '#' },
  { Icon: Youtube, label: 'YouTube', href: '#' },
] as const;

export default function FooterSection() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const productLinks = [
    { label: t('footer.product_links.features'), href: '#features' },
    { label: t('footer.product_links.pricing'), href: '#pricing' },
    { label: t('footer.product_links.showcase'), href: '#showcase' },
    { label: t('footer.product_links.faq'), href: '#faq' },
  ];

  const supportLinks = [
    { label: t('footer.support_links.help'), href: '#' },
    { label: t('footer.support_links.contact'), href: '#' },
    { label: t('footer.support_links.docs'), href: '#' },
  ];

  const companyLinks = [
    { label: t('footer.company_links.about'), href: '#' },
    { label: t('footer.company_links.blog'), href: '#' },
    { label: t('footer.company_links.privacy'), href: '#' },
    { label: t('footer.company_links.terms'), href: '#' },
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand column - full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <span className="grid place-items-center w-8 h-8 rounded-xl bg-primary text-primary-foreground">
                <Zap className="w-4 h-4" fill="currentColor" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                VaporPOS
              </span>
            </Link>
            <p className="mt-4 text-sm text-background/60 max-w-xs">
              {t('footer.brand_desc')}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid place-items-center w-9 h-9 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <nav aria-label={t('footer.product')} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-background/80">
              {t('footer.product')}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label={t('footer.support')} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-background/80">
              {t('footer.support')}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label={t('footer.company')} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-background/80">
              {t('footer.company')}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-background/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-background/60">
            {t('footer.copyright').replace('{year}', String(year))}
          </p>
          <p className="text-xs text-background/40">
            Made with care in Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
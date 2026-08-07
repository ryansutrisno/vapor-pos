import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/contexts/LanguageContext';

const NAV_LINKS = [
  { key: 'nav.features', href: '#features' },
  { key: 'nav.pricing', href: '#pricing' },
  { key: 'nav.testimonials', href: '#testimonials' },
  { key: 'nav.faq', href: '#faq' },
] as const;

export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleNavClick = () => setMobileOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-md ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="VaporPOS home">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 ease-md group-hover:scale-110">
            <Zap className="w-4 h-4" fill="currentColor" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-primary">
            VaporPOS
          </span>
        </Link>

        {/* Center nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {t(link.key)}
              </a>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <Link
            to="/register"
            className="hidden sm:inline-flex items-center justify-center h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-95 transition-all duration-300 ease-md"
          >
            {t('nav.cta')}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden grid place-items-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 top-16 bg-black/40 backdrop-blur-sm"
              onClick={handleNavClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            />
            <motion.aside
              className="md:hidden fixed top-16 right-0 bottom-0 w-[80%] max-w-sm bg-background border-l border-border shadow-2xl z-50"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                duration: reduceMotion ? 0 : 0.3,
                ease: [0.2, 0, 0, 1],
              }}
            >
              <div className="flex flex-col h-full p-6">
                <ul className="flex flex-col gap-2">
                  {NAV_LINKS.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: reduceMotion ? 0 : 0.08 * i + 0.05,
                        duration: reduceMotion ? 0 : 0.25,
                      }}
                    >
                      <a
                        href={link.href}
                        onClick={handleNavClick}
                        className="block px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-primary/10 transition-colors"
                      >
                        {t(link.key)}
                      </a>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>

                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="mt-auto inline-flex items-center justify-center h-12 px-6 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-300 ease-md"
                >
                  {t('nav.cta')}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
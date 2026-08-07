/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Semantic aliases retain dark-mode support for existing components.
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Direct design-system tokens for landing-page components.
        "color-primary": "hsl(var(--color-primary))",
        "color-primary-light": "hsl(var(--color-primary-light))",
        "color-primary-dark": "hsl(var(--color-primary-dark))",
        "color-secondary": "hsl(var(--color-secondary))",
        "color-secondary-light": "hsl(var(--color-secondary-light))",
        "color-accent": "hsl(var(--color-accent))",
        "color-accent-light": "hsl(var(--color-accent-light))",
        "color-bg": "hsl(var(--color-bg))",
        "color-bg-alt": "hsl(var(--color-bg-alt))",
        "color-surface": "hsl(var(--color-surface))",
        "color-surface-alt": "hsl(var(--color-surface-alt))",
        "color-text": "hsl(var(--color-text))",
        "color-text-muted": "hsl(var(--color-text-muted))",
        "color-text-light": "hsl(var(--color-text-light))",
        "color-border": "hsl(var(--color-border))",
        "color-border-light": "hsl(var(--color-border-light))",
        surface: {
          DEFAULT: "hsl(var(--color-surface))",
          alt: "hsl(var(--color-surface-alt))",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "md-1": "0 1px 2px 0 rgba(0,0,0,0.05)",
        "md-2": "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
        "md-3": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
        "md-4": "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
      },
      transitionTimingFunction: {
        "md": "cubic-bezier(0.2, 0, 0, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}

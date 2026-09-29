const { fontFamily } = require("tailwindcss/defaultTheme");

const token = (name) => `hsl(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      sans: ["Archivo", ...fontFamily.sans],
      mono: ["'Chivo Mono'", ...fontFamily.mono],
    },
    extend: {
      colors: {
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        background: token("background"),
        foreground: token("foreground"),
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
        },
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        steel: {
          950: token("steel-950"),
          900: token("steel-900"),
          850: token("steel-850"),
          800: token("steel-800"),
          700: token("steel-700"),
          500: token("steel-500"),
          300: token("steel-300"),
        },
        paper: {
          DEFAULT: token("paper"),
          deep: token("paper-deep"),
          line: token("paper-line"),
        },
        ink: {
          DEFAULT: token("ink"),
          soft: token("ink-soft"),
        },
        signal: {
          DEFAULT: token("signal"),
          deep: token("signal-deep"),
          ink: token("signal-ink"),
        },
        pass: {
          DEFAULT: token("pass"),
          ink: token("pass-ink"),
        },
        alert: {
          DEFAULT: token("alert"),
          ink: token("alert-ink"),
        },
        amber: token("amber"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        numeral: ["2.75rem", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      gridTemplateColumns: {
        card: "repeat(auto-fill,minmax(18.75rem,1fr))",
        table: "repeat(auto-fill,minmax(10rem,1fr))",
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
        lamp: "lamp 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

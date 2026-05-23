import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem", xl: "2.5rem" },
      screens: { "2xl": "1320px" }
    },
    extend: {
      colors: {
        ink: {
          50: "#f8f9fb",
          100: "#eef0f4",
          200: "#dee2ea",
          300: "#bcc3d1",
          400: "#8a94a7",
          500: "#5b6478",
          600: "#3d4557",
          700: "#272d3c",
          800: "#171b27",
          900: "#0b0e16",
          950: "#06070d"
        },
        sand: {
          50: "#faf8f3",
          100: "#f3eee2",
          200: "#e6dcc4",
          300: "#d2c19a",
          400: "#b89e6c",
          500: "#9a7f4b"
        },
        accent: {
          50: "#eef2ff",
          100: "#dfe6ff",
          200: "#bccaff",
          300: "#8da5ff",
          400: "#5b7af0",
          500: "#3854d1",
          600: "#2a3fa9",
          700: "#22338a",
          800: "#1c2a72",
          900: "#16225a"
        },
        emerald: {
          50: "#ecfdf4",
          100: "#d2f9e0",
          500: "#1f8a6d",
          600: "#196f57",
          700: "#15584a"
        },
        amber: {
          50: "#fff8eb",
          100: "#feefce",
          500: "#c08a25",
          700: "#92691a"
        },
        rose: {
          50: "#fef2f4",
          100: "#fde2e7",
          500: "#c63b50",
          700: "#922a3b"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"]
      },
      fontSize: {
        "display-2xl": ["clamp(2.75rem, 5.5vw, 4.75rem)", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
        "display-xl":  ["clamp(2.25rem, 4.5vw, 3.75rem)", { lineHeight: "1.06", letterSpacing: "-0.03em" }],
        "display-lg":  ["clamp(1.875rem, 3.5vw, 2.75rem)", { lineHeight: "1.1",  letterSpacing: "-0.025em" }]
      },
      boxShadow: {
        elev1: "0 1px 1px rgba(23,27,39,.04), 0 1px 2px rgba(23,27,39,.05)",
        elev2: "0 1px 2px rgba(23,27,39,.04), 0 8px 22px -10px rgba(23,27,39,.10)",
        elev3: "0 1px 2px rgba(23,27,39,.04), 0 24px 60px -22px rgba(23,27,39,.18), 0 8px 18px -10px rgba(23,27,39,.08)",
        rim: "inset 0 0 0 1px rgba(23,27,39,.06)",
        glow: "0 0 0 6px rgba(56,84,209,.08)"
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(11,14,22,.04) 1px, transparent 1px), linear-gradient(to right, rgba(11,14,22,.04) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(900px 500px at 50% 0%, rgba(56,84,209,.06), transparent 60%)"
      },
      animation: {
        "fade-up": "fadeUp .8s cubic-bezier(.2,.7,.2,1) both",
        "shimmer": "shimmer 2.4s linear infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "dash-flow": "dashFlow 4s linear infinite"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" }
        },
        dashFlow: {
          to: { strokeDashoffset: "-100" }
        }
      }
    }
  },
  plugins: []
};

export default config;

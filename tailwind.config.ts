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
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#dadfe8",
          300: "#b9c1d0",
          400: "#8a94a7",
          500: "#5b6478",
          600: "#3d4557",
          700: "#272d3c",
          800: "#171b27",
          900: "#0b0e16"
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
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#b8ccff",
          300: "#8aa9ff",
          400: "#5b82f5",
          500: "#3a5fd9",
          600: "#2b48b3",
          700: "#22398f",
          800: "#1c2f72",
          900: "#152559"
        },
        emerald: {
          500: "#1f8a6d",
          600: "#196f57"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"]
      },
      fontSize: {
        "display-2xl": ["clamp(3.5rem, 6vw, 5.5rem)", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
        "display-xl": ["clamp(2.75rem, 5vw, 4.25rem)", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2.25rem, 4vw, 3.25rem)", { lineHeight: "1.08", letterSpacing: "-0.03em" }]
      },
      boxShadow: {
        // Ink-tinted shadows — slightly warmer than pure black so they sit
        // inside the sand/paper palette instead of fighting it.
        elev1: "0 1px 1px rgba(23,27,39,.04), 0 1px 2px rgba(23,27,39,.05)",
        elev2: "0 1px 2px rgba(23,27,39,.04), 0 8px 22px -10px rgba(23,27,39,.10)",
        elev3:
          "0 1px 2px rgba(23,27,39,.04), 0 24px 60px -22px rgba(23,27,39,.18), 0 8px 18px -10px rgba(23,27,39,.08)",
        rim: "inset 0 0 0 1px rgba(23,27,39,.06)",
        inkInset: "inset 0 -1px 0 rgba(23,27,39,.06)"
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(11,14,22,.04) 1px, transparent 1px), linear-gradient(to right, rgba(11,14,22,.04) 1px, transparent 1px)"
      },
      animation: {
        "fade-up": "fadeUp .8s cubic-bezier(.2,.7,.2,1) both",
        "shimmer": "shimmer 2.4s linear infinite"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" }
        }
      }
    }
  },
  plugins: []
};

export default config;

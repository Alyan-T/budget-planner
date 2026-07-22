import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        "on-background": "var(--on-background)",
        
        surface: "var(--surface)",
        "surface-dim": "var(--surface-dim)",
        "surface-bright": "var(--surface-bright)",
        
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        
        primary: "var(--primary)",
        "on-primary": "var(--on-primary)",
        
        success: "var(--success)",
        "success-bg": "var(--success-bg)",
        "on-success": "var(--on-success)",
        
        error: "var(--error)",
        "error-bg": "var(--error-bg)",
        "on-error": "var(--on-error)",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "3rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;

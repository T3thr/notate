import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        container: "var(--container)",
        divider: "var(--divider)",
        muted: "var(--muted)",
        shadowLight: "var(--shadow-light)",
        primary: "var(--primary)",
        primaryForeground: "var(--primary-foreground)",
        secondary: "var(--secondary)",
        secondaryForeground: "var(--secondary-foreground)",
        destructive: "var(--destructive)",
        destructiveForeground: "var(--destructive-foreground)",
        accent: "var(--accent)",
        accentForeground: "var(--accent-foreground)",
        popover: "var(--popover)",
        popoverForeground: "var(--popover-foreground)",
        card: "var(--card)",
        cardForeground: "var(--card-foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;

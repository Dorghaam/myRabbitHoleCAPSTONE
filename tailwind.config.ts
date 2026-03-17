import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // background colors
        "canvas-bg": "#F8FAFC",
        "sidebar-bg": "#FFFFFF",
        "modal-bg": "#FFFFFF",

        // border colors
        "node-border": "#E2E8F0",
        "node-border-selected": "#EC4899",
        divider: "#E2E8F0",

        // accent colors
        "primary-pink": "#EC4899",
        "primary-pink-hover": "#DB2777",

        // text colors
        "text-primary": "#1A1A2E",
        "text-secondary": "#475569",
        "text-muted": "#64748B",
        "text-light": "#94A3B8",

        // node background colors
        "node-default": "#FFFFFF",
        "node-cream": "#FEF9E7",
        "node-pink": "#FDEEF4",
        "node-lavender": "#EDE9FE",
        "node-purple": "#F3E8FF",
        "node-blue": "#DBEAFE",
        "node-cyan": "#CFFAFE",
        "node-mint": "#D1FAE5",
        "node-yellow": "#FEF3C7",
        "node-orange": "#FFEDD5",
        "node-light-pink": "#FFF1F2",
        "node-light-blue": "#F0F9FF",
      },
    },
  },
  plugins: [],
};
export default config;

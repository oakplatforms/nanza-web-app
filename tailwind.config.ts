import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primaryText: '#1F2937',
        secondaryText: '#374151',
      },
      fontSize: {
        h2: '1.5rem',
        h3: '1.25rem',
      },
      margin: {
        mb4: '1rem',
        mb3: '0.75rem',
      },
      typography: {
        h2: {
          fontSize: '1.5rem', // text-2xl
          fontWeight: '700', // font-bold
          color: '#1F2937', // text-gray-800
          marginBottom: '1rem', // mb-4
        },
        h3: {
          fontSize: '1.25rem', // text-xl
          fontWeight: '600', // font-semibold
          color: '#374151', // text-gray-700
          marginBottom: '0.75rem', // mb-3
        },
      },
    },
  },
  plugins: [],
};
export default config;

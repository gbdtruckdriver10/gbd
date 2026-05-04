import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}",
            "./components/**/*.{js,ts,jsx,tsx,mdx}",
            "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gbd: {
          blue: "#2888B8",
          deep: "#1078A8",
          navy: "#002040",
          cream: "#F8F0E0",
          orange: "#E8A018",
          orange2: "#E08028",
          redorange: "#E05830",
          green: "#489858",
          lime: "#98B050",
        },
      },
    },
  },
  plugins: [],
};

export default config;
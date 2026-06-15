import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          mantine: ["@mantine/core", "@mantine/hooks", "@tabler/icons-react"],
          recharts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
          router: ["react-router-dom"],
        },
      },
    },
  },
});

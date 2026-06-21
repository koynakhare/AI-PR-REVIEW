import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": {
        // Use IPv4 loopback to avoid localhost -> ::1 (IPv6) resolution issues on Windows.
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createCompleteServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./","./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(viteServer) {
      // Only start the Express server in development mode
      if (process.env.NODE_ENV !== 'production') {
        console.log('🎮 Starting Uncoverles Game Server with Socket.IO...');

        // Create complete server with Socket.IO
        const { app, io, gameManager } = createCompleteServer();

        // Attach Socket.IO to Vite's HTTP server
        io.attach(viteServer.httpServer!, {
          cors: {
            origin: true,
            credentials: true,
          },
          transports: ['polling', 'websocket'],
          allowEIO3: true,
          pingTimeout: 60000,
          pingInterval: 25000,
          upgradeTimeout: 30000,
          maxHttpBufferSize: 1e6,
        });

        console.log('🔌 Socket.IO server attached to Vite dev server');

        // Add Express app as middleware to Vite dev server
        viteServer.middlewares.use(app);
      }
    },
  };
}

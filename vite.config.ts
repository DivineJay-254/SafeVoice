import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
      },
      plugins: [
        {
          name: 'suppress-hmr-client-error',
          transformIndexHtml: {
            order: 'pre',
            handler() {
              return [
                {
                  tag: 'script',
                  attrs: { type: 'text/javascript' },
                  injectTo: 'head-prepend',
                  children: `
(function() {
  const origError = console.error;
  console.error = function(...args) {
    if (args.length > 0 && typeof args[0] === 'string' && (args[0].includes('WebSocket closed without opened') || args[0].includes('[vite] WebSocket'))) {
      return;
    }
    return origError.apply(console, args);
  };

  window.addEventListener('error', function(e) {
    if (e && ((e.message && e.message.includes('WebSocket')) || (e.filename && e.filename.includes('@vite/client')))) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', function(e) {
    if (e && e.reason && String(e.reason).includes('WebSocket')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return true;
    }
  }, true);

  if (typeof window !== 'undefined' && window.WebSocket) {
    const OrigWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
      const isViteHmr = (protocols && (protocols === 'vite-hmr' || (Array.isArray(protocols) && protocols.includes('vite-hmr')))) ||
                        (typeof url === 'string' && (url.includes('/@vite/') || url.includes('token=')));
      const ws = new OrigWebSocket(url, protocols);
      if (isViteHmr) {
        const origAddEventListener = ws.addEventListener;
        ws.addEventListener = function(type, listener, options) {
          if (type === 'close') {
            const wrappedListener = function(event) {
              try {
                Object.defineProperty(event, 'wasClean', { value: true, configurable: true });
              } catch (_) {}
              try {
                return listener.call(this, event);
              } catch (_) {}
            };
            return origAddEventListener.call(this, type, wrappedListener, options);
          }
          if (type === 'error') {
            const wrappedErrorListener = function(event) {
              try {
                event.preventDefault?.();
                event.stopImmediatePropagation?.();
              } catch (_) {}
            };
            return origAddEventListener.call(this, type, wrappedErrorListener, options);
          }
          return origAddEventListener.call(this, type, listener, options);
        };
      }
      return ws;
    };
    window.WebSocket.prototype = OrigWebSocket.prototype;
  }
})();
`,
                },
              ];
            },
          },
        },
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
          manifest: {
            id: '/',
            name: 'Juasafety Yako',
            short_name: 'Juasafety',
            description: 'Confidential GBV reporting, safety planning, and emergency helpline directory.',
            theme_color: '#db2777',
            background_color: '#ffffff',
            display: 'standalone',
            start_url: '/',
            scope: '/',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
              },
              {
                src: '/pwa-maskable-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'tailwind-cdn-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                  },
                },
              },
              {
                urlPattern: /^https:\/\/aistudiocdn\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'cdn-modules-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                },
              },
              {
                urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'unsplash-images-cache',
                  expiration: {
                    maxEntries: 30,
                    maxAgeSeconds: 60 * 60 * 24 * 30,
                  },
                },
              },
            ],
          },
          devOptions: {
            enabled: true,
            type: 'module',
          },
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ""),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || "")
      },
      resolve: {
        alias: {
          '@': path.resolve(process.cwd(), '.'),
        }
      }
    };
});

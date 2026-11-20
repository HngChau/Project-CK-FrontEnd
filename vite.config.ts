import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rssProxy = {
    '/rss': { target: 'https://dantri.com.vn', changeOrigin: true },
};

export default defineConfig({
    plugins: [react()],
    server: { proxy: rssProxy },
    preview: { proxy: rssProxy },
});
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [
        sveltekit(),
    ],
    resolve: {
        alias: {
            $routes: resolve('src/routes/'),
            $ui: resolve('src/lib/Ui'),
            $locales: resolve('src/locales'),
        }
    },
};

export default config;
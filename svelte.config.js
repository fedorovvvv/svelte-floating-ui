import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: [
        preprocess({
            typescript: {
                tsconfigDirectory: './tsconfig.json'
            }
        })
    ]
};

export default config;

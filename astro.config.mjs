import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://shotuu.github.io',
  base: '/portfolio',
  output: 'static',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});

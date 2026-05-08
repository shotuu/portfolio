import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://danielwu.tech',
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

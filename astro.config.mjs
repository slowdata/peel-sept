import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://peel.sept.pt',
  output: 'static',
  i18n: {
    locales: ['en', 'pt'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
});

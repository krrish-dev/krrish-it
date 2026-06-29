import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { LocalizedHome } from '../components/localized-home/localized-home';

export default component$(() => <LocalizedHome locale="it" variant="compact" />);

export const head: DocumentHead = {
  title: 'Kerols Badr | Sviluppatore Web Full Stack & Server Admin',
  meta: [
    {
      name: 'description',
      content:
        'Krrish IT Service offre sviluppo web, dashboard, API, Laravel, Node.js, gestione server Linux, Nginx, SSL e deployment sicuro da remoto.',
    },
    {
      name: 'keywords',
      content:
        'Kerols Badr, Krrish IT, sviluppatore web full stack, server admin, Node.js, Laravel, Linux, Nginx, DevOps, DigitalOcean, Netlify',
    },
    {
      property: 'og:title',
      content: 'Kerols Badr | Sviluppatore Web Full Stack & Server Admin',
    },
    {
      property: 'og:description',
      content:
        'Sviluppo siti web, dashboard, API e deployment sicuri con Laravel, Node.js, Linux, Nginx e DevOps.',
    },
  ],
};

import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { LocalizedHome } from '../components/localized-home/localized-home';

export default component$(() => <LocalizedHome locale="it" variant="compact" />);

export const head: DocumentHead = {
  title: 'Krrish IT Service | Kerols Badr - Sviluppatore Web Full Stack',
  meta: [
    {
      name: 'description',
      content:
        'Kerols Badr realizza siti web, applicazioni moderne, dashboard e soluzioni server sicure per aziende e professionisti.',
    },
    {
      name: 'keywords',
      content:
        'Kerols Badr, Krrish IT, sviluppatore web, software engineer, full-stack developer, Node.js, PHP Laravel, server Linux, DevOps, siti web professionali',
    },
    {
      property: 'og:title',
      content: 'Krrish IT Service | Kerols Badr',
    },
    {
      property: 'og:description',
      content: 'Siti web, applicazioni moderne e soluzioni server sicure per aziende e professionisti.',
    },
  ],
};

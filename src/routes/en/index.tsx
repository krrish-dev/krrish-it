import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { LocalizedHome } from '../../components/localized-home/localized-home';

export default component$(() => <LocalizedHome locale="en" variant="full" />);

export const head: DocumentHead = {
  title: 'Krrish IT Service | Kerols Badr - Software Engineer & Server Admin',
  meta: [
    {
      name: 'description',
      content:
        'Kerols Badr is a software engineer and server admin delivering full-stack web development, Node.js, PHP Laravel, MongoDB, MySQL, Linux server administration, DevOps, and secure deployment services.',
    },
    {
      name: 'keywords',
      content:
        'Kerols Badr, Krrish IT, Software Engineer, Full-Stack Developer, Node.js, PHP, Laravel, Linux, DevOps, Server Admin, Web Development Egypt',
    },
    {
      property: 'og:title',
      content: 'Krrish IT Service | Kerols Badr',
    },
    {
      property: 'og:description',
      content: 'Software Engineer & Server Admin - Building end-to-end web solutions.',
    },
  ],
};

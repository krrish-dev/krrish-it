import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { LocalizedHome } from '../../components/localized-home/localized-home';

export default component$(() => <LocalizedHome locale="en" variant="full" />);

export const head: DocumentHead = {
  title: 'Kerols Badr | Full-Stack Developer & Server Admin',
  meta: [
    {
      name: 'description',
      content:
        'Full-stack web developer and server admin building websites, dashboards, APIs, Laravel and Node.js apps, MongoDB/MySQL integrations, and secure production deployments.',
    },
    {
      name: 'keywords',
      content:
        'Kerols Badr, Krrish IT, Full-Stack Developer, Software Engineer, Server Admin, Node.js, Laravel, MongoDB, MySQL, Linux, DevOps, Web Development Egypt',
    },
    {
      property: 'og:title',
      content: 'Kerols Badr | Full-Stack Developer & Server Admin',
    },
    {
      property: 'og:description',
      content:
        'Websites, dashboards, APIs, Laravel/Node.js apps, server management, and secure production deployment services.',
    },
  ],
};

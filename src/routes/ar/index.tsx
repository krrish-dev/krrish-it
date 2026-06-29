import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { LocalizedHome } from '../../components/localized-home/localized-home';

export default component$(() => <LocalizedHome locale="ar" variant="full" />);

export const head: DocumentHead = {
  title: 'كيرلس بدر | Krrish IT Service - مهندس برمجيات ومدير سيرفرات',
  meta: [
    {
      name: 'description',
      content:
        'كيرلس بدر مهندس برمجيات ومدير سيرفرات يقدم تطوير مواقع وتطبيقات ويب متكاملة باستخدام Node.js و PHP Laravel وقواعد البيانات وإدارة وتأمين السيرفرات.',
    },
    {
      name: 'keywords',
      content:
        'كيرلس بدر, Krrish IT, مطور ويب, مهندس برمجيات, تطوير مواقع, Node.js, PHP, Laravel, إدارة سيرفرات, لينكس, DevOps',
    },
    {
      property: 'og:title',
      content: 'كيرلس بدر | Krrish IT Service',
    },
    {
      property: 'og:description',
      content: 'مهندس برمجيات ومدير سيرفرات لبناء حلول ويب متكاملة.',
    },
  ],
};

import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { LocalizedHome } from '../../components/localized-home/localized-home';

export default component$(() => <LocalizedHome locale="ar" variant="full" />);

export const head: DocumentHead = {
  title: 'كيرلس بدر | مطور Full-Stack ومدير سيرفرات',
  meta: [
    {
      name: 'description',
      content:
        'خدمات تطوير مواقع وتطبيقات ويب، لوحات تحكم، APIs، Laravel، Node.js، MongoDB، MySQL، إدارة سيرفرات Linux، Nginx، SSL والنشر الآمن.',
    },
    {
      name: 'keywords',
      content:
        'كيرلس بدر, Krrish IT, مطور Full-Stack, مهندس برمجيات, مدير سيرفرات, تطوير مواقع, Laravel, Node.js, MongoDB, MySQL, Linux, DevOps',
    },
    {
      property: 'og:title',
      content: 'كيرلس بدر | مطور Full-Stack ومدير سيرفرات',
    },
    {
      property: 'og:description',
      content:
        'تطوير مواقع وتطبيقات ويب ولوحات تحكم و APIs مع إدارة وتأمين السيرفرات والنشر الإنتاجي الآمن.',
    },
  ],
};

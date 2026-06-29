import { $, component$, Slot, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { useLocation } from '@builder.io/qwik-city';

type Locale = 'it' | 'en' | 'ar';
type ThemeMode = 'dark' | 'light';

const navCopy = {
  it: {
    about: 'Chi sono',
    services: 'Servizi',
    skills: 'Stack',
    contact: 'Contatto',
    rights: 'Tutti i diritti riservati',
    built: 'Creato con Qwik & MongoDB',
    credibility:
      "La mia lingua madre è l'arabo; posso comunicare in inglese e italiano con supporto di traduzione per mantenere chiarezza e precisione.",
  },
  en: {
    about: 'About',
    services: 'Services',
    skills: 'Skills',
    contact: 'Contact',
    rights: 'All rights reserved',
    built: 'Built with Qwik & MongoDB',
    credibility:
      'My native language is Arabic; English and Italian communication is supported with translation tools to keep the discussion clear and accurate.',
  },
  ar: {
    about: 'حول',
    services: 'الخدمات',
    skills: 'المهارات',
    contact: 'اتصل بي',
    rights: 'جميع الحقوق محفوظة',
    built: 'بُني باستخدام Qwik و MongoDB',
    credibility:
      'لغتي الأصلية العربية، ويمكنني التواصل بالإنجليزية والإيطالية بمساعدة أدوات ترجمة لضمان الوضوح والدقة.',
  },
} as const;

const languageLinks = [
  { locale: 'it', href: '/', label: 'Italiano' },
  { locale: 'en', href: '/en/', label: 'English' },
  { locale: 'ar', href: '/ar/', label: 'العربية' },
] as const;

export const onGet: RequestHandler = async ({ cacheControl, headers }) => {
  cacheControl({
    maxAge: 0,
    sMaxAge: 0,
    staleWhileRevalidate: 0,
  });
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
};

export default component$(() => {
  const theme = useSignal<ThemeMode>('dark');
  const mobileMenuOpen = useSignal(false);
  const location = useLocation();
  const isAdmin = location.url.pathname.startsWith('/admin');

  const getLocale = (): Locale => {
    if (location.url.pathname.startsWith('/ar')) return 'ar';
    if (location.url.pathname.startsWith('/en')) return 'en';
    return 'it';
  };

  const getBasePath = (locale: Locale) => {
    if (locale === 'ar') return '/ar/';
    if (locale === 'en') return '/en/';
    return '/';
  };

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    if (savedTheme) theme.value = savedTheme;
  });

  const toggleTheme = $(() => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme.value);
  });

  if (isAdmin) {
    return <Slot />;
  }

  const locale = getLocale();
  const labels = navCopy[locale];
  const basePath = getBasePath(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      class={`min-h-screen transition-colors duration-300 ${theme.value === 'dark' ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900'}`}
      dir={dir}
      lang={locale === 'it' ? 'it' : locale}
    >
      <nav class={`flex items-center justify-between px-6 lg:px-12 py-5 border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 ${theme.value === 'dark' ? 'border-slate-800 bg-[#0f172a]/80' : 'border-slate-200 bg-white/80'}`}>
        <a href="/" class="flex items-center gap-2" aria-label="Krrish IT Service">
          <span class="text-2xl font-bold">
            <span class="text-[#e63946]">K</span>
            <span class={theme.value === 'dark' ? 'text-white' : 'text-slate-900'}>rrish</span>
            <span class="text-[#1d4ed8]">.it</span>
          </span>
        </a>

        <div class={`hidden md:flex items-center gap-8 text-sm font-medium ${theme.value === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          <a href={`${basePath}#about`} class="hover:text-[#06b6d4] transition-colors">
            {labels.about}
          </a>
          <a href={`${basePath}#services`} class="hover:text-[#06b6d4] transition-colors">
            {labels.services}
          </a>
          <a href={`${basePath}#skills`} class="hover:text-[#06b6d4] transition-colors">
            {labels.skills}
          </a>
          <a href={`${basePath}#contact`} class="hover:text-[#06b6d4] transition-colors">
            {labels.contact}
          </a>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-1 rounded-xl border border-slate-700/70 p-1">
            {languageLinks.map((item) => (
              <a
                key={item.locale}
                href={item.href}
                class={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${item.locale === locale ? 'bg-cyan-500/15 text-cyan-300' : theme.value === 'dark' ? 'text-slate-300 hover:text-cyan-300' : 'text-slate-700 hover:text-cyan-600'}`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <button
            onClick$={toggleTheme}
            class={`p-2 rounded-lg border transition-all ${theme.value === 'dark' ? 'border-slate-700 hover:border-cyan-500 text-yellow-400' : 'border-slate-300 hover:border-cyan-500 text-slate-700'}`}
            aria-label="Toggle theme"
          >
            {theme.value === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button
            onClick$={() => (mobileMenuOpen.value = !mobileMenuOpen.value)}
            class="md:hidden p-2 rounded-lg"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={mobileMenuOpen.value ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </nav>

      {mobileMenuOpen.value && (
        <div class={`md:hidden fixed inset-0 top-[73px] z-40 p-6 ${theme.value === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`}>
          <div class="flex flex-col gap-6 text-lg font-medium">
            <a href={`${basePath}#about`} onClick$={() => (mobileMenuOpen.value = false)} class="hover:text-[#06b6d4] transition-colors">
              {labels.about}
            </a>
            <a href={`${basePath}#services`} onClick$={() => (mobileMenuOpen.value = false)} class="hover:text-[#06b6d4] transition-colors">
              {labels.services}
            </a>
            <a href={`${basePath}#skills`} onClick$={() => (mobileMenuOpen.value = false)} class="hover:text-[#06b6d4] transition-colors">
              {labels.skills}
            </a>
            <a href={`${basePath}#contact`} onClick$={() => (mobileMenuOpen.value = false)} class="hover:text-[#06b6d4] transition-colors">
              {labels.contact}
            </a>
            <div class="h-px bg-slate-700/50"></div>
            {languageLinks.map((item) => (
              <a
                key={item.locale}
                href={item.href}
                onClick$={() => (mobileMenuOpen.value = false)}
                class={`rounded-xl px-4 py-3 text-base font-bold ${item.locale === locale ? 'bg-cyan-500/15 text-cyan-300' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <main>
        <Slot />
      </main>

      <footer class={`px-6 lg:px-12 py-10 border-t text-center text-sm transition-colors duration-300 ${theme.value === 'dark' ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
        <p>© 2026 Krrish IT Service - {labels.rights}</p>
        <p class="mt-2">{labels.built}</p>
        <p class="mx-auto mt-3 max-w-3xl leading-relaxed">{labels.credibility}</p>
      </footer>
    </div>
  );
});

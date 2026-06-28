import { component$, $, Slot, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { RequestHandler } from '@builder.io/qwik-city';
import { useLocation } from '@builder.io/qwik-city';

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
  const theme = useSignal<'dark' | 'light'>('dark');
  const locale = useSignal<'ar' | 'en'>('en');
  const mobileMenuOpen = useSignal(false);
  const location = useLocation();
  const isAdmin = location.url.pathname.startsWith('/admin');

  useVisibleTask$(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    const savedLocale = localStorage.getItem('locale') as 'ar' | 'en';
    if (savedTheme) theme.value = savedTheme;
    if (savedLocale) locale.value = savedLocale;
  });

  const toggleTheme = $(() => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme.value);
  });

  const toggleLocale = $(() => {
    locale.value = locale.value === 'ar' ? 'en' : 'ar';
    localStorage.setItem('locale', locale.value);
  });

  if (isAdmin) {
    return <Slot />;
  }

  return (
    <div
      class={`min-h-screen transition-colors duration-300 ${theme.value === 'dark' ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900'}`}
      dir={locale.value === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Navigation */}
      <nav class={`flex items-center justify-between px-6 lg:px-12 py-5 border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 ${theme.value === 'dark' ? 'border-slate-800 bg-[#0f172a]/80' : 'border-slate-200 bg-white/80'}`}>
        {/* Logo */}
        <a href="/" class="flex items-center gap-2">
          <span class="text-2xl font-bold">
            <span class="text-[#e63946]">K</span>
            <span class={theme.value === 'dark' ? 'text-white' : 'text-slate-900'}>rrish</span>
            <span class="text-[#1d4ed8]">.it</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <div class={`hidden md:flex items-center gap-8 text-sm font-medium ${theme.value === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          <a href="#about" class="hover:text-[#06b6d4] transition-colors">
            {locale.value === 'ar' ? 'حول' : 'About'}
          </a>
          <a href="#services" class="hover:text-[#06b6d4] transition-colors">
            {locale.value === 'ar' ? 'الخدمات' : 'Services'}
          </a>
          <a href="#skills" class="hover:text-[#06b6d4] transition-colors">
            {locale.value === 'ar' ? 'المهارات' : 'Skills'}
          </a>
          <a href="#contact" class="hover:text-[#06b6d4] transition-colors">
            {locale.value === 'ar' ? 'اتصل بي' : 'Contact'}
          </a>
        </div>

        {/* Controls */}
        <div class="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick$={toggleLocale}
            class={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${theme.value === 'dark' ? 'border-slate-700 hover:border-cyan-500 text-slate-300' : 'border-slate-300 hover:border-cyan-500 text-slate-700'}`}
          >
            {locale.value === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Theme Toggle */}
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

          {/* Mobile Menu Button */}
          <button
            onClick$={() => mobileMenuOpen.value = !mobileMenuOpen.value}
            class="md:hidden p-2 rounded-lg"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={mobileMenuOpen.value ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen.value && (
        <div class={`md:hidden fixed inset-0 top-[73px] z-40 p-6 ${theme.value === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`}>
          <div class="flex flex-col gap-6 text-lg font-medium">
            <a href="#about" onClick$={() => mobileMenuOpen.value = false} class="hover:text-[#06b6d4] transition-colors">
              {locale.value === 'ar' ? 'حول' : 'About'}
            </a>
            <a href="#services" onClick$={() => mobileMenuOpen.value = false} class="hover:text-[#06b6d4] transition-colors">
              {locale.value === 'ar' ? 'الخدمات' : 'Services'}
            </a>
            <a href="#skills" onClick$={() => mobileMenuOpen.value = false} class="hover:text-[#06b6d4] transition-colors">
              {locale.value === 'ar' ? 'المهارات' : 'Skills'}
            </a>
            <a href="#contact" onClick$={() => mobileMenuOpen.value = false} class="hover:text-[#06b6d4] transition-colors">
              {locale.value === 'ar' ? 'اتصل بي' : 'Contact'}
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        <Slot />
      </main>

      {/* Footer */}
      <footer class={`px-6 lg:px-12 py-10 border-t text-center text-sm transition-colors duration-300 ${theme.value === 'dark' ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
        <p>© 2026 Krrish IT Service - {locale.value === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
        <p class="mt-2">
          {locale.value === 'ar' ? 'بُني باستخدام Qwik و MongoDB' : 'Built with Qwik & MongoDB'}
        </p>
      </footer>
    </div>
  );
});

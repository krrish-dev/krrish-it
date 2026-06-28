import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { HERO_IMAGE_AR, HERO_IMAGE_EN } from '~/lib/hero-images';

type Locale = 'ar' | 'en';
type ThemeMode = 'dark' | 'light';

export default component$(() => {
  const locale = useSignal<Locale>('en');
  const theme = useSignal<ThemeMode>('dark');
  const contactStatus = useSignal<'idle' | 'sending' | 'success' | 'error'>('idle');

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const syncPreferences = () => {
      const savedLocale = localStorage.getItem('locale') as Locale | null;
      const savedTheme = localStorage.getItem('theme') as ThemeMode | null;

      if (savedLocale && savedLocale !== locale.value) locale.value = savedLocale;
      if (savedTheme && savedTheme !== theme.value) theme.value = savedTheme;

      const activeLocale = savedLocale || locale.value;
      document.documentElement.lang = activeLocale;
      document.documentElement.dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
    };

    syncPreferences();
    const timer = window.setInterval(syncPreferences, 250);
    return () => window.clearInterval(timer);
  });

  const handleContact = $(async (event: SubmitEvent) => {
    contactStatus.value = 'sending';
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      });

      if (res.ok) {
        contactStatus.value = 'success';
        form.reset();
      } else {
        contactStatus.value = 'error';
      }
    } catch {
      contactStatus.value = 'error';
    }
  });

  const isDark = () => theme.value === 'dark';
  const isAr = () => locale.value === 'ar';
  const heroImage = () => (isAr() ? HERO_IMAGE_AR : HERO_IMAGE_EN);

  const skills = [
    { name: 'Node.js', level: 90 },
    { name: 'PHP / Laravel', level: 85 },
    { name: 'JavaScript / TypeScript', level: 90 },
    { name: 'MongoDB / MySQL', level: 85 },
    { name: 'Linux / Ubuntu', level: 88 },
    { name: 'Docker / DevOps', level: 75 },
    { name: 'Nginx / Apache', level: 85 },
    { name: 'Git / GitHub', level: 88 },
  ];

  const services = [
    {
      icon: '💻',
      titleEn: 'Full-Stack Development',
      titleAr: 'تطوير Full-Stack',
      textEn: 'Complete web applications using Node.js, PHP Laravel, Qwik, MongoDB, MySQL, and modern front-end interfaces.',
      textAr: 'بناء تطبيقات ويب متكاملة باستخدام Node.js و PHP Laravel و Qwik مع قواعد بيانات MongoDB و MySQL وواجهات حديثة.',
    },
    {
      icon: '🛡️',
      titleEn: 'Server Management',
      titleAr: 'إدارة وتأمين السيرفرات',
      textEn: 'Linux server setup, Nginx configuration, SSL, firewall hardening, performance tuning, and safe production deployments.',
      textAr: 'إعداد وتأمين خوادم Linux، ضبط Nginx و SSL والجدار الناري وتحسين الأداء وتجهيز النشر الإنتاجي بأمان.',
    },
    {
      icon: '🚀',
      titleEn: 'DevOps & Deployment',
      titleAr: 'DevOps والنشر',
      textEn: 'Deployment pipelines, DigitalOcean, Netlify, GitHub workflows, API configuration, and production troubleshooting.',
      textAr: 'تجهيز النشر على DigitalOcean و Netlify وربط GitHub وضبط الـ API وحل مشاكل الإنتاج والـ build.',
    },
  ];

  return (
    <>
      <section
        id="about"
        class={`relative min-h-[700px] lg:min-h-[780px] overflow-hidden flex items-center ${isAr() ? 'font-arabic' : ''}`}
      >
        <img
          src={heroImage()}
          alt={isAr() ? 'كيرلس بدر - Krrish IT Service' : 'Kerols Badr - Krrish IT Service'}
          class="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div
          class="absolute inset-0 pointer-events-none"
          style={{
            background: isAr()
              ? 'linear-gradient(90deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.90) 30%, rgba(15,23,42,0.42) 58%, rgba(15,23,42,0.08) 100%)'
              : 'linear-gradient(90deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.42) 42%, rgba(15,23,42,0.90) 70%, rgba(15,23,42,0.98) 100%)',
          }}
        />
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_76%_35%,rgba(6,182,212,0.14),transparent_28%),radial-gradient(circle_at_88%_78%,rgba(29,78,216,0.14),transparent_26%)] pointer-events-none"></div>
        <div class="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none"></div>

        <div class="relative z-10 w-full px-6 lg:px-12 py-24 lg:py-32">
          <div class={`max-w-6xl mx-auto w-full flex ${isAr() ? 'justify-start' : 'justify-end'}`}>
            <div class={`w-full max-w-xl ${isAr() ? 'text-right' : 'text-left'}`}>
              <p class="text-sm font-semibold uppercase tracking-widest mb-4 text-cyan-400">
                {isAr() ? 'مرحباً، أنا' : "Hi, I'm"}
              </p>
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight drop-shadow-xl">
                {isAr() ? (
                  <>
                    <span class="text-[#e63946]">كيرلس</span>{' '}
                    <span class="text-[#1d4ed8]">بدر</span>
                  </>
                ) : (
                  <>
                    <span class="text-[#e63946]">K</span>erols{' '}
                    <span class="text-[#1d4ed8]">B</span>adr
                  </>
                )}
              </h1>
              <h2 class="text-xl md:text-2xl font-semibold mb-6 text-slate-200 drop-shadow">
                {isAr() ? 'مهندس برمجيات ومدير سيرفرات' : 'Software Engineer & Server Admin'}
              </h2>
              <p class="text-base md:text-lg leading-relaxed mb-8 text-slate-300 drop-shadow max-w-xl">
                {isAr()
                  ? 'مهندس برمجيات بخبرة تقارب 10 سنوات في تطوير البرمجيات وإدارة السيرفرات. أقدم حلول ويب متكاملة تشمل مواقع الشركات، المتاجر الإلكترونية، أنظمة الإدارة، ربط قواعد البيانات، وتأمين ونشر التطبيقات على السيرفرات.'
                  : 'Software Engineer with ~10 years working across servers and software. Delivers end-to-end projects including company websites, e-commerce stores, admin systems, database integrations, and secure production deployments.'}
              </p>
              <div class={`flex flex-col sm:flex-row gap-4 ${isAr() ? 'justify-end' : 'justify-start'}`}>
                <a href="#contact" class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all text-center shadow-lg shadow-cyan-500/20">
                  {isAr() ? 'تواصل معي' : 'Get in Touch'}
                </a>
                <a href="#services" class="px-8 py-3.5 rounded-xl font-bold transition-all text-center border border-slate-600 hover:border-cyan-500 hover:bg-slate-800/80 bg-slate-950/20 backdrop-blur-sm">
                  {isAr() ? 'اعرف المزيد' : 'Learn More'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" class={`px-6 lg:px-12 py-20 ${isDark() ? 'bg-slate-900/50' : 'bg-slate-50'} ${isAr() ? 'font-arabic' : ''}`}>
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-14">
            <h2 class="text-3xl md:text-4xl font-bold mb-3">{isAr() ? 'الخدمات' : 'Services'}</h2>
            <p class={`text-base ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>{isAr() ? 'ما أقدمه لك' : 'What I Offer'}</p>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.titleEn} class={`p-7 rounded-2xl border transition-all hover:scale-[1.02] ${isDark() ? 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-cyan-500/50 shadow-sm'}`}>
                <div class="text-3xl mb-5">{service.icon}</div>
                <h3 class="text-lg font-bold mb-3">{isAr() ? service.titleAr : service.titleEn}</h3>
                <p class={`text-sm leading-relaxed ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>{isAr() ? service.textAr : service.textEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" class={`px-6 lg:px-12 py-20 ${isAr() ? 'font-arabic' : ''}`}>
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-14">
            <h2 class="text-3xl md:text-4xl font-bold mb-3">{isAr() ? 'المهارات التقنية' : 'Technical Skills'}</h2>
            <p class={`text-base ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>{isAr() ? 'التقنيات التي أعمل بها' : 'Technologies I Work With'}</p>
          </div>

          <div class="grid md:grid-cols-2 gap-5">
            {skills.map((skill) => (
              <div key={skill.name} class="group">
                <div class="flex justify-between mb-2">
                  <span class="text-sm font-semibold">{skill.name}</span>
                  <span class={`text-xs font-medium ${isDark() ? 'text-slate-500' : 'text-slate-400'}`}>{skill.level}%</span>
                </div>
                <div class={`h-2.5 rounded-full overflow-hidden ${isDark() ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-1000 group-hover:opacity-80" style={{ width: `${skill.level}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" class={`px-6 lg:px-12 py-20 ${isDark() ? 'bg-slate-900/50' : 'bg-slate-50'} ${isAr() ? 'font-arabic' : ''}`}>
        <div class="max-w-3xl mx-auto">
          <div class="text-center mb-14">
            <h2 class="text-3xl md:text-4xl font-bold mb-3">{isAr() ? 'تواصل معي' : 'Get in Touch'}</h2>
            <p class={`text-base ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>{isAr() ? 'أرسل لي رسالة وسأرد عليك في أقرب وقت' : "Send me a message and I'll get back to you soon"}</p>
          </div>

          <form preventdefault:submit onSubmit$={handleContact} class="space-y-5">
            <div class="grid md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium mb-2">{isAr() ? 'الاسم' : 'Name'}</label>
                <input type="text" name="name" required class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`} placeholder={isAr() ? 'اسمك الكامل' : 'Your full name'} />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">{isAr() ? 'البريد الإلكتروني' : 'Email'}</label>
                <input type="email" name="email" required class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`} placeholder={isAr() ? 'بريدك الإلكتروني' : 'your@email.com'} />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">{isAr() ? 'الموضوع' : 'Subject'}</label>
              <input type="text" name="subject" class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`} placeholder={isAr() ? 'موضوع الرسالة' : 'Message subject'} />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">{isAr() ? 'الرسالة' : 'Message'}</label>
              <textarea name="message" required rows={5} class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`} placeholder={isAr() ? 'اكتب رسالتك هنا...' : 'Write your message here...'}></textarea>
            </div>

            {contactStatus.value === 'success' && <div class="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">{isAr() ? 'تم إرسال رسالتك بنجاح! سأرد عليك قريباً.' : "Your message has been sent successfully! I'll get back to you soon."}</div>}
            {contactStatus.value === 'error' && <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{isAr() ? 'حدث خطأ، يرجى المحاولة مرة أخرى.' : 'An error occurred, please try again.'}</div>}

            <button type="submit" disabled={contactStatus.value === 'sending'} class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50">
              {contactStatus.value === 'sending' ? (isAr() ? 'جاري الإرسال...' : 'Sending...') : (isAr() ? 'إرسال الرسالة' : 'Send Message')}
            </button>
          </form>

          <div class="mt-12 grid md:grid-cols-3 gap-4 text-center">
            <div class={`p-4 rounded-xl ${isDark() ? 'bg-slate-800/50' : 'bg-white shadow-sm'}`}>
              <p class="text-sm font-semibold mb-1">{isAr() ? 'البريد' : 'Email'}</p>
              <a href="mailto:kerolsbadr@gmail.com" class="text-cyan-500 text-sm hover:underline">kerolsbadr@gmail.com</a>
            </div>
            <div class={`p-4 rounded-xl ${isDark() ? 'bg-slate-800/50' : 'bg-white shadow-sm'}`}>
              <p class="text-sm font-semibold mb-1">{isAr() ? 'الموقع' : 'Location'}</p>
              <p class={`text-sm ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>{isAr() ? 'الجيزة، مصر' : 'Giza, Egypt'}</p>
            </div>
            <div class={`p-4 rounded-xl ${isDark() ? 'bg-slate-800/50' : 'bg-white shadow-sm'}`}>
              <p class="text-sm font-semibold mb-1">GitHub</p>
              <a href="https://github.com/Krrish-dev" target="_blank" class="text-cyan-500 text-sm hover:underline">@Krrish-dev</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Krrish IT Service | Kerols Badr - Software Engineer & Server Admin',
  meta: [
    {
      name: 'description',
      content: 'Kerols Badr - Software Engineer with ~10 years experience in Node.js, PHP, Linux server administration, and DevOps. Building end-to-end web solutions.',
    },
    {
      name: 'keywords',
      content: 'Kerols Badr, كيرلس بدر, Krrish IT, Software Engineer, Node.js, PHP, Laravel, Linux, DevOps, Server Admin, Full-Stack Developer',
    },
    {
      property: 'og:title',
      content: 'Krrish IT Service | Kerols Badr | كيرلس بدر',
    },
    {
      property: 'og:description',
      content: 'Software Engineer & Server Admin - Building end-to-end web solutions',
    },
  ],
};

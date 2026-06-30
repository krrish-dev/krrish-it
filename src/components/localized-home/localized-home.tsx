import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export type Locale = 'it' | 'en' | 'ar';
type ThemeMode = 'dark' | 'light';

const HERO_ASSET_VERSION = 'hero-v20260629-05';
const WHATSAPP_ICON_VERSION = 'wa-v20260629-01';
const WHATSAPP_PHONE = '201091435488';

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

const copy = {
  it: {
    badge: 'Soluzioni web da remoto',
    name: 'Kerols Badr',
    role: 'Software Engineer & Server Admin',
    intro:
      'Realizzo siti web, applicazioni moderne e ambienti server sicuri per professionisti e aziende. Una landing page italiana semplice, chiara e orientata al contatto.',
    primaryCta: 'Parliamo del progetto',
    secondaryCta: 'Servizi',
    servicesTitle: 'Servizi',
    servicesSubtitle: 'Cosa posso costruire per te',
    skillsTitle: 'Stack tecnico',
    skillsSubtitle: 'Tecnologie principali',
    contactTitle: 'Parliamo del tuo progetto',
    contactSubtitle: 'Scrivimi una breve descrizione e ti risponderò con i prossimi passi.',
    form: {
      name: 'Nome',
      namePlaceholder: 'Il tuo nome',
      email: 'Email',
      emailPlaceholder: 'tu@email.com',
      subject: 'Oggetto',
      subjectPlaceholder: 'Tipo di progetto',
      message: 'Messaggio',
      messagePlaceholder: 'Raccontami cosa vuoi costruire...',
      sending: 'Invio...',
      submit: 'Invia messaggio',
      success: 'Messaggio inviato con successo. Ti risponderò appena possibile.',
      error: 'Si è verificato un errore. Riprova.',
    },
    email: 'Email',
    location: 'Posizione',
    locationValue: 'Giza, Egitto — lavoro da remoto',
    whatsappLabel: 'Contatta su WhatsApp',
    whatsappText: 'Scrivimi',
    whatsappMessage: 'Ciao Kerolos, ho visitato krrish.it e vorrei parlarti di un progetto web.',
    services: [
      {
        icon: '💻',
        title: 'Siti web professionali',
        text: 'Landing page, siti aziendali e interfacce moderne veloci, responsive e pronte per Google.',
      },
      {
        icon: '⚙️',
        title: 'Applicazioni e dashboard',
        text: 'Pannelli di controllo, API, autenticazione, database e logiche personalizzate per il tuo flusso di lavoro.',
      },
      {
        icon: '🛡️',
        title: 'Server e deployment',
        text: 'Configurazione Linux, Nginx, SSL, sicurezza, performance e pubblicazione stabile in produzione.',
      },
    ],
  },
  en: {
    badge: "Hi, I'm",
    name: 'Kerols Badr',
    role: 'Software Engineer & Server Admin',
    intro:
      'Software Engineer with ~10 years working across servers and software. I deliver end-to-end web projects including company websites, e-commerce stores, admin systems, database integrations, and secure production deployments.',
    primaryCta: 'Get in Touch',
    secondaryCta: 'Learn More',
    servicesTitle: 'Services',
    servicesSubtitle: 'What I offer',
    skillsTitle: 'Technical Skills',
    skillsSubtitle: 'Technologies I work with',
    contactTitle: 'Get in Touch',
    contactSubtitle: "Send me a message and I'll get back to you soon.",
    form: {
      name: 'Name',
      namePlaceholder: 'Your full name',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      subject: 'Subject',
      subjectPlaceholder: 'Message subject',
      message: 'Message',
      messagePlaceholder: 'Write your message here...',
      sending: 'Sending...',
      submit: 'Send Message',
      success: "Your message has been sent successfully. I'll get back to you soon.",
      error: 'An error occurred, please try again.',
    },
    email: 'Email',
    location: 'Location',
    locationValue: 'Giza, Egypt',
    whatsappLabel: 'Contact on WhatsApp',
    whatsappText: 'Chat now',
    whatsappMessage: 'Hi Kerolos, I visited krrish.it and would like to discuss a web project with you.',
    services: [
      {
        icon: '💻',
        title: 'Full-Stack Development',
        text: 'Complete web applications using Node.js, PHP Laravel, Qwik, MongoDB, MySQL, and modern front-end interfaces.',
      },
      {
        icon: '🛡️',
        title: 'Server Management',
        text: 'Linux server setup, Nginx configuration, SSL, firewall hardening, performance tuning, and safe production deployments.',
      },
      {
        icon: '🚀',
        title: 'DevOps & Deployment',
        text: 'Deployment pipelines, DigitalOcean, Netlify, GitHub workflows, API configuration, and production troubleshooting.',
      },
    ],
  },
  ar: {
    badge: 'مرحباً، أنا',
    name: 'كيرلس بدر',
    role: 'مهندس برمجيات ومدير سيرفرات',
    intro:
      'مهندس برمجيات بخبرة تقارب 10 سنوات في تطوير البرمجيات وإدارة السيرفرات. أقدم حلول ويب متكاملة تشمل مواقع الشركات، المتاجر الإلكترونية، أنظمة الإدارة، ربط قواعد البيانات، وتأمين ونشر التطبيقات على السيرفرات.',
    primaryCta: 'تواصل معي',
    secondaryCta: 'اعرف المزيد',
    servicesTitle: 'الخدمات',
    servicesSubtitle: 'ما أقدمه لك',
    skillsTitle: 'المهارات التقنية',
    skillsSubtitle: 'التقنيات التي أعمل بها',
    contactTitle: 'تواصل معي',
    contactSubtitle: 'أرسل لي رسالة وسأرد عليك في أقرب وقت.',
    form: {
      name: 'الاسم',
      namePlaceholder: 'اسمك الكامل',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'بريدك الإلكتروني',
      subject: 'الموضوع',
      subjectPlaceholder: 'موضوع الرسالة',
      message: 'الرسالة',
      messagePlaceholder: 'اكتب رسالتك هنا...',
      sending: 'جاري الإرسال...',
      submit: 'إرسال الرسالة',
      success: 'تم إرسال رسالتك بنجاح. سأرد عليك قريباً.',
      error: 'حدث خطأ، يرجى المحاولة مرة أخرى.',
    },
    email: 'البريد',
    location: 'الموقع',
    locationValue: 'الجيزة، مصر',
    whatsappLabel: 'تواصل واتساب',
    whatsappText: 'تواصل الآن',
    whatsappMessage: 'مرحبًا كيرلس، شاهدت موقع krrish.it وأريد التحدث معك بخصوص مشروع ويب.',
    services: [
      {
        icon: '💻',
        title: 'تطوير Full-Stack',
        text: 'بناء تطبيقات ويب متكاملة باستخدام Node.js و PHP Laravel و Qwik مع قواعد بيانات MongoDB و MySQL وواجهات حديثة.',
      },
      {
        icon: '🛡️',
        title: 'إدارة وتأمين السيرفرات',
        text: 'إعداد وتأمين خوادم Linux، ضبط Nginx و SSL والجدار الناري وتحسين الأداء وتجهيز النشر الإنتاجي بأمان.',
      },
      {
        icon: '🚀',
        title: 'DevOps والنشر',
        text: 'تجهيز النشر على DigitalOcean و Netlify وربط GitHub وضبط الـ API وحل مشاكل الإنتاج والـ build.',
      },
    ],
  },
} as const;

export const LocalizedHome = component$((props: { locale: Locale; variant?: 'compact' | 'full' }) => {
  const theme = useSignal<ThemeMode>('dark');
  const contactStatus = useSignal<'idle' | 'sending' | 'success' | 'error'>('idle');

  const locale = props.locale;
  const content = copy[locale];
  const isAr = locale === 'ar';
  const isCompact = props.variant === 'compact';

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    const applySavedTheme = () => {
      const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
      if ((savedTheme === 'dark' || savedTheme === 'light') && savedTheme !== theme.value) {
        theme.value = savedTheme;
      }
    };

    applySavedTheme();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'theme') applySavedTheme();
    };

    window.addEventListener('storage', handleStorage);
    cleanup(() => window.removeEventListener('storage', handleStorage));
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
          locale,
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
  const heroImage = () =>
    isAr ? `/hero-ar.webp?v=${HERO_ASSET_VERSION}` : `/hero-en.webp?v=${HERO_ASSET_VERSION}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(content.whatsappMessage)}`;
  const visibleSkills = isCompact ? skills.slice(0, 6) : skills;

  return (
    <>
      <section
        id="about"
        data-hero-version={HERO_ASSET_VERSION}
        class={`relative min-h-[calc(100vh-88px)] md:min-h-[700px] lg:min-h-[780px] overflow-hidden flex items-end md:items-center ${isAr ? 'font-arabic' : ''}`}
        lang={locale}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <img
          src={heroImage()}
          alt={isAr ? 'كيرلس بدر - Krrish IT Service' : 'Kerols Badr - Krrish IT Service'}
          class="absolute inset-0 h-full w-full object-cover select-none pointer-events-none opacity-95 md:opacity-100"
          style={{ objectPosition: isAr ? '72% center' : '28% center' }}
          width="1672"
          height="941"
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div
          class="absolute inset-0 pointer-events-none"
          style={{
            background: isAr
              ? 'linear-gradient(90deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.92) 32%, rgba(15,23,42,0.50) 58%, rgba(15,23,42,0.12) 100%)'
              : 'linear-gradient(90deg, rgba(15,23,42,0.12) 0%, rgba(15,23,42,0.50) 42%, rgba(15,23,42,0.92) 70%, rgba(15,23,42,0.98) 100%)',
          }}
        />
        <div class="absolute inset-0 md:hidden bg-gradient-to-t from-[#0f172a] via-[#0f172a]/78 to-[#0f172a]/10 pointer-events-none"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_76%_35%,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_88%_78%,rgba(29,78,216,0.12),transparent_26%)] pointer-events-none"></div>
        <div class="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none"></div>

        <div class="relative z-10 w-full px-5 sm:px-6 lg:px-12 pt-28 pb-10 md:py-24 lg:py-32" dir="ltr">
          <div class={`max-w-6xl mx-auto w-full flex ${isAr ? 'justify-start' : 'justify-end'}`}>
            <div
              dir={isAr ? 'rtl' : 'ltr'}
              class={`w-full max-w-[34rem] rounded-[2rem] border border-white/10 bg-slate-950/58 p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur-md md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0 ${isAr ? 'text-right' : 'text-left'}`}
            >
              <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cyan-300 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm md:text-cyan-400">
                <span class="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.9)]"></span>
                {content.badge}
              </div>
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight text-white drop-shadow-xl">
                {isAr ? (
                  <>
                    <span class="text-[#e63946]">كيرلس</span>{' '}
                    <span class="text-[#1d4ed8]">بدر</span>
                  </>
                ) : (
                  <>
                    <span class="text-[#e63946]">Kerols</span>{' '}
                    <span class="text-[#1d4ed8]">Badr</span>
                  </>
                )}
              </h1>
              <h2 class="text-xl md:text-2xl font-semibold mb-6 text-slate-200 drop-shadow">
                {content.role}
              </h2>
              <p class="text-base md:text-lg leading-relaxed mb-8 text-slate-300 drop-shadow max-w-xl">
                {content.intro}
              </p>
              <div class={`flex flex-col sm:flex-row gap-4 ${isAr ? 'justify-end' : 'justify-start'}`}>
                <a href="#contact" class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all text-center shadow-lg shadow-cyan-500/20">
                  {content.primaryCta}
                </a>
                <a href="#services" class="px-8 py-3.5 rounded-xl font-bold text-white transition-all text-center border border-slate-500/80 hover:border-cyan-500 hover:bg-slate-800/80 bg-slate-950/35 backdrop-blur-sm">
                  {content.secondaryCta}
                </a>
              </div>
              <div class="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-300 md:hidden">
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">Node.js</span>
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">Laravel</span>
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1">DevOps</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" class={`px-6 lg:px-12 py-20 ${isDark() ? 'bg-slate-900/50' : 'bg-slate-50'} ${isAr ? 'font-arabic' : ''}`} lang={locale} dir={isAr ? 'rtl' : 'ltr'}>
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-14">
            <h2 class="text-3xl md:text-4xl font-bold mb-3">{content.servicesTitle}</h2>
            <p class={`text-base ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>{content.servicesSubtitle}</p>
          </div>
          <div class="grid md:grid-cols-3 gap-6">
            {content.services.map((service) => (
              <div key={service.title} class={`p-7 rounded-2xl border transition-all hover:scale-[1.02] ${isDark() ? 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-cyan-500/50 shadow-sm'}`}>
                <div class="text-3xl mb-5">{service.icon}</div>
                <h3 class="text-lg font-bold mb-3">{service.title}</h3>
                <p class={`text-sm leading-relaxed ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" class={`px-6 lg:px-12 py-20 ${isAr ? 'font-arabic' : ''}`} lang={locale} dir={isAr ? 'rtl' : 'ltr'}>
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-14">
            <h2 class="text-3xl md:text-4xl font-bold mb-3">{content.skillsTitle}</h2>
            <p class={`text-base ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>{content.skillsSubtitle}</p>
          </div>
          <div class="grid md:grid-cols-2 gap-5">
            {visibleSkills.map((skill) => (
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

      <section id="contact" class={`px-6 lg:px-12 py-20 ${isDark() ? 'bg-slate-900/50' : 'bg-slate-50'} ${isAr ? 'font-arabic' : ''}`} lang={locale} dir={isAr ? 'rtl' : 'ltr'}>
        <div class="max-w-3xl mx-auto">
          <div class="text-center mb-14">
            <h2 class="text-3xl md:text-4xl font-bold mb-3">{content.contactTitle}</h2>
            <p class={`text-base ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>{content.contactSubtitle}</p>
          </div>
          <form preventdefault:submit onSubmit$={handleContact} class="space-y-5">
            <div class="grid md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium mb-2">{content.form.name}</label>
                <input type="text" name="name" required class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`} placeholder={content.form.namePlaceholder} />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">{content.form.email}</label>
                <input type="email" name="email" required class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`} placeholder={content.form.emailPlaceholder} />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">{content.form.subject}</label>
              <input type="text" name="subject" class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`} placeholder={content.form.subjectPlaceholder} />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">{content.form.message}</label>
              <textarea name="message" required rows={5} class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`} placeholder={content.form.messagePlaceholder}></textarea>
            </div>
            {contactStatus.value === 'success' && <div class="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">{content.form.success}</div>}
            {contactStatus.value === 'error' && <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">{content.form.error}</div>}
            <button type="submit" disabled={contactStatus.value === 'sending'} class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50">
              {contactStatus.value === 'sending' ? content.form.sending : content.form.submit}
            </button>
          </form>
          <div class="mt-12 grid md:grid-cols-3 gap-4 text-center">
            <div class={`p-4 rounded-xl ${isDark() ? 'bg-slate-800/50' : 'bg-white shadow-sm'}`}>
              <p class="text-sm font-semibold mb-1">{content.email}</p>
              <a href="mailto:kerolsbadr@gmail.com" class="text-cyan-500 text-sm hover:underline">kerolsbadr@gmail.com</a>
            </div>
            <div class={`p-4 rounded-xl ${isDark() ? 'bg-slate-800/50' : 'bg-white shadow-sm'}`}>
              <p class="text-sm font-semibold mb-1">{content.location}</p>
              <p class={`text-sm ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>{content.locationValue}</p>
            </div>
            <div class={`p-4 rounded-xl ${isDark() ? 'bg-slate-800/50' : 'bg-white shadow-sm'}`}>
              <p class="text-sm font-semibold mb-1">GitHub</p>
              <a href="https://github.com/krrish-dev" target="_blank" rel="noopener noreferrer" class="text-cyan-500 text-sm hover:underline">@krrish-dev</a>
            </div>
          </div>
        </div>
      </section>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={content.whatsappLabel}
        class={`group fixed bottom-5 z-[90] flex items-center gap-3 rounded-full border border-emerald-300/35 bg-emerald-500/95 px-3 py-3 text-white shadow-2xl shadow-emerald-900/45 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-emerald-400 ${isAr ? 'left-4 sm:left-6' : 'right-4 sm:right-6'}`}
      >
        <span class="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping"></span>
        <span class="absolute -inset-2 rounded-full border border-emerald-300/30 opacity-70 animate-pulse"></span>
        <span class="relative grid h-12 w-12 place-items-center rounded-full bg-white shadow-lg shadow-emerald-950/30 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
          <img
            src={`/whatsapp.svg?v=${WHATSAPP_ICON_VERSION}`}
            alt="WhatsApp"
            class="h-11 w-11"
            width="44"
            height="44"
            loading="eager"
            fetchPriority="low"
            decoding="async"
          />
        </span>
        <span class="relative hidden pe-1 text-sm font-extrabold leading-tight sm:block">
          <span class="block">{content.whatsappText}</span>
          <span class="block text-xs font-bold text-emerald-50/85">WhatsApp</span>
        </span>
      </a>
    </>
  );
});
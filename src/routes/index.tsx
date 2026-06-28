import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const locale = useSignal<'ar' | 'en'>('en');
  const theme = useSignal<'dark' | 'light'>('dark');
  const contactStatus = useSignal<'idle' | 'sending' | 'success' | 'error'>('idle');

  useVisibleTask$(() => {
    const savedLocale = localStorage.getItem('locale') as 'ar' | 'en';
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedLocale) locale.value = savedLocale;
    if (savedTheme) theme.value = savedTheme;

    // Listen for storage changes (from layout)
    window.addEventListener('storage', () => {
      const l = localStorage.getItem('locale') as 'ar' | 'en';
      const t = localStorage.getItem('theme') as 'dark' | 'light';
      if (l) locale.value = l;
      if (t) theme.value = t;
    });
  });

  const handleContact = $(async (e: SubmitEvent) => {
    e.preventDefault();
    contactStatus.value = 'sending';
    const form = e.target as HTMLFormElement;
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

  const skills = [
    { name: 'Node.js', level: 90 },
    { name: 'PHP / Laravel', level: 85 },
    { name: 'JavaScript / TypeScript', level: 90 },
    { name: 'MongoDB / MySQL', level: 85 },
    { name: 'Linux / Ubuntu', level: 88 },
    { name: 'Docker / DevOps', level: 75 },
    { name: 'Nginx / Apache', level: 85 },
    { name: 'AWS Cloud', level: 70 },
    { name: 'HTML5 / CSS3', level: 92 },
    { name: 'Git / GitHub', level: 88 },
    { name: 'REST APIs', level: 90 },
    { name: 'Angular / Qwik', level: 75 },
  ];

  return (
    <>
      {/* Hero Section */}
      <section id="about" class="relative px-6 lg:px-12 py-20 lg:py-32 overflow-hidden">
        {/* Background Glow */}
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/8 blur-[120px] rounded-full -z-10"></div>
        <div class="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -z-10"></div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <div class="flex-1 text-center lg:text-start">
            <p class={`text-sm font-semibold uppercase tracking-widest mb-4 ${isDark() ? 'text-cyan-400' : 'text-cyan-600'}`}>
              {isAr() ? 'مرحباً، أنا' : "Hi, I'm"}
            </p>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
              <span class="text-[#e63946]">K</span>erols{' '}
              <span class="text-[#1d4ed8]">B</span>adr
            </h1>
            <h2 class={`text-xl md:text-2xl font-semibold mb-6 ${isDark() ? 'text-slate-300' : 'text-slate-700'}`}>
              {isAr() ? 'مهندس برمجيات ومدير سيرفرات' : 'Software Engineer & Server Admin'}
            </h2>
            <p class={`text-base md:text-lg leading-relaxed max-w-xl mb-8 ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>
              {isAr()
                ? 'مهندس برمجيات بخبرة تقارب 10 سنوات في تطوير البرمجيات وإدارة السيرفرات. أقدم مشاريع متكاملة تشمل متاجر إلكترونية ومواقع ويب متنوعة، مع خبرة عميقة في إدارة خوادم Linux وتكوين الشبكات.'
                : 'Software Engineer with ~10 years working across servers and software. Delivers end-to-end projects including e-commerce stores and diverse website concepts. Experienced in Linux server administration and network configuration.'}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#contact" class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all text-center shadow-lg shadow-cyan-500/20">
                {isAr() ? 'تواصل معي' : 'Get in Touch'}
              </a>
              <a href="#services" class={`px-8 py-3.5 rounded-xl font-bold transition-all text-center border ${isDark() ? 'border-slate-700 hover:border-cyan-500 hover:bg-slate-800' : 'border-slate-300 hover:border-cyan-500 hover:bg-slate-50'}`}>
                {isAr() ? 'اعرف المزيد' : 'Learn More'}
              </a>
            </div>
          </div>

          {/* Profile Visual */}
          <div class="flex-shrink-0">
            <div class={`w-64 h-64 lg:w-80 lg:h-80 rounded-full border-4 flex items-center justify-center ${isDark() ? 'border-cyan-500/30 bg-slate-800/50' : 'border-cyan-500/30 bg-slate-100'}`}>
              <div class="text-center">
                <div class="text-5xl lg:text-6xl font-black">
                  <span class="text-[#e63946]">K</span><span class="text-[#1d4ed8]">B</span>
                </div>
                <p class={`text-xs mt-2 font-medium ${isDark() ? 'text-slate-500' : 'text-slate-400'}`}>KRRISH IT SERVICE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" class={`px-6 lg:px-12 py-20 ${isDark() ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-14">
            <h2 class="text-3xl md:text-4xl font-bold mb-3">
              {isAr() ? 'الخدمات' : 'Services'}
            </h2>
            <p class={`text-base ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>
              {isAr() ? 'ما أقدمه لك' : 'What I Offer'}
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            {/* Full-Stack */}
            <div class={`p-7 rounded-2xl border transition-all hover:scale-[1.02] group ${isDark() ? 'bg-slate-800/50 border-slate-700 hover:border-cyan-500/50' : 'bg-white border-slate-200 hover:border-cyan-500/50 shadow-sm'}`}>
              <div class="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-cyan-500/30 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 class="text-lg font-bold mb-3">{isAr() ? 'تطوير Full-Stack' : 'Full-Stack Development'}</h3>
              <p class={`text-sm leading-relaxed ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>
                {isAr()
                  ? 'بناء تطبيقات ويب متكاملة باستخدام Node.js و PHP (Laravel) مع واجهات أمامية تفاعلية وقواعد بيانات MongoDB و MySQL.'
                  : 'Building complete web applications using Node.js and PHP (Laravel) with interactive frontends and MongoDB/MySQL databases.'}
              </p>
            </div>

            {/* Server Management */}
            <div class={`p-7 rounded-2xl border transition-all hover:scale-[1.02] group ${isDark() ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-500/50 shadow-sm'}`}>
              <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-500/30 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 class="text-lg font-bold mb-3">{isAr() ? 'إدارة السيرفرات' : 'Server Management'}</h3>
              <p class={`text-sm leading-relaxed ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>
                {isAr()
                  ? 'إعداد وتأمين خوادم Linux (Ubuntu)، إدارة Nginx، وتكوين الشبكات لضمان استقرار وأمان التطبيقات.'
                  : 'Setting up and securing Linux servers (Ubuntu), managing Nginx, and configuring networks for stable and secure deployments.'}
              </p>
            </div>

            {/* DevOps & Cloud */}
            <div class={`p-7 rounded-2xl border transition-all hover:scale-[1.02] group ${isDark() ? 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50' : 'bg-white border-slate-200 hover:border-purple-500/50 shadow-sm'}`}>
              <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-purple-500/30 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold mb-3">{isAr() ? 'DevOps و Cloud' : 'DevOps & Cloud'}</h3>
              <p class={`text-sm leading-relaxed ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>
                {isAr()
                  ? 'أتمتة عمليات النشر، إعداد Docker، واستخدام خدمات AWS السحابية لتحسين الأداء وتقليل التكاليف.'
                  : 'Automating deployments, Docker setup, and leveraging AWS cloud services for optimal performance and cost efficiency.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" class="px-6 lg:px-12 py-20">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-14">
            <h2 class="text-3xl md:text-4xl font-bold mb-3">
              {isAr() ? 'المهارات التقنية' : 'Technical Skills'}
            </h2>
            <p class={`text-base ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>
              {isAr() ? 'التقنيات التي أتقنها' : 'Technologies I Master'}
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-5">
            {skills.map((skill) => (
              <div key={skill.name} class="group">
                <div class="flex justify-between mb-2">
                  <span class="text-sm font-semibold">{skill.name}</span>
                  <span class={`text-xs font-medium ${isDark() ? 'text-slate-500' : 'text-slate-400'}`}>{skill.level}%</span>
                </div>
                <div class={`h-2.5 rounded-full overflow-hidden ${isDark() ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-1000 group-hover:opacity-80"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div class="mt-14">
            <h3 class={`text-xl font-bold mb-6 text-center ${isDark() ? 'text-slate-200' : 'text-slate-800'}`}>
              {isAr() ? 'الشهادات' : 'Certifications'}
            </h3>
            <div class="grid md:grid-cols-3 gap-4">
              <div class={`p-5 rounded-xl border text-center ${isDark() ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white shadow-sm'}`}>
                <div class="text-2xl mb-2">☁️</div>
                <p class="font-semibold text-sm">AWS Cloud Practitioner</p>
                <p class={`text-xs mt-1 ${isDark() ? 'text-slate-500' : 'text-slate-400'}`}>Nov 2025</p>
              </div>
              <div class={`p-5 rounded-xl border text-center ${isDark() ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white shadow-sm'}`}>
                <div class="text-2xl mb-2">💻</div>
                <p class="font-semibold text-sm">ALX Software Engineer</p>
                <p class={`text-xs mt-1 ${isDark() ? 'text-slate-500' : 'text-slate-400'}`}>Feb 2025</p>
              </div>
              <div class={`p-5 rounded-xl border text-center ${isDark() ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white shadow-sm'}`}>
                <div class="text-2xl mb-2">🌐</div>
                <p class="font-semibold text-sm">NTI Web Development</p>
                <p class={`text-xs mt-1 ${isDark() ? 'text-slate-500' : 'text-slate-400'}`}>Nov 2021</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" class={`px-6 lg:px-12 py-20 ${isDark() ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
        <div class="max-w-3xl mx-auto">
          <div class="text-center mb-14">
            <h2 class="text-3xl md:text-4xl font-bold mb-3">
              {isAr() ? 'تواصل معي' : 'Get in Touch'}
            </h2>
            <p class={`text-base ${isDark() ? 'text-slate-400' : 'text-slate-600'}`}>
              {isAr() ? 'أرسل لي رسالة وسأرد عليك في أقرب وقت' : 'Send me a message and I\'ll get back to you soon'}
            </p>
          </div>

          <form preventdefault:submit onSubmit$={handleContact} class="space-y-5">
            <div class="grid md:grid-cols-2 gap-5">
              <div>
                <label class="block text-sm font-medium mb-2">{isAr() ? 'الاسم' : 'Name'}</label>
                <input
                  type="text"
                  name="name"
                  required
                  class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                  placeholder={isAr() ? 'اسمك الكامل' : 'Your full name'}
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">{isAr() ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  name="email"
                  required
                  class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                  placeholder={isAr() ? 'بريدك الإلكتروني' : 'your@email.com'}
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">{isAr() ? 'الموضوع' : 'Subject'}</label>
              <input
                type="text"
                name="subject"
                class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                placeholder={isAr() ? 'موضوع الرسالة' : 'Message subject'}
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">{isAr() ? 'الرسالة' : 'Message'}</label>
              <textarea
                name="message"
                required
                rows={5}
                class={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${isDark() ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'}`}
                placeholder={isAr() ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
              ></textarea>
            </div>

            {contactStatus.value === 'success' && (
              <div class="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">
                {isAr() ? 'تم إرسال رسالتك بنجاح! سأرد عليك قريباً.' : 'Your message has been sent successfully! I\'ll get back to you soon.'}
              </div>
            )}
            {contactStatus.value === 'error' && (
              <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {isAr() ? 'حدث خطأ، يرجى المحاولة مرة أخرى.' : 'An error occurred, please try again.'}
              </div>
            )}

            <button
              type="submit"
              disabled={contactStatus.value === 'sending'}
              class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {contactStatus.value === 'sending'
                ? (isAr() ? 'جاري الإرسال...' : 'Sending...')
                : (isAr() ? 'إرسال الرسالة' : 'Send Message')}
            </button>
          </form>

          {/* Contact Info */}
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
      content: 'Kerols Badr, Krrish IT, Software Engineer, Node.js, PHP, Laravel, Linux, DevOps, Server Admin, Full-Stack Developer',
    },
    {
      property: 'og:title',
      content: 'Krrish IT Service | Kerols Badr',
    },
    {
      property: 'og:description',
      content: 'Software Engineer & Server Admin - Building end-to-end web solutions',
    },
  ],
};

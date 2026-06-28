export type Locale = 'ar' | 'en';

export const translations = {
  ar: {
    // Navigation
    nav: {
      home: 'الرئيسية',
      about: 'حول',
      services: 'الخدمات',
      skills: 'المهارات',
      projects: 'المشاريع',
      blog: 'المدونة',
      contact: 'اتصل بي',
      dashboard: 'لوحة التحكم',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
    },
    // Hero Section
    hero: {
      greeting: 'مرحباً، أنا',
      name: 'كيرلس بدر',
      title: 'مهندس برمجيات ومدير سيرفرات',
      description: 'مهندس برمجيات بخبرة تقارب 10 سنوات في تطوير البرمجيات وإدارة السيرفرات. أقدم مشاريع متكاملة تشمل متاجر إلكترونية ومواقع ويب متنوعة، مع خبرة عميقة في إدارة خوادم Linux وتكوين الشبكات.',
      cta_primary: 'تواصل معي',
      cta_secondary: 'اعرف المزيد',
    },
    // Services
    services: {
      title: 'الخدمات',
      subtitle: 'ما أقدمه لك',
      fullstack: {
        title: 'تطوير Full-Stack',
        description: 'بناء تطبيقات ويب متكاملة باستخدام Node.js و PHP (Laravel) مع واجهات أمامية تفاعلية.',
      },
      servers: {
        title: 'إدارة السيرفرات',
        description: 'إعداد وتأمين خوادم Linux (Ubuntu)، إدارة Nginx، وتكوين الشبكات لضمان استقرار التطبيقات.',
      },
      devops: {
        title: 'DevOps و Cloud',
        description: 'أتمتة عمليات النشر، إعداد Docker، واستخدام خدمات AWS السحابية لتحسين الأداء.',
      },
    },
    // Skills
    skills: {
      title: 'المهارات التقنية',
      subtitle: 'التقنيات التي أتقنها',
    },
    // Contact
    contact: {
      title: 'تواصل معي',
      subtitle: 'أرسل لي رسالة',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      message: 'الرسالة',
      send: 'إرسال',
      success: 'تم إرسال رسالتك بنجاح!',
      error: 'حدث خطأ، يرجى المحاولة مرة أخرى.',
    },
    // Footer
    footer: {
      rights: 'جميع الحقوق محفوظة',
      built_with: 'بُني بكل حب باستخدام Qwik و MongoDB',
    },
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      about: 'About',
      services: 'Services',
      skills: 'Skills',
      projects: 'Projects',
      blog: 'Blog',
      contact: 'Contact',
      dashboard: 'Dashboard',
      login: 'Login',
      logout: 'Logout',
    },
    // Hero Section
    hero: {
      greeting: "Hi, I'm",
      name: 'Kerols Badr',
      title: 'Software Engineer & Server Admin',
      description: 'Software Engineer with ~10 years working across servers and software. Delivers end-to-end projects including e-commerce stores and diverse website concepts. Experienced in Linux server administration (Ubuntu) and network configuration.',
      cta_primary: 'Get in Touch',
      cta_secondary: 'Learn More',
    },
    // Services
    services: {
      title: 'Services',
      subtitle: 'What I Offer',
      fullstack: {
        title: 'Full-Stack Development',
        description: 'Building complete web applications using Node.js and PHP (Laravel) with interactive frontends.',
      },
      servers: {
        title: 'Server Management',
        description: 'Setting up and securing Linux servers (Ubuntu), managing Nginx, and configuring networks for stable deployments.',
      },
      devops: {
        title: 'DevOps & Cloud',
        description: 'Automating deployments, Docker setup, and leveraging AWS cloud services for optimal performance.',
      },
    },
    // Skills
    skills: {
      title: 'Technical Skills',
      subtitle: 'Technologies I Master',
    },
    // Contact
    contact: {
      title: 'Get in Touch',
      subtitle: 'Send me a message',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send',
      success: 'Your message has been sent successfully!',
      error: 'An error occurred, please try again.',
    },
    // Footer
    footer: {
      rights: 'All rights reserved',
      built_with: 'Built with love using Qwik & MongoDB',
    },
  },
} as const;

export function t(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

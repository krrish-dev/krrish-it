import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

const SITE_URL = "https://krrish.it";
const SITE_NAME = "Krrish IT Service";
const BRAND_ALTERNATES = ["Krrish.it", "Krrish IT", "Krrish"];
const GITHUB_URL = "https://github.com/krrish-dev";
const LINKEDIN_URL = "https://www.linkedin.com/in/kerols-badr-tawfik-zaki";
const CONTACT_EMAIL = "kerolsbadr@gmail.com";
const PHONE_E164 = "+201091435488";
const OG_IMAGE = `${SITE_URL}/og-image.svg`;
const ARABIC_FONT_URL = "https://fonts.googleapis.com/css2?family=Noto+" + "Kufi+Arabic:wght@400;500;600;700;800&display=swap";

const seoByLocale = {
  it: {
    lang: "it",
    ogLocale: "it_IT",
    title: "Kerols Badr | Sviluppatore Web Full Stack & Server Admin",
    description:
      "Krrish IT Service offre sviluppo web, dashboard, API, Laravel, Node.js, gestione server Linux, Nginx, SSL e deployment sicuro da remoto.",
    keywords:
      "Kerols Badr, Krrish IT, sviluppatore web full stack, server admin, Node.js, Laravel, Linux, Nginx, DevOps, DigitalOcean, Netlify",
    breadcrumb: "Home",
    profileName: "Kerols Badr - Sviluppatore Web Full Stack & Server Admin",
  },
  en: {
    lang: "en",
    ogLocale: "en_US",
    title: "Kerols Badr | Full-Stack Developer & Server Admin",
    description:
      "Full-stack web developer and server admin building websites, dashboards, APIs, Laravel and Node.js apps, MongoDB/MySQL integrations, and secure production deployments.",
    keywords:
      "Kerols Badr, Krrish IT, Full-Stack Developer, Software Engineer, Server Admin, Node.js, Laravel, MongoDB, MySQL, Linux, DevOps, Web Development Egypt",
    breadcrumb: "English",
    profileName: "Kerols Badr - Full-Stack Developer & Server Admin",
  },
  ar: {
    lang: "ar",
    ogLocale: "ar_EG",
    title: "كيرلس بدر | مطور Full-Stack ومدير سيرفرات",
    description:
      "خدمات تطوير مواقع وتطبيقات ويب، لوحات تحكم، APIs، Laravel، Node.js، MongoDB، MySQL، إدارة سيرفرات Linux، Nginx، SSL والنشر الآمن.",
    keywords:
      "كيرلس بدر, Krrish IT, مطور Full-Stack, مهندس برمجيات, مدير سيرفرات, تطوير مواقع, Laravel, Node.js, MongoDB, MySQL, Linux, DevOps",
    breadcrumb: "العربية",
    profileName: "كيرلس بدر - مطور Full-Stack ومدير سيرفرات",
  },
} as const;

type Locale = keyof typeof seoByLocale;

const alternateLocales = [
  { hreflang: "it", href: `${SITE_URL}/` },
  { hreflang: "en", href: `${SITE_URL}/en/` },
  { hreflang: "ar", href: `${SITE_URL}/ar/` },
  { hreflang: "x-default", href: `${SITE_URL}/` },
];

const knowsAbout = [
  "Full-Stack Web Development",
  "Software Engineering",
  "Node.js",
  "Laravel",
  "PHP",
  "Qwik",
  "JavaScript",
  "TypeScript",
  "MongoDB",
  "MySQL",
  "Linux Server Administration",
  "Nginx",
  "SSL Configuration",
  "Server Security",
  "DevOps",
  "DigitalOcean",
  "Netlify",
];

const serviceTypes = [
  "Full-Stack Web Development",
  "Professional Website Development",
  "Dashboard and Admin Panel Development",
  "API Development",
  "Server Administration",
  "Linux Server Management",
  "Nginx Configuration",
  "SSL Setup",
  "DevOps Deployment",
  "Node.js Development",
  "PHP Laravel Development",
  "MongoDB and MySQL Integration",
];

const portfolioProjects = [
  {
    name: "Al Shorouk Academy",
    url: "https://al-shorouk.academy/",
    description: "Educational academy website project.",
  },
  {
    name: "Learn Special English",
    url: "https://www.learnspecialenglish.com/",
    description: "English learning website project.",
  },
  {
    name: "Pet Home Euthanasia Service",
    url: "https://pethomeeuthanasiaservice.com/",
    description: "Service website project for in-home pet euthanasia and related veterinary information.",
  },
  {
    name: "ZAT.pro",
    url: "https://zat.pro/",
    description: "Contribution to the dynamic question algorithm for ZAT.pro.",
  },
];

const getLocaleFromPath = (pathname: string): Locale => {
  if (pathname.startsWith("/ar")) return "ar";
  if (pathname.startsWith("/en")) return "en";
  return "it";
};

const getCanonicalPath = (pathname: string) => {
  if (pathname === "/" || pathname === "") return "/";
  if (pathname === "/en" || pathname.startsWith("/en/")) return "/en/";
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return "/ar/";
  return pathname;
};

const getHeadMetaContent = (
  meta: ReturnType<typeof useDocumentHead>["meta"],
  attribute: "name" | "property",
  value: string,
) => {
  const match = meta.find((item) => (item as Record<string, unknown>)[attribute] === value);
  return typeof match?.content === "string" ? match.content : "";
};

const buildBreadcrumb = (locale: Locale, canonicalUrl: string) => {
  const localeData = seoByLocale[locale];

  if (locale === "it") {
    return [
      {
        "@type": "ListItem",
        position: 1,
        name: "Krrish IT Service",
        item: canonicalUrl,
      },
    ];
  }

  return [
    {
      "@type": "ListItem",
      position: 1,
      name: "Krrish IT Service",
      item: `${SITE_URL}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: localeData.breadcrumb,
      item: canonicalUrl,
    },
  ];
};

const buildPortfolioItemList = () => ({
  "@type": "ItemList",
  "@id": `${SITE_URL}/#portfolio`,
  name: "Selected portfolio projects",
  itemListElement: portfolioProjects.map((project, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "WebSite",
      "@id": `${project.url}#website`,
      name: project.name,
      url: project.url,
      description: project.description,
      contributor: {
        "@id": `${SITE_URL}/#kerols-badr`,
      },
    },
  })),
});

const buildStructuredData = (locale: Locale, canonicalUrl: string, pageTitle: string, pageDescription: string) => {
  const localeData = seoByLocale[locale];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        alternateName: BRAND_ALTERNATES,
        inLanguage: ["it", "en", "ar"],
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#kerols-badr`,
        name: "Kerols Badr",
        alternateName: ["كيرلس بدر", "Kerolos Badr", "Krrish"],
        jobTitle: "Software Engineer & Server Admin",
        url: `${SITE_URL}/`,
        image: OG_IMAGE,
        email: `mailto:${CONTACT_EMAIL}`,
        telephone: PHONE_E164,
        sameAs: [GITHUB_URL, LINKEDIN_URL],
        knowsAbout,
        subjectOf: {
          "@id": `${SITE_URL}/#portfolio`,
        },
        worksFor: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: BRAND_ALTERNATES,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/favicon.svg`,
        image: OG_IMAGE,
        email: CONTACT_EMAIL,
        telephone: PHONE_E164,
        sameAs: [GITHUB_URL, LINKEDIN_URL],
        founder: {
          "@id": `${SITE_URL}/#kerols-badr`,
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: CONTACT_EMAIL,
            telephone: PHONE_E164,
            availableLanguage: ["Arabic", "English", "Italian"],
          },
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#professional-service`,
        name: SITE_NAME,
        alternateName: BRAND_ALTERNATES,
        url: `${SITE_URL}/`,
        image: OG_IMAGE,
        logo: `${SITE_URL}/favicon.svg`,
        telephone: PHONE_E164,
        description: pageDescription,
        founder: {
          "@id": `${SITE_URL}/#kerols-badr`,
        },
        areaServed: "Worldwide",
        availableLanguage: ["ar", "en", "it"],
        serviceType: serviceTypes,
        subjectOf: {
          "@id": `${SITE_URL}/#portfolio`,
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Web development, server administration, and deployment services",
          itemListElement: serviceTypes.map((serviceName) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: serviceName,
              provider: {
                "@id": `${SITE_URL}/#organization`,
              },
            },
          })),
        },
      },
      buildPortfolioItemList(),
      {
        "@type": "ProfilePage",
        "@id": `${canonicalUrl}#profile-page`,
        url: canonicalUrl,
        name: localeData.profileName,
        headline: pageTitle,
        description: pageDescription,
        inLanguage: localeData.lang,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        hasPart: {
          "@id": `${SITE_URL}/#portfolio`,
        },
        breadcrumb: {
          "@id": `${canonicalUrl}#breadcrumb`,
        },
        mainEntity: {
          "@id": `${SITE_URL}/#kerols-badr`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: buildBreadcrumb(locale, canonicalUrl),
      },
    ],
  };
};

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();
  const canonicalPath = getCanonicalPath(loc.url.pathname);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const isAdminRoute = loc.url.pathname.startsWith("/admin");
  const locale = getLocaleFromPath(loc.url.pathname);
  const localeData = seoByLocale[locale];

  const hasMeta = (attribute: "name" | "property", value: string) =>
    head.meta.some((meta) => (meta as Record<string, unknown>)[attribute] === value);

  const pageTitle = head.title || localeData.title;
  const pageDescription = getHeadMetaContent(head.meta, "name", "description") || localeData.description;
  const pageKeywords = getHeadMetaContent(head.meta, "name", "keywords") || localeData.keywords;
  const ogDescription = getHeadMetaContent(head.meta, "property", "og:description") || pageDescription;
  const structuredData = buildStructuredData(locale, canonicalUrl, pageTitle, pageDescription);

  return (
    <>
      <title>{pageTitle}</title>

      <link rel="canonical" href={canonicalUrl} />
      {!isAdminRoute &&
        alternateLocales.map((item) => (
          <link key={item.hreflang} rel="alternate" hreflang={item.hreflang} href={item.href} />
        ))}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#0f172a" />
      <meta name="color-scheme" content="dark light" />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="robots" content={isAdminRoute ? "noindex, nofollow, noarchive" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={isAdminRoute ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="author" content="Kerols Badr" />
      <meta name="publisher" content={SITE_NAME} />
      {!hasMeta("name", "description") && <meta name="description" content={pageDescription} />}
      {!hasMeta("name", "keywords") && <meta name="keywords" content={pageKeywords} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={isAdminRoute ? "website" : "profile"} />
      <meta property="og:url" content={canonicalUrl} />
      {!hasMeta("property", "og:title") && <meta property="og:title" content={pageTitle} />}
      {!hasMeta("property", "og:description") && <meta property="og:description" content={ogDescription} />}
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:secure_url" content={OG_IMAGE} />
      <meta property="og:image:type" content="image/svg+xml" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Krrish IT Service logo" />
      <meta property="og:locale" content={localeData.ogLocale} />
      <meta property="og:locale:alternate" content="it_IT" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="ar_EG" />
      <meta property="profile:first_name" content="Kerols" />
      <meta property="profile:last_name" content="Badr" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content="Krrish IT Service logo" />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={ARABIC_FONT_URL} />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/favicon.svg" />
      <link rel="preload" as="image" href="/og-image.svg" />

      {!isAdminRoute && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={JSON.stringify(structuredData)}
        />
      )}

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.style })}
        />
      ))}

      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
    </>
  );
});

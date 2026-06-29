import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

const SITE_URL = "https://krrish.it";
const SITE_NAME = "Krrish IT Service";
const DEFAULT_TITLE = "Krrish IT Service | Kerols Badr - Sviluppatore Web Full Stack";
const DEFAULT_DESCRIPTION =
  "Kerols Badr realizza siti web, applicazioni moderne, dashboard e soluzioni server sicure per aziende e professionisti.";
const DEFAULT_KEYWORDS =
  "Krrish IT, Kerols Badr, sviluppatore web, software engineer, full-stack developer, Node.js, PHP Laravel, server Linux, DevOps";
const OG_IMAGE = `${SITE_URL}/og-image.svg`;
const ARABIC_FONT_URL = "https://fonts.googleapis.com/css2?family=Noto+" + "Kufi+Arabic:wght@400;500;600;700;800&display=swap";

const alternateLocales = [
  { hreflang: "it-IT", href: `${SITE_URL}/` },
  { hreflang: "en", href: `${SITE_URL}/en/` },
  { hreflang: "ar", href: `${SITE_URL}/ar/` },
  { hreflang: "x-default", href: `${SITE_URL}/` },
];

const getOgLocale = (pathname: string) => {
  if (pathname.startsWith("/ar")) return "ar_EG";
  if (pathname.startsWith("/en")) return "en_US";
  return "it_IT";
};

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();
  const canonicalUrl = new URL(loc.url.pathname, SITE_URL).href;
  const isAdminRoute = loc.url.pathname.startsWith("/admin");
  const ogLocale = getOgLocale(loc.url.pathname);

  const hasMeta = (attribute: "name" | "property", value: string) =>
    head.meta.some((meta) => (meta as Record<string, unknown>)[attribute] === value);

  const pageTitle = head.title || DEFAULT_TITLE;

  return (
    <>
      <title>{pageTitle}</title>

      <link rel="canonical" href={canonicalUrl} />
      {!isAdminRoute &&
        alternateLocales.map((item) => (
          <link key={item.hreflang} rel="alternate" hrefLang={item.hreflang} href={item.href} />
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
      {!hasMeta("name", "description") && <meta name="description" content={DEFAULT_DESCRIPTION} />}
      {!hasMeta("name", "keywords") && <meta name="keywords" content={DEFAULT_KEYWORDS} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={isAdminRoute ? "website" : "profile"} />
      <meta property="og:url" content={canonicalUrl} />
      {!hasMeta("property", "og:title") && <meta property="og:title" content={pageTitle} />}
      {!hasMeta("property", "og:description") && <meta property="og:description" content={DEFAULT_DESCRIPTION} />}
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:secure_url" content={OG_IMAGE} />
      <meta property="og:image:type" content="image/svg+xml" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Krrish IT Service logo" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content="it_IT" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="ar_EG" />
      <meta property="profile:first_name" content="Kerols" />
      <meta property="profile:last_name" content="Badr" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content="Krrish IT Service logo" />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={ARABIC_FONT_URL} />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/favicon.svg" />
      <link rel="preload" as="image" href="/og-image.svg" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: SITE_NAME,
          url: SITE_URL,
          image: OG_IMAGE,
          logo: `${SITE_URL}/favicon.svg`,
          description: DEFAULT_DESCRIPTION,
          founder: {
            "@type": "Person",
            name: "Kerols Badr",
            jobTitle: "Software Engineer & Server Admin",
            url: SITE_URL,
            sameAs: ["https://github.com/Krrish-dev"],
          },
          areaServed: ["Italy", "Egypt", "Worldwide"],
          availableLanguage: ["ar", "en", "it"],
          serviceType: [
            "Full-Stack Web Development",
            "Server Administration",
            "Linux Server Management",
            "DevOps Deployment",
            "Node.js Development",
            "PHP Laravel Development",
          ],
        })}
      />

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

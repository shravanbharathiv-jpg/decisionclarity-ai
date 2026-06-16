import { useEffect } from "react";

type SeoOptions = {
  title: string;
  description: string;
  canonicalPath?: string; // e.g. "/blog/foo"
  keywords?: string;
  ogType?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const upsertMeta = (selector: string, create: () => HTMLElement) => {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

export function useSeo({
  title,
  description,
  canonicalPath,
  keywords,
  ogType = "website",
  jsonLd,
}: SeoOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const setName = (name: string, content: string) => {
      const el = upsertMeta(`meta[name="${name}"]`, () => {
        const m = document.createElement("meta");
        m.setAttribute("name", name);
        return m;
      });
      el.setAttribute("content", content);
    };
    const setProp = (prop: string, content: string) => {
      const el = upsertMeta(`meta[property="${prop}"]`, () => {
        const m = document.createElement("meta");
        m.setAttribute("property", prop);
        return m;
      });
      el.setAttribute("content", content);
    };

    setName("description", description);
    if (keywords) setName("keywords", keywords);

    setProp("og:title", title);
    setProp("og:description", description);
    setProp("og:type", ogType);

    setName("twitter:title", title);
    setName("twitter:description", description);

    const path = canonicalPath ?? window.location.pathname;
    const absolute = `${window.location.origin}${path}`;

    let canonical = document.head.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", absolute);
    setProp("og:url", absolute);

    // JSON-LD (scoped via data attribute so we can clean up)
    const jsonLdNodes: HTMLScriptElement[] = [];
    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      items.forEach((data) => {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.setAttribute("data-seo-hook", "1");
        s.textContent = JSON.stringify(data);
        document.head.appendChild(s);
        jsonLdNodes.push(s);
      });
    }

    return () => {
      document.title = prevTitle;
      jsonLdNodes.forEach((n) => n.remove());
    };
  }, [title, description, canonicalPath, keywords, ogType, JSON.stringify(jsonLd)]);
}

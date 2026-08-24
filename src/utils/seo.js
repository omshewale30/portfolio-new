import { useEffect } from "react";

const SITE_NAME = "Om Shewale";
const SITE_URL = "https://omshewale.me";
const DEFAULT_IMAGE = `${SITE_URL}/assets/Hero.webp`;
const EMPTY_TAGS = [];

const setMeta = (selector, attribute, value) => {
  let element = document.head.querySelector(selector);
  const created = !element;

  if (!element) {
    element = document.createElement("meta");
    const [key, keyValue] = attribute;
    element.setAttribute(key, keyValue);
    document.head.appendChild(element);
  }

  const previous = element.getAttribute("content");
  element.setAttribute("content", value);

  return () => {
    if (created) element.remove();
    else if (previous === null) element.removeAttribute("content");
    else element.setAttribute("content", previous);
  };
};

export const usePageMetadata = ({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  publishedAt,
  tags = EMPTY_TAGS,
}) => {
  useEffect(() => {
    const previousTitle = document.title;
    const url = `${SITE_URL}${path}`;
    const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`;
    const restorers = [
      setMeta('meta[name="description"]', ["name", "description"], description),
      setMeta('meta[property="og:title"]', ["property", "og:title"], title),
      setMeta('meta[property="og:description"]', ["property", "og:description"], description),
      setMeta('meta[property="og:image"]', ["property", "og:image"], imageUrl),
      setMeta('meta[property="og:type"]', ["property", "og:type"], type),
      setMeta('meta[property="og:url"]', ["property", "og:url"], url),
      setMeta('meta[name="twitter:title"]', ["name", "twitter:title"], title),
      setMeta('meta[name="twitter:description"]', ["name", "twitter:description"], description),
      setMeta('meta[name="twitter:image"]', ["name", "twitter:image"], imageUrl),
    ];

    document.title = title;

    let canonical = document.head.querySelector('link[rel="canonical"]');
    const canonicalCreated = !canonical;
    const previousCanonical = canonical?.getAttribute("href");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    if (publishedAt) {
      restorers.push(
        setMeta(
          'meta[property="article:published_time"]',
          ["property", "article:published_time"],
          publishedAt,
        ),
      );
    }

    tags.forEach((tag) => {
      const element = document.createElement("meta");
      element.setAttribute("property", "article:tag");
      element.setAttribute("content", tag);
      element.dataset.noteMetadata = "true";
      document.head.appendChild(element);
    });

    return () => {
      document.title = previousTitle;
      restorers.reverse().forEach((restore) => restore());
      document.head.querySelectorAll('[data-note-metadata="true"]').forEach((element) => element.remove());

      if (canonicalCreated) canonical.remove();
      else if (previousCanonical === null) canonical.removeAttribute("href");
      else canonical.setAttribute("href", previousCanonical);
    };
  }, [description, image, path, publishedAt, tags, title, type]);
};

export const notePageTitle = (title) => `${title} — ${SITE_NAME}`;

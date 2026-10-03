import { socials } from "../data/contact";

const links = [socials.github, socials.linkedin, socials.instagram];

const SiteFooter = () => (
  <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]">
    <div className="mx-auto flex max-w-[var(--container-max)] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-5 font-mono text-[11px] text-[var(--color-text-meta)] sm:px-6 lg:px-12">
      <span className="mr-auto">om.shewale / {new Date().getFullYear()}</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-[var(--color-text-primary)]"
        >
          {link.label}
        </a>
      ))}
    </div>
  </footer>
);

export default SiteFooter;

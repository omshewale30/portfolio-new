import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { preferredScrollBehavior, scrollToJarvis } from "../utils/scroll.js";
import { useScrollSpy } from "../utils/scrollSpy.js";

const RESUME_URL = "https://drive.google.com/file/d/12nH9Tl4pyx8Wt3Y0S9YGngcIMR5IAsix/view?usp=sharing";

// Home sections the nav tracks while scrolling. Only "jarvis" has a nav item; reaching
// "selected-work" just marks that the reader has scrolled past Jarvis, clearing its highlight.
const HOME_SECTIONS = ["jarvis", "selected-work"];

// `spy` is the home section in view (null elsewhere).
const NAV_ITEMS = [
  { label: "projects", to: "/projects", match: (path) => path === "/projects" || path.startsWith("/work/") },
  { label: "notes", to: "/notes", match: (path) => path.startsWith("/notes") },
  { label: "experience", to: "/experience", match: (path) => path === "/experience" },
  { label: "jarvis", section: "jarvis", match: (path, spy) => spy === "jarvis" },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef(null);
  const onHome = location.pathname === "/";
  const spiedSection = useScrollSpy(HOME_SECTIONS, { enabled: onHome });
  const activeSection = onHome ? spiedSection : null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Escape closes the mobile menu and hands focus back to its toggle.
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleKey = (event) => {
      if (event.key !== "Escape") return;
      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMenuOpen]);

  const goToSection = (sectionId) => {
    setIsMenuOpen(false);
    if (!onHome) {
      navigate("/", { state: { scrollTo: sectionId } });
      return;
    }
    if (sectionId === "jarvis") {
      scrollToJarvis();
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
  };

  const goHome = (event) => {
    setIsMenuOpen(false);
    if (location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
    }
  };

  const renderItem = (item, className) => {
    const active = item.match(location.pathname, activeSection);
    if (item.section) {
      return (
        <a
          href={`/#${item.section}`}
          onClick={(event) => {
            event.preventDefault();
            goToSection(item.section);
          }}
          aria-current={active ? "page" : undefined}
          className={className}
        >
          {item.label}
        </a>
      );
    }
    return (
      <Link to={item.to} aria-current={active ? "page" : undefined} className={className}>
        {item.label}
      </Link>
    );
  };

  const barIsSolid = scrolled || isMenuOpen;

  return (
    <header
      className="site-nav fixed inset-x-0 top-0 z-[1050] border-b transition-colors duration-300"
      style={{
        background: barIsSolid ? "var(--color-bg-base)" : "transparent",
        borderColor: barIsSolid ? "var(--color-border-subtle)" : "transparent",
      }}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[var(--container-max)] items-center gap-7 px-4 py-4 text-[13px] sm:px-6 lg:px-12 lg:py-5"
      >
        <Link
          to="/"
          onClick={goHome}
          className="mr-auto font-mono text-[13px] text-[var(--color-text-meta)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          om.shewale/
        </Link>

        <ul className="m-0 hidden list-none items-center gap-7 p-0 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>{renderItem(item, "nav-link")}</li>
          ))}
          <li>
            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="nav-link">
              resume
            </a>
          </li>
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="nav-icon-btn"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="nav-icon-btn md:!hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {isMenuOpen ? (
        <ul
          id="mobile-navigation"
          className="menu-enter m-0 flex list-none flex-col border-t border-[var(--color-border-subtle)] px-4 py-2 sm:px-6 md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {renderItem(item, "nav-link flex min-h-11 items-center text-[15px]")}
            </li>
          ))}
          <li>
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link flex min-h-11 items-center text-[15px]"
            >
              resume
            </a>
          </li>
        </ul>
      ) : null}
    </header>
  );
};

export default Header;

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const RESUME_URL = "https://drive.google.com/file/d/12nH9Tl4pyx8Wt3Y0S9YGngcIMR5IAsix/view?usp=sharing";

const preferredScrollBehavior = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const NAV_ITEMS = [
  { label: "work", section: "selected-work", match: (path) => path === "/projects" || path.startsWith("/work/") },
  { label: "notes", to: "/notes", match: (path) => path.startsWith("/notes") },
  { label: "experience", to: "/experience", match: (path) => path === "/experience" },
  { label: "jarvis", section: "jarvis", match: () => false },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const xRef = useRef(null);
  const yRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Live cursor coordinates, written straight to the DOM so the nav never re-renders on pointer move.
  useEffect(() => {
    const handlePointer = (event) => {
      if (xRef.current) xRef.current.textContent = (event.clientX / window.innerWidth).toFixed(2);
      if (yRef.current) yRef.current.textContent = (event.clientY / window.innerHeight).toFixed(2);
    };
    window.addEventListener("pointermove", handlePointer, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointer);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const goToSection = (sectionId) => {
    setIsMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
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
    const active = item.match(location.pathname);
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

        <span
          aria-hidden="true"
          className="hidden gap-2.5 pl-4 font-mono text-[11px] text-[var(--color-text-meta)] lg:flex"
        >
          x <span ref={xRef} className="inline-block w-[34px]">0.00</span>
          y <span ref={yRef} className="inline-block w-[34px]">0.00</span>
        </span>

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
          className="m-0 flex list-none flex-col border-t border-[var(--color-border-subtle)] px-4 py-2 sm:px-6 md:hidden"
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

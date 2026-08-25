import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const preferredScrollBehavior = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      
      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 10) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 10) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
    }
  };

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    if (path.startsWith("#")) {
      const sectionId = path.slice(1);
      if (location.pathname !== "/") {
        navigate("/", { state: { scrollTo: sectionId }, replace: false });
      } else {
        scrollToSection(sectionId);
      }
    } else if (path === "/") {
      if (location.pathname !== "/") navigate("/");
      window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
    } else {
      if (location.pathname !== path) navigate(path);
    }
  };

  const toggleDropdown = () => {
    if (isMobileView) setIsDropdownOpen((prev) => !prev);
  };

  return (
    <nav
      className={`navbar-bar fixed left-1/2 top-4 z-[1050] flex w-auto max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center rounded-full border px-5 py-3 backdrop-saturate-[1.8] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:top-3 md:min-w-[480px] md:max-w-[calc(100vw-2rem)] md:rounded-[22px] md:px-5 md:py-4 ${
        scrolled ? "backdrop-blur-[20px]" : "backdrop-blur-[24px]"
      } ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
      style={{
        borderColor: scrolled ? "var(--color-nav-border-scrolled)" : "var(--color-nav-border)",
        background: scrolled ? "var(--color-nav-bg-scrolled)" : "var(--color-nav-bg)",
        boxShadow: scrolled ? "var(--color-nav-shadow-scrolled)" : "var(--color-nav-shadow)",
      }}
    >
      <div className="flex w-full items-center justify-between md:justify-center">
        <div
          className={`flex w-auto flex-row items-center gap-2 border-0 bg-transparent opacity-100 transition-all duration-300 ${
            isMobileMenuOpen
              ? "flex max-md:absolute max-md:left-1/2 max-md:top-[calc(100%+0.75rem)] max-md:w-[280px] max-md:max-w-[calc(100vw-2rem)] max-md:-translate-x-1/2 max-md:flex-col max-md:rounded-2xl max-md:border max-md:p-3 max-md:backdrop-blur-[24px] max-md:backdrop-saturate-[1.8]"
              : "hidden"
          } md:flex`}
          id="navbarNav"
          style={
            isMobileMenuOpen
              ? {
                  borderColor: "var(--color-nav-toggle-border)",
                  backgroundColor: "var(--color-nav-dropdown-bg)",
                  boxShadow: "var(--color-nav-dropdown-shadow)",
                }
              : undefined
          }
        >
          <ul className="flex flex-row items-center gap-2 max-md:w-full max-md:flex-col max-md:items-stretch max-md:gap-1.5 max-md:p-3 md:min-h-0 md:flex-row lg:gap-3">
            <li
              className={`relative ${isDropdownOpen ? "show" : ""}`}
              onMouseEnter={() => !isMobileView && setIsDropdownOpen(true)}
              onMouseLeave={() => !isMobileView && setIsDropdownOpen(false)}
              onFocus={() => !isMobileView && setIsDropdownOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setIsDropdownOpen(false);
              }}
            >
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  if (isMobileView) toggleDropdown();
                  else handleNavigation("/");
                }}
                aria-expanded={isDropdownOpen}
                aria-controls="home-navigation-menu"
                className="nav-link-glass nav-item-warm relative flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !text-[var(--color-text-muted)] !no-underline transition-all duration-300 max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:inline-flex md:w-auto md:text-[1.2rem]"
                style={{ padding: "0.75rem 1rem" }}
              >
                Home
              </a>
              <div
                id="home-navigation-menu"
                className={`${isDropdownOpen ? "show" : ""} ${
                  isMobileView
                    ? "static mt-1 flex flex-col gap-1 rounded-xl border-0 p-4 shadow-none"
                    : `absolute left-1/2 top-full z-[1051] min-w-[220px] -translate-x-1/2 flex flex-col gap-1 rounded-2xl border pt-4 px-5 pb-4 backdrop-blur-[24px] backdrop-saturate-[1.8] transition-all duration-300 ${isDropdownOpen ? "block opacity-100 translate-y-0" : "hidden opacity-0 -translate-y-2"}`
                }`}
                style={
                  isMobileView
                    ? { backgroundColor: "var(--color-nav-toggle-bg)" }
                    : {
                        borderColor: "var(--color-nav-toggle-border)",
                        background: "var(--color-nav-dropdown-gradient)",
                        boxShadow: "var(--color-nav-dropdown-shadow)",
                      }
                }
              >
                {[
                  ["#about", "About Me"],
                  ["#education", "Education"],
                  ["#contact", "Contact"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={`/${href}`}
                    className="nav-item-warm block rounded-lg px-5 py-3.5 font-mono text-[1.05rem] uppercase tracking-[0.06em] !text-[var(--color-text-subtle)] !no-underline transition-all duration-200"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(href);
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </li>
            <li>
              <a
                href="/experience"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavigation("/experience");
                }}
                aria-current={location.pathname === "/experience" ? "page" : undefined}
                className={`nav-item-warm flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !no-underline transition-all duration-300 max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:text-[1.2rem] ${
                  location.pathname === "/experience"
                    ? "nav-item-warm-active font-semibold !text-[var(--color-primary)]"
                    : "!text-[var(--color-text-muted)]"
                }`}
                style={{ padding: "0.75rem 1rem" }}
              >
                Experience
              </a>
            </li>
            <li>
              <a
                href="/projects"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavigation("/projects");
                }}
                aria-current={location.pathname === "/projects" ? "page" : undefined}
                className={`nav-item-warm relative flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !no-underline transition-all duration-300 max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:text-[1.2rem] ${
                  location.pathname === "/projects"
                    ? "nav-item-warm-active font-semibold !text-[var(--color-primary)]"
                    : "!text-[var(--color-text-muted)]"
                }`}
                style={{ padding: "0.75rem 1rem" }}
              >
                Projects
              </a>
            </li>
            <li>
              <a
                href="/notes"
                onClick={(event) => {
                  event.preventDefault();
                  handleNavigation("/notes");
                }}
                aria-current={location.pathname.startsWith("/notes") ? "page" : undefined}
                className={`nav-item-warm relative flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !no-underline transition-all duration-300 max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:text-[1.2rem] ${
                  location.pathname.startsWith("/notes")
                    ? "nav-item-warm-active font-semibold !text-[var(--color-primary)]"
                    : "!text-[var(--color-text-muted)]"
                }`}
                style={{ padding: "0.75rem 1rem" }}
              >
                Notes
              </a>
            </li>
            <li>
              <a
                href="https://drive.google.com/file/d/12nH9Tl4pyx8Wt3Y0S9YGngcIMR5IAsix/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link-glass nav-item-warm flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !text-[var(--color-text-muted)] !no-underline transition-all duration-300 max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:text-[1.2rem]"
                style={{ padding: "0.75rem 1rem" }}
              >
                Resume
              </a>
            </li>
            <li>
              <a
                href="/#jarvis"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("#jarvis");
                }}
                className="nav-link-glass nav-item-warm group flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !text-[var(--color-text-muted)] !no-underline transition-all duration-300 max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:text-[1.2rem]"
                style={{ padding: "0.75rem 1rem" }}
              >
                Jarvis
              </a>
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="nav-icon-btn ml-auto shrink-0 md:ml-2"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="nav-icon-btn ml-1 shrink-0 md:!hidden"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="navbarNav"
        >
          <span
            className={`relative block h-0.5 w-[22px] transition-all duration-300 ${
              isMobileMenuOpen
                ? "bg-transparent before:top-0 before:rotate-45 after:top-0 after:-rotate-45"
                : "bg-[var(--color-text-subtle)]"
            } before:absolute before:left-0 before:top-[-6px] before:block before:h-0.5 before:w-[22px] before:bg-[var(--color-text-subtle)] before:transition-all before:duration-300 after:absolute after:left-0 after:top-[6px] after:block after:h-0.5 after:w-[22px] after:bg-[var(--color-text-subtle)] after:transition-all after:duration-300`}
            aria-hidden
          />
        </button>
      </div>
    </nav>
  );
};

export default Header;

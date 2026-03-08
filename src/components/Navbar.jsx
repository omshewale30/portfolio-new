import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    if (path.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const sectionId = path.slice(1);
          const section = document.getElementById(sectionId);
          const navbar = document.querySelector("nav");
          if (section && navbar) {
            window.scrollTo({ top: section.offsetTop - navbar.offsetHeight, behavior: "smooth" });
          }
        }, 100);
      } else {
        const sectionId = path.slice(1);
        const section = document.getElementById(sectionId);
        const navbar = document.querySelector("nav");
        if (section && navbar) {
          window.scrollTo({ top: section.offsetTop - navbar.offsetHeight, behavior: "smooth" });
        }
      }
    } else if (path === "/") {
      if (location.pathname !== "/") navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (location.pathname !== path) navigate(path);
    }
  };

  const toggleDropdown = () => {
    if (isMobileView) setIsDropdownOpen((prev) => !prev);
  };

  return (
    <nav
      className={`fixed left-1/2 top-4 z-[1050] flex w-auto max-w-[calc(100%-2rem)] -translate-x-1/2 items-center rounded-full border px-6 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:top-3 md:rounded-[20px] md:px-4 md:py-2 ${
        scrolled
          ? "border-[var(--color-border-subtle)] bg-[rgba(22,18,13,0.92)] py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-[12px] md:py-2"
          : "border-[var(--color-border-subtle)] bg-[rgba(30,24,16,0.78)] py-2.5 backdrop-blur-[20px]"
      }`}
    >
      <div className="flex w-full items-center justify-between md:justify-center">
        <div
          className={`flex w-auto flex-row items-center gap-2 border-0 bg-transparent opacity-100 ${
            isMobileMenuOpen
              ? "flex max-md:absolute max-md:left-1/2 max-md:top-[calc(100%+0.75rem)] max-md:w-[280px] max-md:max-w-[calc(100vw-2rem)] max-md:-translate-x-1/2 max-md:flex-col max-md:rounded-2xl max-md:border max-md:border-[var(--color-border-subtle)] max-md:bg-[rgba(22,18,13,0.95)] max-md:p-3 max-md:shadow-[0_8px_20px_rgba(0,0,0,0.35)] max-md:backdrop-blur-[20px]"
              : "hidden"
          } md:flex`}
          id="navbarNav"
        >
          <ul className="flex flex-row items-center gap-2 max-md:w-full max-md:flex-col max-md:items-stretch max-md:gap-1 max-md:p-3 md:flex-row md:gap-2 md:min-h-0">
            <li
              className={`relative ${isDropdownOpen ? "show" : ""}`}
              onMouseEnter={() => !isMobileView && setIsDropdownOpen(true)}
              onMouseLeave={() => !isMobileView && setIsDropdownOpen(false)}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (isMobileView) toggleDropdown();
                }}
                className="nav-link-warm relative flex items-center justify-center rounded-[25px] px-4 py-2 text-[0.9rem] font-medium leading-none !text-[var(--color-text-muted)] !no-underline transition-all duration-300 hover:bg-[var(--color-border-muted)] hover:!text-[var(--color-primary)] max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:inline-flex md:w-auto"
              >
                Home
              </a>
              <div
                className={`${isDropdownOpen ? "show" : ""} ${
                  isMobileView
                    ? "static mt-1 block border-0 bg-[var(--color-border-muted)] p-2 shadow-none"
                    : `absolute left-1/2 top-[calc(100%+0.5rem)] z-[1051] min-w-[180px] -translate-x-1/2 rounded-2xl border border-[var(--color-border-subtle)] bg-[rgba(30,24,16,0.96)] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-[20px] ${isDropdownOpen ? "block" : "hidden"}`
                }`}
              >
                {[
                  ["#about", "About Me"],
                  ["#education", "Education"],
                  ["#timeline", "Timeline"],
                  ["#skills", "Skills"],
                  ["#contact", "Contact"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="mb-1 mt-1 block rounded-lg px-4 py-2.5 font-mono text-[0.78rem] uppercase tracking-[0.08em] !text-[var(--color-text-subtle)] !no-underline transition-all duration-200 hover:bg-[var(--color-border-muted)] hover:!text-[var(--color-primary)]"
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
                href="#"
                onClick={() => handleNavigation("/experience")}
                className={`flex items-center justify-center rounded-[25px] px-4 py-2 text-[0.9rem] font-medium leading-none !no-underline transition-all duration-300 max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 ${
                  location.pathname === "/experience"
                    ? "bg-[var(--color-border-muted)] font-semibold !text-[var(--color-primary)]"
                    : "!text-[var(--color-text-muted)] hover:bg-[var(--color-border-muted)] hover:!text-[var(--color-primary)]"
                }`}
              >
                Experience
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => handleNavigation("/projects")}
                className={`relative flex items-center justify-center rounded-[25px] px-4 py-2 text-[0.9rem] font-medium leading-none !no-underline transition-all duration-300 max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 ${
                  location.pathname === "/projects"
                    ? "bg-[var(--color-border-muted)] font-semibold !text-[var(--color-primary)]"
                    : "!text-[var(--color-text-muted)] hover:bg-[var(--color-border-muted)] hover:!text-[var(--color-primary)]"
                }`}
              >
                Projects
              </a>
            </li>
            <li>
              <a
                href="/Docs/Om_Shewale.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link-warm flex items-center justify-center rounded-[25px] px-4 py-2 text-[0.9rem] font-medium leading-none !text-[var(--color-text-muted)] !no-underline transition-all duration-300 hover:bg-[var(--color-border-muted)] hover:!text-[var(--color-primary)] max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3"
              >
                Resume
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.assign("https://jarvis-interface.vercel.app/");
                }}
                className="nav-link-warm flex items-center justify-center rounded-[25px] px-4 py-2 text-[0.9rem] font-medium leading-none !text-[var(--color-text-muted)] !no-underline transition-all duration-300 hover:bg-[var(--color-border-muted)] hover:!text-[var(--color-primary)] max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3"
              >
                Jarvis
              </a>
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="ml-auto border-0 bg-transparent p-2 shadow-none outline-none focus:shadow-none md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className="relative block h-0.5 w-[22px] bg-[var(--color-text-subtle)] transition-all duration-300 before:absolute before:left-0 before:top-[-6px] before:block before:h-0.5 before:w-[22px] before:bg-[var(--color-text-subtle)] before:transition-all before:duration-300 after:absolute after:left-0 after:top-[6px] after:block after:h-0.5 after:w-[22px] after:bg-[var(--color-text-subtle)] after:transition-all after:duration-300"
            aria-hidden
          />
        </button>
      </div>
    </nav>
  );
};

export default Header;

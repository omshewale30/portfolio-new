import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
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
      section.scrollIntoView({ behavior: "smooth", block: "start" });
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
      className={`navbar-bar fixed left-1/2 top-4 z-[1050] flex w-auto max-w-[calc(100%-2rem)] -translate-x-1/2 items-center rounded-full px-10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:top-3 md:min-w-[480px] md:w-auto md:max-w-[min(56vw,900px)] md:rounded-[22px] md:px-10 ${
        scrolled
          ? "border border-[rgba(255,255,255,0.08)] bg-[rgba(22,18,13,0.85)] py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[20px] backdrop-saturate-[1.8] md:py-4"
          : "border border-[rgba(255,255,255,0.06)] bg-[rgba(30,24,16,0.6)] py-3 shadow-[0_4px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[24px] backdrop-saturate-[1.5] md:py-4"
      } ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
      style={{
        background: scrolled
          ? "linear-gradient(135deg, rgba(22,18,13,0.88) 0%, rgba(30,24,16,0.82) 100%)"
          : "linear-gradient(135deg, rgba(30,24,16,0.65) 0%, rgba(22,18,13,0.55) 100%)",
      }}
    >
      <div className="flex w-full items-center justify-between md:justify-center">
        <div
          className={`flex w-auto flex-row items-center gap-2 border-0 bg-transparent opacity-100 transition-all duration-300 ${
            isMobileMenuOpen
              ? "flex max-md:absolute max-md:left-1/2 max-md:top-[calc(100%+0.75rem)] max-md:w-[280px] max-md:max-w-[calc(100vw-2rem)] max-md:-translate-x-1/2 max-md:flex-col max-md:rounded-2xl max-md:border max-md:border-[rgba(255,255,255,0.08)] max-md:bg-[rgba(22,18,13,0.92)] max-md:p-3 max-md:shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] max-md:backdrop-blur-[24px] max-md:backdrop-saturate-[1.8]"
              : "hidden"
          } md:flex`}
          id="navbarNav"
        >
          <ul className="flex flex-row items-center gap-5 max-md:w-full max-md:flex-col max-md:items-stretch max-md:gap-1.5 max-md:p-3 md:flex-row md:gap-5 md:min-h-0">
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
                className="nav-link-glass relative flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !text-[var(--color-text-muted)] !no-underline transition-all duration-300 hover:bg-[rgba(255,255,255,0.06)] hover:!text-[var(--color-primary)] hover:shadow-[inset_0_0_0_1px_rgba(200,168,130,0.15)] max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:inline-flex md:w-auto md:text-[1.2rem]"
                style={{ padding: "0.875rem 1.5rem" }}
              >
                Home
              </a>
              <div
                className={`${isDropdownOpen ? "show" : ""} ${
                  isMobileView
                    ? "static mt-1 flex flex-col gap-1 rounded-xl border-0 bg-[rgba(255,255,255,0.04)] p-4 shadow-none"
                    : `absolute left-1/2 top-full z-[1051] min-w-[220px] -translate-x-1/2 flex flex-col gap-1 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(22,18,13,0.92)] pt-4 px-5 pb-4 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[24px] backdrop-saturate-[1.8] transition-all duration-300 ${isDropdownOpen ? "block opacity-100 translate-y-0" : "hidden opacity-0 -translate-y-2"}`
                }`}
                style={!isMobileView ? {
                  background: "linear-gradient(180deg, rgba(30,24,16,0.95) 0%, rgba(22,18,13,0.98) 100%)",
                } : {}}
              >
                {[
                  ["#about", "About Me"],
                  ["#education", "Education"],
                  ["#skills", "Skills"],
                  ["#contact", "Contact"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="block rounded-lg px-5 py-3.5 font-mono text-[1.05rem] uppercase tracking-[0.06em] !text-[var(--color-text-subtle)] !no-underline transition-all duration-200 hover:bg-[rgba(255,255,255,0.06)] hover:!text-[var(--color-primary)] hover:shadow-[inset_0_0_0_1px_rgba(200,168,130,0.12)]"
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
                className={`flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !no-underline transition-all duration-300 max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:text-[1.2rem] ${
                  location.pathname === "/experience"
                    ? "bg-[rgba(200,168,130,0.12)] font-semibold !text-[var(--color-primary)] shadow-[inset_0_0_0_1px_rgba(200,168,130,0.2)]"
                    : "!text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:!text-[var(--color-primary)] hover:shadow-[inset_0_0_0_1px_rgba(200,168,130,0.15)]"
                }`}
                style={{ padding: "0.875rem 1.5rem" }}
              >
                Experience
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => handleNavigation("/projects")}
                className={`relative flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !no-underline transition-all duration-300 max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:text-[1.2rem] ${
                  location.pathname === "/projects"
                    ? "bg-[rgba(200,168,130,0.12)] font-semibold !text-[var(--color-primary)] shadow-[inset_0_0_0_1px_rgba(200,168,130,0.2)]"
                    : "!text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:!text-[var(--color-primary)] hover:shadow-[inset_0_0_0_1px_rgba(200,168,130,0.15)]"
                }`}
                style={{ padding: "0.875rem 1.5rem" }}
              >
                Projects
              </a>
            </li>
            <li>
              <a
                href="https://drive.google.com/file/d/12nH9Tl4pyx8Wt3Y0S9YGngcIMR5IAsix/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link-glass flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !text-[var(--color-text-muted)] !no-underline transition-all duration-300 hover:bg-[rgba(255,255,255,0.06)] hover:!text-[var(--color-primary)] hover:shadow-[inset_0_0_0_1px_rgba(200,168,130,0.15)] max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:text-[1.2rem]"
                style={{ padding: "0.875rem 1.5rem" }}
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
                className="nav-link-glass group flex items-center justify-center rounded-[25px] text-[1.05rem] font-medium leading-none !text-[var(--color-text-muted)] !no-underline transition-all duration-300 hover:bg-[rgba(255,255,255,0.06)] hover:!text-[var(--color-primary)] hover:shadow-[inset_0_0_0_1px_rgba(200,168,130,0.15)] max-md:w-full max-md:justify-start max-md:rounded-[10px] max-md:px-4 max-md:py-3 md:text-[1.2rem]"
                style={{ padding: "0.875rem 1.5rem" }}
              >
                Jarvis
              </a>
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="ml-auto rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-2.5 shadow-none outline-none transition-all duration-300 hover:border-[rgba(200,168,130,0.2)] hover:bg-[rgba(255,255,255,0.08)] focus:shadow-none md:hidden"
          aria-label="Toggle menu"
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


import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";




import '/src/CSS/Navbar.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);

    // Detect if the device is in mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 768);
        };
        handleResize(); // Set initial state
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const navbar = document.querySelector(".navbar");
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleNavigation = (path) => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);

        if (path.startsWith('#')) {
            // If we're not on the home page, navigate there first
            if (location.pathname !== "/") {
                navigate("/");
                // Add a delay to ensure the page has loaded before scrolling
                setTimeout(() => {
                    const sectionId = path.slice(1);
                    const section = document.getElementById(sectionId);
                    if (section) {
                        const navbarHeight = document.querySelector(".navbar").offsetHeight;
                        const scrollPosition = section.offsetTop - navbarHeight;
                        window.scrollTo({ top: scrollPosition, behavior: "smooth" });
                    }
                }, 100);
            } else {
                // If we're already on home page, just scroll to the section
                const sectionId = path.slice(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    const navbarHeight = document.querySelector(".navbar").offsetHeight;
                    const scrollPosition = section.offsetTop - navbarHeight;
                    window.scrollTo({ top: scrollPosition, behavior: "smooth" });
                }
            }
        } else if (path === "/") {
            // Handle home navigation
            if (location.pathname !== "/") {
                navigate("/");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            // Handle other routes
            if (location.pathname !== path) {
                navigate(path);
            }
        }
    };

    const toggleDropdown = () => {
        if (isMobileView) {
            setIsDropdownOpen((prev) => !prev);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg bg-light fixed-top shadow-sm">
            <div className="container-fluid">
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div
                    className={`collapse navbar-collapse ${isMobileMenuOpen ? "show" : ""}`}
                    id="navbarNav"
                >
                    <ul className="navbar-nav ms-auto">
                        <li
                            className={`nav-item dropdown ${isDropdownOpen ? "show" : ""}`}
                            onMouseEnter={() => !isMobileView && setIsDropdownOpen(true)}
                            onMouseLeave={() => !isMobileView && setIsDropdownOpen(false)}
                        >
                            <a
                                className="nav-link"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (isMobileView) toggleDropdown();
                                }}
                            >
                                Home
                            </a>
                            <div className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
                                <a
                                    className="dropdown-item"
                                    href="#about"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation("#about");
                                    }}
                                >
                                    About Me
                                </a>
                                <a
                                    className="dropdown-item"
                                    href="#education"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation("#education");
                                    }}
                                >
                                    Education
                                </a>
                                <a
                                    className="dropdown-item"
                                    href="#timeline"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation("#timeline");
                                    }}
                                >
                                    Timeline
                                </a>
                                <a
                                    className="dropdown-item"
                                    href="#skills"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation("#skills");
                                    }}
                                >
                                    Skills
                                </a>
                                <a
                                    className="dropdown-item"
                                    href="#contact"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation("#contact");
                                    }}
                                >
                                    Contact
                                </a>
                            </div>
                        </li>
                        <li className="nav-item">
                            <a
                                className={`nav-link ${location.pathname === "/experience" ? "active" : ""}`}
                                href="#"
                                onClick={() => handleNavigation("/experience")}
                            >
                                Experience
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className={`nav-link ${location.pathname === "/projects" ? "active" : ""}`}
                                href="#"
                                onClick={() => handleNavigation("/projects")}
                            >
                                Projects
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href ="/Docs/Om_Shewale.pdf"
                                target="_blank" // Optional: Opens in a new tab
                                rel="noopener noreferrer" // Security best practice for target="_blank"
                            >
                                Resume
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.assign("https://jarvis-interface.vercel.app/");
                                }}
                            >
                                Jarvis
                            </a>
                        </li>



                    </ul>
                </div>

            </div>
        </nav>
    );
};

export default Header;

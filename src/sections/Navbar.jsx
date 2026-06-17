import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", href: "#home", section: "home" },
  { label: "About", href: "#about", section: "about" },
  { label: "Work", href: "#work", section: "work" },
  { label: "Contact", href: "#contact", section: "contact" },
];

const EASE = [0.16, 1, 0.3, 1];

const glassPillStyle = {
  backdropFilter: "blur(24px) saturate(200%)",
  WebkitBackdropFilter: "blur(24px) saturate(200%)",
  background: "rgba(3, 4, 18, 0.72)",
  boxShadow: "0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
};

function NavLinks({ activeSection, compact, onLinkClick }) {
  return (
    <nav className="hidden sm:flex items-center gap-0.5">
      {NAV_LINKS.map(({ label, href, section }) => {
        const isActive = activeSection === section;
        return (
          <a
            key={section}
            href={href}
            onClick={onLinkClick}
            className={[
              "rounded-full text-[13px] font-medium transition-all duration-200",
              compact ? "px-2.5 py-1" : "px-3.5 py-1.5",
              isActive
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/5",
            ].join(" ")}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}

function MobileMenu({ links, activeSection, onClose }) {
  return (
    <nav className="flex flex-col p-1.5">
      {links.map(({ label, href, section }) => {
        const isActive = activeSection === section;
        return (
          <a
            key={section}
            href={href}
            onClick={onClose}
            className={[
              "px-4 py-2.5 rounded-xl text-sm transition-colors duration-200",
              isActive
                ? "bg-white/10 text-white"
                : "text-neutral-400 hover:text-white hover:bg-white/5",
            ].join(" ")}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on scroll state change
  useEffect(() => { setIsOpen(false); }, [scrolled]);

  useEffect(() => {
    const observers = NAV_LINKS.map(({ section }) => {
      const el = document.getElementById(section);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(section); },
        { threshold: 0, rootMargin: "-10% 0px -60% 0px" }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  return (
    <>
      {/* ── Full-width bar — shown at top ── */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            key="fullbar"
            className="fixed inset-x-0 top-0 z-50"
            style={{
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              background: "rgba(3, 4, 18, 0.45)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="mx-auto max-w-7xl c-space">
              <div className="flex items-center justify-between py-3">
                <a href="/" className="text-[15px] font-bold text-white">
                  Jason
                </a>
                <button
                  onClick={() => setIsOpen((v) => !v)}
                  className="flex sm:hidden text-neutral-400 hover:text-white transition-colors focus:outline-none"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                  <img
                    src={isOpen ? "assets/close.svg" : "assets/menu.svg"}
                    className="w-6 h-6"
                    alt="toggle"
                  />
                </button>
                <NavLinks
                  activeSection={activeSection}
                  onLinkClick={() => setIsOpen(false)}
                />
              </div>
            </div>

            {/* Mobile dropdown for full bar */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="sm:hidden"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <div className="pb-3 c-space">
                    <MobileMenu
                      links={NAV_LINKS}
                      activeSection={activeSection}
                      onClose={() => setIsOpen(false)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating pill — shown when scrolled ── */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            key="pill"
            className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 pointer-events-none"
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.92 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="pointer-events-auto relative flex flex-col items-center">
              {/* Pill */}
              <div
                className="flex items-center gap-3 px-5 py-2 rounded-full border border-white/[0.08]"
                style={glassPillStyle}
              >
                <a href="/" className="text-[13px] font-bold text-white shrink-0">
                  Jason
                </a>
                <div className="hidden sm:block h-3.5 w-px bg-white/10 shrink-0" />
                <NavLinks
                  activeSection={activeSection}
                  compact
                  onLinkClick={() => setIsOpen(false)}
                />
                <button
                  onClick={() => setIsOpen((v) => !v)}
                  className="flex sm:hidden text-neutral-400 hover:text-white transition-colors focus:outline-none"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                  <img
                    src={isOpen ? "assets/close.svg" : "assets/menu.svg"}
                    className="w-5 h-5"
                    alt="toggle"
                  />
                </button>
              </div>

              {/* Mobile dropdown for pill */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="sm:hidden absolute top-full mt-2 min-w-[170px] rounded-2xl border border-white/[0.08] overflow-hidden"
                    style={{ ...glassPillStyle, background: "rgba(3, 4, 18, 0.92)" }}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: EASE }}
                  >
                    <MobileMenu
                      links={NAV_LINKS}
                      activeSection={activeSection}
                      onClose={() => setIsOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

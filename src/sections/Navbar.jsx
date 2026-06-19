import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", href: "#home", section: "home" },
  { label: "About", href: "#about", section: "about" },
  { label: "Work", href: "#work", section: "work" },
  { label: "Contact", href: "#contact", section: "contact" },
];

const EASE = [0.16, 1, 0.3, 1];

const PILL = {
  large: { px: 24, py: 12, gap: 16 },
  small: { px: 16, py: 8, gap: 10 },
};

const GLASS = {
  large: {
    bg: "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(3,4,18,0.18) 100%)",
    shadow: "0 8px 40px rgba(0,0,0,0.25), inset 0 1.5px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.12)",
  },
  small: {
    bg: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(3,4,18,0.58) 100%)",
    shadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.18)",
  },
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
              "rounded-full font-medium transition-all duration-300",
              compact ? "text-[13px] px-2.5 py-1" : "text-[14px] px-3.5 py-1.5",
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

function MobileMenu({ activeSection, onClose }) {
  return (
    <nav className="flex flex-col p-1.5">
      {NAV_LINKS.map(({ label, href, section }) => {
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
  // navState: 'top' | 'large' | 'small'
  const [navState, setNavState] = useState("top");
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      if (y <= 10) {
        setNavState("top");
      } else if (Math.abs(delta) > 4) {
        setNavState(delta > 0 ? "small" : "large");
      }

      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (navState === "top") setIsOpen(false);
  }, [navState]);

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

  const isTop = navState === "top";
  const pillKey = navState === "large" ? "large" : "small";
  const cfg = PILL[pillKey];
  const glass = GLASS[pillKey];

  return (
    <>
      {/* ── Full-width bar — at top ── */}
      <AnimatePresence>
        {isTop && (
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
                <NavLinks activeSection={activeSection} onLinkClick={() => setIsOpen(false)} />
              </div>
            </div>
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
                    <MobileMenu activeSection={activeSection} onClose={() => setIsOpen(false)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating pill — large (scroll up) or small (scroll down) ── */}
      <AnimatePresence>
        {!isTop && (
          <motion.div
            key="pill"
            className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none"
            style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.92 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="pointer-events-auto relative flex flex-col items-center">
              {/* Morphing pill */}
              <motion.div
                className="flex items-center rounded-full border border-white/[0.18] min-w-[160px] sm:min-w-0 justify-between sm:justify-start"
                initial={false}
                animate={{
                  paddingLeft: cfg.px,
                  paddingRight: cfg.px,
                  paddingTop: cfg.py,
                  paddingBottom: cfg.py,
                  gap: cfg.gap,
                }}
                transition={{ duration: 0.45, ease: EASE }}
                style={{
                  backdropFilter: "blur(40px) saturate(250%) brightness(1.15)",
                  WebkitBackdropFilter: "blur(40px) saturate(250%) brightness(1.15)",
                  background: glass.bg,
                  boxShadow: glass.shadow,
                  transition: "background 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.45s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <a href="/" className="font-bold text-[13px] text-white shrink-0">
                  Jason
                </a>
                <div className="hidden sm:block h-3.5 w-px bg-white/10 shrink-0" />
                <NavLinks
                  activeSection={activeSection}
                  compact={navState === "small"}
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
              </motion.div>

              {/* Mobile dropdown */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    className="sm:hidden absolute top-full mt-2 min-w-[170px] rounded-2xl border border-white/[0.18] overflow-hidden"
                    style={{
                      backdropFilter: "blur(40px) saturate(250%) brightness(1.1)",
                      WebkitBackdropFilter: "blur(40px) saturate(250%) brightness(1.1)",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(3,4,18,0.55) 100%)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1.5px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.12)",
                    }}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: EASE }}
                  >
                    <MobileMenu activeSection={activeSection} onClose={() => setIsOpen(false)} />
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

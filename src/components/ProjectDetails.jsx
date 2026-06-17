import { motion } from "framer-motion";
import { useEffect } from "react";

const ProjectDetails = ({
  title,
  description,
  subDescription,
  image,
  tags,
  href,
  closeModal,
}) => {
  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape key to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeModal]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center w-full h-full overflow-hidden backdrop-blur-sm"
      onClick={closeModal}
    >
      <motion.div
        className="relative max-w-2xl w-full mx-4 border shadow-sm rounded-2xl bg-gradient-to-l from-midnight to-navy border-white/10"
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute p-2 rounded-sm top-5 right-5 bg-midnight hover:bg-neutral-700 transition-colors"
          aria-label="Close modal"
        >
          <img src="assets/close.svg" className="w-6 h-6" alt="close" />
        </button>
        <img src={image} alt={title} className="w-full rounded-t-2xl" />
        <div className="p-5">
          <h5 className="mb-2 text-2xl font-bold text-white">{title}</h5>
          <p className="mb-3 font-normal text-neutral-400">{description}</p>
          {subDescription.map((subDesc, index) => (
            <p key={index} className="mb-3 font-normal text-neutral-400">{subDesc}</p>
          ))}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-3">
              {tags.map((tag) => (
                <img
                  key={tag.id}
                  src={tag.path}
                  alt={tag.name}
                  className="rounded-lg size-10 hover-animation"
                />
              ))}
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium cursor-pointer hover-animation hover:text-aqua transition-colors"
            >
              View Project
              <img src="assets/arrow-up.svg" className="size-4" alt="open" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetails;

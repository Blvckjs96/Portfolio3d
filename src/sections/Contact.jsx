import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Alert from "../components/Alert";
import { Particles } from "../components/Particles";

// Accumulates SSE chunks across network boundaries to avoid mid-line JSON parse errors
function parseSseChunks(buffer, newChunk) {
  const combined = buffer + newChunk;
  const lines = combined.split("\n");
  const nextBuffer = lines[lines.length - 1];
  const completedLines = lines.slice(0, -1);
  const events = completedLines
    .filter((l) => l.startsWith("data: "))
    .map((l) => {
      try { return JSON.parse(l.slice(6)); }
      catch { return null; }
    })
    .filter(Boolean);
  return { events, buffer: nextBuffer };
}

// Cosmic-themed loading indicator — pulsing pulsar ring instead of generic bounce dots
const CosmicLoader = () => (
  <motion.div
    className="w-full mt-4 p-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-3"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    role="status"
    aria-label="Analyzing your project"
  >
    <div className="relative flex shrink-0 size-4">
      <span className="absolute inset-0 rounded-full bg-lavender/50 animate-ping" />
      <span className="relative rounded-full size-4 bg-lavender/80" />
    </div>
    <p className="text-sm text-neutral-400">
      AI is analyzing your project
      <AnimatedEllipsis />
    </p>
  </motion.div>
);

const AnimatedEllipsis = () => (
  <span aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
      >
        .
      </motion.span>
    ))}
  </span>
);

const METRICS = [
  { key: "scope", label: "Scope" },
  { key: "timeline", label: "Timeline" },
  { key: "priceRange", label: "Est. Price" },
  { key: "techStack", label: "Tech Stack" },
];

const ProposalCard = ({ proposal, onConfirm, onEdit, isSending }) => {
  const cardRef = useRef(null);

  // Move focus into the card so keyboard users and screen readers know it appeared
  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      tabIndex={-1}
      role="region"
      aria-label="AI Proposal ready"
      className="w-full mt-4 rounded-xl border border-lavender/30 bg-gradient-to-b from-lavender/10 to-royal/5 outline-none focus-visible:ring-2 focus-visible:ring-lavender/50"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-white/10">
        <div className="relative flex shrink-0 size-2">
          <span className="absolute inset-0 rounded-full bg-lavender animate-ping opacity-75" />
          <span className="relative rounded-full size-2 bg-lavender" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-lavender">
          AI Proposal
        </span>
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-b border-white/5">
        <p className="text-sm text-neutral-300 italic leading-relaxed">
          &ldquo;{proposal.summary}&rdquo;
        </p>
      </div>

      {/* Metrics — alternating depth for dark-luxury layering */}
      <div className="grid grid-cols-2">
        {METRICS.map(({ key, label }, i) => {
          const value =
            key === "techStack"
              ? (Array.isArray(proposal.techStack) ? proposal.techStack : []).join(", ")
              : proposal[key];
          const isRightCol = i % 2 === 1;
          const isBottomRow = i >= 2;
          return (
            <div
              key={label}
              className={[
                "p-3",
                isRightCol ? "border-l border-white/5" : "",
                isBottomRow ? "border-t border-white/5" : "",
                i % 2 === 0 ? "bg-white/[0.03]" : "bg-transparent",
              ].join(" ")}
            >
              <p className="text-xs text-neutral-500 mb-1">{label}</p>
              <p className="text-sm font-semibold text-white">{value}</p>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-4 border-t border-white/10">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 py-2 text-sm rounded-md border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
        >
          Edit Details
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSending}
          className="flex-1 py-2 text-sm rounded-md cursor-pointer bg-gradient-to-r from-lavender to-royal hover:opacity-90 transition-opacity disabled:opacity-50 font-medium text-white"
        >
          {isSending ? "Sending..." : "Confirm & Send"}
        </button>
      </div>
    </motion.div>
  );
};

// Shown when fields are locked while a proposal is on screen
const FieldLockHint = ({ onEdit }) => (
  <motion.p
    className="mt-3 text-xs text-center text-neutral-500"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.25 }}
  >
    Fields locked while reviewing proposal.{" "}
    <button
      type="button"
      onClick={onEdit}
      className="text-lavender underline underline-offset-2 hover:text-lavender/70 transition-colors cursor-pointer"
    >
      Edit details
    </button>
  </motion.p>
);

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [analyzeError, setAnalyzeError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (proposal) setProposal(null);
    if (analyzeError) setAnalyzeError(false);
  };

  const showAlertMessage = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalyzeError(false);
    let buffer = "";
    let settled = false;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: formData.message }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (!settled) {
        const { done, value } = await reader.read();
        if (done) break;

        const { events, buffer: nextBuffer } = parseSseChunks(buffer, decoder.decode(value));
        buffer = nextBuffer;

        for (const data of events) {
          if (data.done) {
            setProposal(data.proposal);
            settled = true;
            break;
          }
          if (data.error) {
            showAlertMessage("danger", data.error);
            setAnalyzeError(true);
            settled = true;
            break;
          }
        }
      }

      if (!settled) {
        showAlertMessage("danger", "Analysis incomplete. You can send your message directly.");
        setAnalyzeError(true);
      }
    } catch (err) {
      showAlertMessage("danger", err.message || "Could not reach the server.");
      setAnalyzeError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          proposal: proposal ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error: ${res.status}`);
      setFormData({ name: "", email: "", message: "" });
      setProposal(null);
      setAnalyzeError(false);
      showAlertMessage("success", "Your message has been sent!");
    } catch (err) {
      showAlertMessage("danger", err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = () => {
    setProposal(null);
    setAnalyzeError(false);
  };

  const isLocked = isAnalyzing || !!proposal;

  return (
    <section className="relative flex items-center c-space section-spacing" id="contact">
      <Particles
        className="absolute inset-0 -z-50"
        quantity={100}
        ease={80}
        color={"#ffffff"}
        refresh
      />

      {/* Alert lives outside the card so it's always fixed to the viewport */}
      <AnimatePresence>
        {showAlert && <Alert key="contact-alert" type={alertType} text={alertMessage} />}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center max-w-md p-5 mx-auto border border-white/10 rounded-2xl bg-primary">
        <div className="flex flex-col items-start w-full gap-5 mb-10">
          <h2 className="text-heading">Let's Talk</h2>
          <p className="font-normal text-neutral-400">
            Whether you're looking to build a new website, improve your existing
            platform, or bring a unique project to life, I'm here to help.
          </p>
        </div>

        <form className="w-full" onSubmit={handleAnalyze}>
          <div className="mb-5">
            <label htmlFor="name" className="field-label">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="field-input field-input-focus disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="John Doe"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLocked}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="field-input field-input-focus disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="john@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLocked}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="message" className="field-label">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className="field-input field-input-focus disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Describe your project or idea..."
              value={formData.message}
              onChange={handleChange}
              required
              disabled={isLocked}
            />
          </div>

          {/* Explanation when fields are locked behind a proposal */}
          {!!proposal && <FieldLockHint onEdit={handleEdit} />}

          {/* Submit button — hidden while proposal is visible */}
          {!proposal && !analyzeError && (
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full mt-2 px-1 py-3 text-lg text-center rounded-md cursor-pointer bg-radial from-lavender to-royal hover-animation disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing..." : "Get Proposal"}
            </button>
          )}

          {/* Fallback path after analyze error — retry or send directly */}
          {analyzeError && !proposal && (
            <div className="mt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full px-1 py-3 text-lg text-center rounded-md cursor-pointer bg-radial from-lavender to-royal hover-animation disabled:opacity-50"
              >
                Retry Analysis
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="w-full px-1 py-2 text-sm text-center rounded-md cursor-pointer border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send Without AI"}
              </button>
            </div>
          )}
        </form>

        {/* Loading and proposal animate in/out below the form */}
        <AnimatePresence mode="wait">
          {isAnalyzing && <CosmicLoader key="loader" />}
          {proposal && (
            <ProposalCard
              key="proposal"
              proposal={proposal}
              onConfirm={handleSend}
              onEdit={handleEdit}
              isSending={isSending}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Contact;

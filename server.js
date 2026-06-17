import express from "express";
import emailjs from "@emailjs/nodejs";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { promises as fs } from "fs";
import { resolveMx } from "dns/promises";
import { randomUUID } from "crypto";
import rateLimit from "express-rate-limit";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NIM_MODEL = "meta/llama-3.3-70b-instruct";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOG_FILE = join(__dirname, "data", "submissions.jsonl");

async function validateEmailDomain(email) {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const records = await resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

async function logSubmission(entry) {
  const { error } = await supabase.from("submissions").insert({
    id: entry.id,
    from_name: entry.from_name,
    from_email: entry.from_email,
    message: entry.message,
    proposal: entry.proposal,
  });
  if (error) {
    console.error("Supabase insert error:", error.message);
    // Fallback: write to local JSONL so no submission is ever lost
    await fs.mkdir(join(__dirname, "data"), { recursive: true });
    await fs.appendFile(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
  }
}

function formatProposalForEmail(proposal) {
  if (!proposal) return "";
  return `\n\n--- AI Proposal ---\nScope: ${proposal.scope}\nTimeline: ${proposal.timeline}\nEst. Price: ${proposal.priceRange}\nTech Stack: ${proposal.techStack?.join(", ")}\nSummary: ${proposal.summary}`;
}

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "dist")));

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: "Too many requests, please try again later." } });
const analyzeLimiter = rateLimit({ windowMs: 60 * 1000, max: 3, message: { error: "Too many analyze requests, please wait." } });

app.post("/api/contact", contactLimiter, async (req, res) => {
  const { from_name, from_email, message, proposal } = req.body;
  if (!from_name || !from_email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const domainValid = await validateEmailDomain(from_email);
  if (!domainValid) {
    return res.status(400).json({ error: "Email address appears to be invalid. Please use a real email." });
  }

  const fullMessage = message + formatProposalForEmail(proposal);
  const emailjsConfig = {
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
  };
  const templateParams = {
    from_name,
    from_email,
    message: fullMessage,
    // Separate fields for optional use in EmailJS templates
    proposal_scope: proposal?.scope ?? "N/A",
    proposal_timeline: proposal?.timeline ?? "N/A",
    proposal_price: proposal?.priceRange ?? "N/A",
    proposal_stack: proposal?.techStack?.join(", ") ?? "N/A",
    proposal_summary: proposal?.summary ?? "N/A",
  };

  try {
    await Promise.all([
      emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_NOTIFICATION_TEMPLATE_ID, templateParams, emailjsConfig),
      emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_AUTOREPLY_TEMPLATE_ID, templateParams, emailjsConfig),
    ]);

    await logSubmission({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      from_name,
      from_email,
      message,
      proposal: proposal ?? null,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Contact error:", err.message);
    res.status(500).json({ error: "Failed to send email." });
  }
});

function normalizeProposal(raw) {
  return {
    ...raw,
    techStack: Array.isArray(raw.techStack)
      ? raw.techStack
      : typeof raw.techStack === "string"
      ? raw.techStack.split(/,\s*/).filter(Boolean)
      : [],
  };
}

app.post("/api/analyze", analyzeLimiter, async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "NVIDIA_API_KEY is not configured." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const nimRes = await fetch(NIM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: NIM_MODEL,
        stream: true,
        messages: [
          {
            role: "system",
            content:
              "You are Jason — a senior full-stack developer with 10+ years of experience, specializing in React, Node.js, Python, AI/ML integration, and cloud-deployed web applications. Your billable rate is $30–$60/hr. You estimate projects for international clients at competitive, honest market rates. You respond ONLY with raw JSON — no markdown, no explanation, no code fences.",
          },
          {
            role: "user",
            content: `A potential client sent this project inquiry: "${message}"

Produce a realistic project estimate based on your $30–$60/hr billable rate.

Scope definitions:
- Small: landing page, portfolio, brochure site, single standalone feature — 2–4 weeks, $1,500–$5,000
- Medium: multi-page web app, dashboard, CMS integration, API with moderate complexity — 5–10 weeks, $3,000–$12,000
- Large: SaaS platform, e-commerce with payments, multi-role systems, AI/ML integration, complex infrastructure — 3–6+ months, $10,000–$30,000+

Rules:
- scope: exactly one of Small, Medium, or Large
- timeline: realistic range that includes design, development, testing, and 1–2 rounds of revisions
- techStack: 3–6 technologies that best fit the project (from your stack: React, Next.js, Node.js, Express, Python, PostgreSQL, MongoDB, Stripe, AWS, Docker — include auth/payment/infra only when the project requires them; never suggest WordPress or page builders)
- priceRange: honest USD range derived from your $30–$60/hr rate — do not underquote, do not round down
- summary: one sentence describing what will be built and the single biggest technical challenge

Output ONLY a JSON object with these exact keys: scope, timeline, techStack, priceRange, summary. Nothing else.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!nimRes.ok) {
      const errText = await nimRes.text();
      console.error("NIM error:", nimRes.status, errText);
      res.write(`data: ${JSON.stringify({ error: `NIM API error: ${nimRes.status}` })}\n\n`);
      return res.end();
    }

    const reader = nimRes.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    let sseBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      sseBuffer += decoder.decode(value, { stream: true });
      const lines = sseBuffer.split("\n");
      sseBuffer = lines.pop(); // keep incomplete last line

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") continue;

        try {
          const chunk = JSON.parse(payload);
          const token = chunk.choices?.[0]?.delta?.content ?? "";
          if (token) {
            fullContent += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          }

          if (chunk.choices?.[0]?.finish_reason === "stop") {
            const cleaned = fullContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
            const match = cleaned.match(/\{[\s\S]*\}/);
            if (match) {
              try {
                const proposal = normalizeProposal(JSON.parse(match[0]));
                res.write(`data: ${JSON.stringify({ done: true, proposal })}\n\n`);
              } catch {
                res.write(`data: ${JSON.stringify({ error: "Could not parse proposal JSON" })}\n\n`);
              }
            } else {
              res.write(`data: ${JSON.stringify({ error: "No JSON found in response" })}\n\n`);
            }
            return res.end();
          }
        } catch { /* skip malformed SSE chunk */ }
      }
    }

    // Stream ended without finish_reason — try to parse whatever we have
    if (fullContent) {
      const match = fullContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim().match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const proposal = normalizeProposal(JSON.parse(match[0]));
          res.write(`data: ${JSON.stringify({ done: true, proposal })}\n\n`);
          return res.end();
        } catch { /* fall through */ }
      }
    }
    res.write(`data: ${JSON.stringify({ error: "Incomplete response from NIM" })}\n\n`);
    res.end();

  } catch (err) {
    console.error("NIM fetch error:", err.message);
    const isTimeout = err.name === "TimeoutError" || err.name === "AbortError";
    res.write(`data: ${JSON.stringify({ error: isTimeout ? "Request timed out" : "Failed to reach NIM API" })}\n\n`);
    res.end();
  }
});

app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

<div align="center">

# 3D Portfolio Website

**AI-integrated fullstack freelancer.**  
*I build things that work in production, not just in demos.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-portfolio3d--xem2.onrender.com-000000?style=for-the-badge&logo=render&logoColor=white)](https://portfolio3d-xem2.onrender.com/)
&nbsp;
[![GitHub](https://img.shields.io/badge/Blvckjs96-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Blvckjs96)

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)

</div>

---

## Introduction

Most portfolios tell you what a developer *can* do. This one shows it.

**Problem:** Clients describe a project idea in a single message. Developers take days to reply with a proper scope and budget. By then, the client has moved on.

**Solution:** The contact form here runs that estimation instantly. Describe your project — the AI reads it and streams back a scoped proposal (timeline, budget, tech stack) in real-time before you even hit send.

## Features

- **Interactive 3D Graphics**: Powered by Three.js and React Three Fiber for WebGL-rendered visuals
- **Smooth Animations**: Framer Motion for fluid transitions and scroll-driven interactions
- **Responsive Design**: Fully responsive layout using Tailwind CSS v4
- **3D Globe**: Interactive globe component using COBE
- **AI Proposal Flow**: Describes your project idea → AI scopes it in real-time via streaming → confirm and send. Faster than any back-and-forth email thread
- **Contact Form**: EmailJS-powered with dual templates — lead notification + client auto-reply, both include the full AI-generated proposal
- **Persistent Submissions**: Every inquiry logged to Supabase with full proposal JSON — nothing lost, queryable anytime
- **Project Showcase**: Dynamic project gallery with detailed modal views
- **Experience Timeline**: Visual timeline of professional experiences
- **Testimonials Section**: Client and colleague testimonials

### AI Proposal Flow

```mermaid
flowchart LR
    A(["Client describes idea"]) --> B["POST /api/analyze"]
    B --> C[/"LLM Engine\n(cloud, streamed)"/]
    C -->|SSE token stream| D(["Proposal Card\nscope · timeline · budget"])
    D -->|Confirm| E["POST /api/contact"]
    E --> F[("Supabase\nsubmissions")]
    E --> G[["EmailJS\nnotification + auto-reply"]]

    style A fill:#0f172a,stroke:#33c2cc,color:#e2e8f0
    style C fill:#0f172a,stroke:#33c2cc,color:#e2e8f0
    style D fill:#0f172a,stroke:#33c2cc,color:#e2e8f0
    style F fill:#0f172a,stroke:#3ecf8e,color:#e2e8f0
    style G fill:#0f172a,stroke:#475569,color:#e2e8f0
```

> Rate limited. DNS MX validation on every email. No fake domains, no spam.

## Tech Stack

### Core Technologies

| Technology | Version | Role |
|-----------|---------|------|
| ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) | 19.1.1 | UI framework with concurrent rendering |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | 7.1.2 | Build tool, instant HMR |
| ![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white) | 0.179.1 | WebGL 3D rendering |

### 3D & Animation

| Technology | Role |
|-----------|------|
| ![R3F](https://img.shields.io/badge/@react--three/fiber-20232A?style=flat-square&logo=react&logoColor=61DAFB) | React renderer for Three.js |
| ![Drei](https://img.shields.io/badge/@react--three/drei-20232A?style=flat-square&logo=react&logoColor=white) | Helpers and abstractions for R3F |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Scroll-driven animations and transitions |
| ![COBE](https://img.shields.io/badge/COBE-000000?style=flat-square) | 5kb WebGL globe |

### Styling & UI

| Technology | Role |
|-----------|------|
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-0F172A?style=flat-square&logo=tailwindcss&logoColor=38BDF8) | CSS-first utility framework |
| ![tailwind-merge](https://img.shields.io/badge/tailwind--merge-0F172A?style=flat-square) | Class conflict resolution |

### Backend & Infrastructure

| Technology | Role |
|-----------|------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | ESM server, API layer |
| ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) | REST endpoints with rate limiting |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | PostgreSQL — persistent submission logs |
| Cloud LLM | Real-time AI via SSE streaming |
| ![EmailJS](https://img.shields.io/badge/EmailJS-FF6B35?style=flat-square) | Dual-template email delivery |

## Key Components

- **Hero Section**: Eye-catching landing with 3D room scene and animated role switcher
- **About Section**: Interactive WebGL globe, tech orbit rings, and timezone display
- **Projects Section**: Portfolio projects with detailed modal views and live/repo links
- **Experiences Section**: Scroll-driven timeline with animated progress fill
- **Testimonials**: Client feedback carousel
- **Contact Form**: End-to-end AI proposal flow — from idea to scoped estimate to logged submission

---

<div align="center">

**Available for freelance work.**  
Reach out through the [contact form](https://portfolio3d-xem2.onrender.com/#contact) — My solution will scope your project before I even reply.

</div>

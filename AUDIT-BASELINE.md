# Homepage Audit — Structure, Style System & Visual/UX Issues

This document captures the current state of the portfolio homepage as of the audit, for use as a baseline before the Warm Dark redesign.

---

## 1. Homepage Structure

### Route & composition

- **Entry:** `src/main.jsx` loads `index.css` and `App.jsx`.
- **App shell:** `src/App.jsx` wraps the app in `<Router>`, with fixed `<Navbar />` and floating `<GlobalChatbot />` outside `<Routes>`.
- **Home route (`/`):** A single `<main>` wraps the following sections in order:

| Order | Section           | Component          | File                      | Section ID (for nav) |
|-------|-------------------|--------------------|---------------------------|----------------------|
| 1     | Landing (intro)   | `LandingPage`      | `Landing.jsx`             | —                    |
| 2     | About             | `HeroSection`      | `HeroSection.jsx`         | `about`              |
| 3     | Education         | `EducationSection` | `EducationSection.jsx`    | `education`          |
| 4     | Projects preview  | `ProjectPreview`   | `ProjectPreview.jsx`      | — (no id)            |
| 5     | Timeline          | `Timeline`         | `TimeLine.jsx`            | `timeline`           |
| 6     | Skills            | `SkillSection`     | `SkillsSection.jsx`       | `skills`             |
| 7     | Contact           | `ContactSection`   | `ContactSection.jsx`      | `contact`            |

- **Other routes:** `/projects` → `ProjectSection`, `/experience` → `Experience`.
- **Global UI:** `ScheduleCallButton` is rendered inside `Landing.jsx` and again inside `ContactSection.jsx` (duplicate instances). `GlobalChatbot` is mounted once in `App.jsx`.

### Nav anchor mapping

- Navbar dropdown links: `#about`, `#education`, `#timeline`, `#skills`, `#contact`. All target sections exist on the homepage.
- “Scroll Down” on Landing uses `document.querySelector(".hero")` to scroll to the next section; `HeroSection` has `id="about"` but no class `hero`, so the scroll target may be missing or incorrect.

---

## 2. Style System

### Global styles

- **`src/index.css`**
  - Imports `tailwindcss`.
  - Defines `:root` design tokens (see below).
  - Keyframes: `float-orb`, `dot-pulse`, `float-1`–`float-3`, `reveal-up` / `revealup`, `expand-divider` / `expanddivider`, `cursor-blink` / `cursorblink`, `arrow-bounce` / `arrowbounce`, `bounce`, `glow`, `fade-in-up`, `slide-in-left`, `slide-in`.
  - Utility classes: `.landing-gradient-text`, `.landing-reveal` (+ delay classes), `.landing-expand-divider`, `.experience-card.in-view` (for IntersectionObserver).
  - `body`: system font stack; `code`: monospace; `a`: no underline.

- **`src/App.css`**
  - Reset: `*` margin/padding/box-sizing; `html, body, #root` full width/height; `.App` full width, min-height, no horizontal overflow; `main` full width, no padding.

### Design tokens (`:root` in `index.css`)

- **Brand:** `--color-primary` (#3b82f6), `--color-primary-hover`, `--color-accent` (#8b5cf6), `--color-accent-hover`, `--color-primary-light`.
- **Backgrounds:** `--color-bg-base` (#0a0f1a), `--color-bg-slate` (#0f172a), `--color-bg-surface` (#1a1f35).
- **Text & borders:** `--color-text-primary`, `--color-text-muted`, `--color-text-subtle`, `--color-border-subtle`, `--color-border-muted`.
- **Gradients:** `--gradient-brand`, `--gradient-brand-hover` (blue → violet).
- **Spacing:** `--space-1` through `--space-16`.
- **Shadows:** `--shadow-glass`, `--shadow-glass-strong`, `--shadow-button`, `--shadow-button-hover`, `--shadow-glow` (blue-tinted).

### Typography

- **Body:** System stack in `index.css`: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", …`
- **Landing:** `font-['Outfit',sans-serif]` (inline in `Landing.jsx`); no project-wide serif or mono hierarchy.
- **Headings:** Mostly bold sans with inline gradient text (e.g. `background: linear-gradient(135deg, #0f172a 0%, #334155 40%, #3b82f6 70%, #8b5cf6 100%)`); repeated across HeroSection, EducationSection, TimeLine, SkillsSection, ContactSection, Experience.

### Per-section styling (summary)

- **Landing:** Dark blue/violet gradient background (`from-[#0a0f1a] via-[#0f172a] to-[#1a1f35]`), blue/violet orbs and dots, blue/violet gradient text and cursor, floating icon cards (blue/violet hover).
- **HeroSection:** Light section (`from-slate-50 via-white to-slate-50`), radial blue/violet gradients, white glass card, blue/violet gradient ring on photo and gradient heading.
- **EducationSection:** Same light gradient + radial accents; white/slate cards; blue/violet icon badges and primary-colored institution text.
- **ProjectPreview:** Off-white background (`#FAFAFF`), blue/purple ambient blurs; white cards with blue→violet gradient top border on first card; “Featured” gradient pill; blue/violet “See More” button.
- **TimeLine:** Light gradient background; white/glass cards; blue/violet gradient top bar on hover; blue/violet icon chips and year color.
- **SkillsSection:** Same light gradient; white/glass cards; category-specific gradients (blue/violet, cyan, emerald).
- **ContactSection:** Same light gradient; two white/glass panels; blue/violet gradient top bars and icon backgrounds; “Let’s Connect” gradient heading.
- **Experience (separate page):** Same light + radial blue/violet/cyan gradients; timeline rail blue→violet→pink; blue/violet accents on cards and tech pills.

### Motion

- **CSS:** Reveal, float, pulse, bounce, glow, fade-in-up, slide-in keyframes in `index.css`; Tailwind `animate-[...]` used for delays.
- **AOS:** Used in HeroSection, EducationSection, ProjectPreview, TimeLine (init in each component with `AOS.init({ duration: 1000, once: true })`). No central AOS config.
- **IntersectionObserver:** Only in Experience for `.experience-card.in-view` (opacity/transform).
- **Result:** Mixed motion semantics (CSS + AOS + IO) and repeated AOS inits.

### Buttons & CTAs

- **Schedule call:** `.schedule-call-btn` in `index.css` — `--gradient-brand` background, blue shadow; used by `ScheduleCallButton.jsx`.
- **Primary actions:** Inline gradients (e.g. `from-blue-500 to-violet-500`) with hover lift and blue glow shadows across sections.
- No shared primary/ghost button classes; each section repeats similar gradient and shadow patterns.

---

## 3. Visual & UX Issues

### Thematic inconsistency

- **Dark → light jump:** Landing is dark (blue/violet); HeroSection onward is light (white/slate). No single coherent theme; the transition feels abrupt.
- **Accent overload:** Blue and violet gradients appear in almost every section (headings, icons, borders, buttons, glows), creating a repetitive “template” feel.
- **No warm/neutral option:** Palette is cool-only; no amber/warm tokens or typographic contrast (e.g. serif/mono) for hierarchy.

### Typography

- No dedicated display serif or mono for eyebrows/metadata; body is system default.
- Heading treatment is uniform (gradient + bold sans) across sections; weak hierarchy and no editorial tone (e.g. italic serif for contact).

### Layout & rhythm

- Section padding varies (e.g. `py-24`, `py-20`, `py-16`, `max-[480px]:py-12`); no consistent vertical rhythm (e.g. 72–90px).
- Max-widths differ: 1000px, 1200px, 1280px, 1400px; no single content-width token.
- Dividers between sections are mostly implied by background change; no shared divider or “gold overhang” structure.

### Component patterns

- **Cards:** Rounded glass (white/80, border, shadow, backdrop-blur) and hover lift (-translate-y-2) repeated in Education, Timeline, Skills, Contact, Experience; feels samey.
- **Badges/pills:** Gradient pills (“Featured”, “New”, GPA) and gradient icon containers repeated; visual noise.
- **Projects on homepage:** ProjectPreview uses a 3-card grid with “Featured” badges and long descriptions; plan calls for a vertical numbered list (number — category — title — year) instead.

### Motion & performance

- Multiple AOS inits (one per component) and mixed use of AOS + CSS + IntersectionObserver; could be consolidated or replaced with CSS-only where simple.
- Heavy keyframes (float, glow, bounce) and many gradient/blur layers may add cost on low-end devices.

### Copy & UX details

- **Contact:** Heading is generic (“Let’s Connect”); plan suggests a more personal, italic serif line (e.g. “Let’s build something worth remembering.”).
- **Scroll affordance:** Landing “Scroll Down” targets `.hero`; HeroSection has `id="about"` but no `.hero` class — scroll-to-next may not work as intended.
- **Nav:** Active states use `bg-gradient-to-br from-blue-500/30 to-violet-500/30`; “New” badge on Projects is gradient + pulse; plan suggests calmer, warm accent (e.g. amber) and less glow.

### Accessibility & robustness

- Some contrast and focus styles are present (e.g. ContactSection `focus:outline-2 focus:outline-blue-500`); not audited in full.
- `document.querySelector(".hero")` and `document.querySelector(".navbar")` (TimeLine) assume DOM shape; navbar has no class `navbar`, so Experience scroll offset may use wrong element.

---

## 4. File Reference Summary

| Purpose              | File(s) |
|----------------------|--------|
| App & route composition | `App.jsx`, `main.jsx` |
| Global tokens & keyframes | `index.css` |
| Layout reset         | `App.css` |
| Nav                  | `Navbar.jsx` |
| Landing              | `Landing.jsx` |
| About                | `HeroSection.jsx` |
| Education            | `EducationSection.jsx` |
| Projects preview     | `ProjectPreview.jsx` |
| Timeline             | `TimeLine.jsx` |
| Skills               | `SkillsSection.jsx` |
| Contact              | `ContactSection.jsx` |
| Experience (page)    | `Experience.jsx` |
| Schedule CTA         | `ScheduleCallButton.jsx` |
| Chat                 | `GlobalChatbot.jsx`, `ChatBot.jsx` |

---

This audit serves as the baseline for the Warm Dark homepage redesign described in the plan.

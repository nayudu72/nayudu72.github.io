# Personal Website — N. Ramachandra

Executive-style personal site: profile, value proposition, core competencies, experience timeline, education, certifications, and contact. Resume: `Ramachandra_Latest.pdf`.

## Features

- **Hero** — Credential strip, stat cards (years, scale, certifications), metric pills, primary CTAs (profile + download CV + LinkedIn)
- **Value proposition** — Three pillars (risk & compliance, operational excellence, scale & modernization)
- **Profile** — Quick facts sidebar + detailed narrative and capability pillars
- **Core competencies** — Four grouped matrices (cloud/infra, security/GRC, ITSM, leadership & legal)
- **Experience** — Vertical timeline with role tags (tech & scale keywords)
- **Education** — Card grid
- **Certifications** — Featured badges (CISSP, CISA, PMP, ITIL, AWS) + extended tag list
- **Contact** — Panel rows with icons; PDF download
- **UX** — Dark / light theme (saved in `localStorage`), scroll progress bar, back-to-top, mobile slide-out nav + backdrop, active section highlighting in nav, scroll-reveal animations, `prefers-reduced-motion` support
- **Accessibility** — Skip link, focus-visible rings, ARIA on menu and progress
- **Print** — Hides chrome; prints content cleanly

## Files

- `index.html` — Structure and copy
- `styles.css` — Themes, layout, timeline, print rules
- `script.js` — Theme, menu, scroll spy, reveals, progress

## Preview

```powershell
Set-Location "path\to\personal-website"
python -m http.server 8000
```

Open `http://localhost:8000`.

## Customization

- Replace copy in `index.html`; add a real photo by swapping the `.profile-avatar` block for an `<img>` with a suitable class in `styles.css`.
- Adjust colors in `styles.css` under `:root` and `[data-theme="dark"]`.

## Deployment

Static hosting: **GitHub Pages**, **Netlify**, **Vercel**, or any web server.

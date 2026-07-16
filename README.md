# maconweb

The marketing + docs site for **[MacOn](https://github.com/alimusawa313/MacON)** —
local iOS CI for your Mac, with an iPhone/iPad companion that monitors, streams,
controls, wakes, and unlocks it.

Live at **[macon.devopsinstitute.id](https://macon.devopsinstitute.id)**.

## Stack

A hand-built **static site** — no framework, no build step. Plain HTML, CSS, and
a little vanilla JS, served straight from this repo via GitHub Pages (`CNAME` +
`.nojekyll`).

```
index.html      landing — hero, CI features, companion features, CLI, macon.yml, FAQ
docs.html       full documentation (sidebar + filter), CLI ⇄ app ⇄ companion
about.html      the story
404.html        not-found
css/            base.css (design tokens + clay theme), home.css, docs.css, nav, menu, footer, …
js/             theme.js (dark mode), menu.js, code.js (copy buttons), home.js (parallax/FAQ), docs.js
macon-icon.png  app icon
```

## Design

The site wears the same soft 3D **clay world** as the apps: a pastel "paper"
backdrop, rounded-heavy display type (`ui-rounded`), puffy cards and pill buttons
with soft coloured shadows, and pure-CSS floating clay shapes that parallax on the
hero. Light + dark, driven by CSS custom properties in `css/base.css` — retheme
the whole site by editing the tokens there.

## Develop

No tooling required — open `index.html`, or serve the folder:

```sh
python3 -m http.server 8080   # then http://localhost:8080
```

Edit the HTML/CSS/JS directly and refresh. Deploys are just a push to the default
branch (GitHub Pages).

## License

Open source, by [Ali Haidar](https://www.linkedin.com/in/ali-haidar-8484b8208).

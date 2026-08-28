# maconweb

The marketing + docs site for **[MacOn](https://github.com/alimusawa313/MaconKit)**, 
local iOS CI for your Mac, with an iPhone/iPad companion that monitors, streams,
controls, automates, codes, talks to AI, and wakes or unlocks it.

Live at **[macon.id](https://macon.id)**.

## Stack

A hand-built **static site**, no framework, no build step. Plain HTML, CSS, and
vanilla JS (ES modules for the 3D world), served straight from this repo via
GitHub Pages (`CNAME` + `.nojekyll`). **Three.js is vendored** into
`js/vendor/` and wired with an import map, so deploys stay a plain `git push`.

```
index.html      landing, 3D hero, CI features, companion clusters, phone mock, security, themes, FAQ
docs.html       full documentation (sidebar + filter): CLI ⇄ app ⇄ companion, flows, AI, workspace
about.html      the story
404.html        not-found, with a pokeable clay mascot
css/
  tokens.css    ALL design tokens (light + dark), retheme the whole site here
  base.css      reset, typography, buttons, chips, reveal utilities
  nav.css       sticky nav + mobile menu     footer.css   site footer
  code.css      code blocks, terminal, tabs  cards.css    clay cards, icon tiles, FAQ
  home.css      landing sections             docs.css / about.css / notfound.css
js/
  theme.js      dark mode (circular reveal; fires "macon:theme" for the 3D world)
  nav.js        scroll shadow + hamburger    reveal.js    scroll-reveal ([data-reveal])
  code.js       copy buttons                 home.js      FAQ, tabs, typing terminal
  docs.js       sidebar, search, scrollspy
  world/        the Three.js clay world (ES modules)
    clay.js     palette from CSS vars, clay materials, studio lights, theme binder
    models.js   clay Mac, phone, gear, seal, orbs, blob, data string
    hero.js     landing hero scene: build state machine, drag-spin, parallax
    notfound.js the 404 blob
  vendor/       three.module.min.js + three.core.min.js + RoundedBoxGeometry.js (r185, MIT)
macon-icon.png  app icon
```

## Design

The site wears the same soft 3D **clay world** as the apps, the exact pastel
`WorldPalette` from `WorldStyle.swift`: paper backdrop, ink text, puffy clay
cards and pill buttons with soft coloured shadows. The hero is a live Three.js
scene that mirrors the apps' SceneKit machines: a clay Mac runs a build while
the clay companion phone watches over a sagging data string, drag to spin it,
tap the machines to make them wobble. Light + dark are driven entirely by the
CSS custom properties in `css/tokens.css`; the 3D world reads the same tokens,
so one file rethemes everything, canvas included.

Progressive enhancement: no WebGL (or `prefers-reduced-motion`) falls back to a
static hero; everything works without JS except the toys.

## Develop

No tooling required, serve the folder (ES modules need http, not file://):

```sh
python3 -m http.server 8080   # then http://localhost:8080
```

Edit the HTML/CSS/JS directly and refresh. Deploys are just a push to the
default branch (GitHub Pages).

## License

Open source, by [Ali Haidar](https://www.linkedin.com/in/ali-haidar-8484b8208).
Three.js is © its authors, MIT-licensed (see `js/vendor/THREE-LICENSE`).

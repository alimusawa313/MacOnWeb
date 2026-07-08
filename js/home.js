/* home.js — scroll reveal, hero 3D tilt, FAQ toggle (landing page) */
(function () {
  // Scroll-reveal: fade content up as it enters the viewport.
  var targets = document.querySelectorAll(
    '.section-head, #features .card, #docs .doc-card, #pipeline .codeblock, #cli .cli-cols > div, #docs details'
  );
  targets.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  // Hero 3D pointer tilt (icon a lot, terminal subtly — parallax depth).
  var hero = document.querySelector('.hero');
  if (hero && !matchMedia('(prefers-reduced-motion: reduce)').matches && !matchMedia('(hover: none)').matches) {
    var raf = null, tx = 0, ty = 0;
    function applyTilt() {
      hero.style.setProperty('--px', tx.toFixed(3));
      hero.style.setProperty('--py', ty.toFixed(3));
      raf = null;
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(applyTilt);
    });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(applyTilt); });
  }

  // FAQ — CSS grid-rows animates the open/close; JS just toggles the class.
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();

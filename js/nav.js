/* nav.js — scroll shadow on the sticky nav + mobile hamburger dropdown (shared) */
(function () {
  var nav = document.querySelector('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var btn = document.getElementById('menu-btn');
  var links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  function setOpen(open) {
    links.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { setOpen(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
})();

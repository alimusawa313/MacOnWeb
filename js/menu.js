/* menu.js — mobile hamburger toggles the nav-links dropdown (home & about) */
(function () {
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

/* reveal.js, fade content up as it enters the viewport (shared).
   Anything with [data-reveal] gets revealed; add data-reveal to a container
   with value "children" to stagger its direct children instead. */
(function () {
  var targets = [];
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    if (el.getAttribute('data-reveal') === 'children') {
      Array.prototype.forEach.call(el.children, function (child, i) {
        child.classList.add('reveal');
        child.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
        targets.push(child);
      });
    } else {
      el.classList.add('reveal');
      targets.push(el);
    }
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(function (el) { io.observe(el); });
})();

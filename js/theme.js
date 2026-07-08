/* theme.js — dark/light toggle with a circular reveal + nav scroll shadow (shared) */
(function () {
  var root = document.documentElement;

  function apply(next) {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('macon-theme', next); } catch (e) {}
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute('content', next === 'dark' ? '#000000' : '#ffffff');
  }

  var btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!document.startViewTransition || reduce) {
        apply(next);
        if (!reduce) btn.querySelectorAll('svg').forEach(function (s) {
          s.animate([{ transform: 'rotate(-170deg) scale(.4)', opacity: 0 }, { transform: 'none', opacity: 1 }],
                    { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        });
        return;
      }
      var r = btn.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.startViewTransition(function () { apply(next); }).ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 520, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
      });
    });
  }

  // Follow the system theme unless the user chose one manually.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    try { if (localStorage.getItem('macon-theme')) return; } catch (err) {}
    apply(e.matches ? 'dark' : 'light');
  });

  // Nav gains a shadow once scrolled.
  var nav = document.querySelector('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();

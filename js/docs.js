/* docs.js — mobile sidebar, topic search, "on this page" rail, scrollspy */
(function () {
  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('scrim');
  var menuBtn = document.getElementById('menu-btn');

  if (menuBtn && sidebar && scrim) {
    function closeMenu() {
      sidebar.classList.remove('open'); scrim.classList.remove('show');
      menuBtn.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false');
    }
    menuBtn.addEventListener('click', function () {
      var open = sidebar.classList.toggle('open');
      scrim.classList.toggle('show', open);
      menuBtn.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    scrim.addEventListener('click', closeMenu);
    sidebar.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  }

  // Build the "On this page" rail from section headings.
  var otp = document.getElementById('otp-nav');
  if (otp) {
    document.querySelectorAll('main h2[id]').forEach(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id; a.textContent = h.textContent;
      otp.appendChild(a);
    });
  }

  // Scrollspy — highlight the active section in the sidebar and the rail.
  var headings = Array.prototype.slice.call(document.querySelectorAll('main h2[id]'));
  if (headings.length && 'IntersectionObserver' in window) {
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id); });
      var top = headings.map(function (h) { return h.id; }).filter(function (id) { return visible.has(id); })[0];
      if (!top) return;
      document.querySelectorAll('.sidebar a.active, #otp-nav a.active').forEach(function (a) { a.classList.remove('active'); });
      document.querySelectorAll('.sidebar a[href="#' + top + '"], #otp-nav a[href="#' + top + '"]').forEach(function (a) { a.classList.add('active'); });
    }, { rootMargin: '-64px 0px -70% 0px', threshold: 0 });
    headings.forEach(function (h) { io.observe(h); });
  }

  // Sidebar topic search.
  var input = document.getElementById('doc-search');
  var empty = document.getElementById('side-empty');
  if (input) {
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var anyTotal = false;
      document.querySelectorAll('.sidebar .side-group').forEach(function (group) {
        var any = false;
        group.querySelectorAll('a').forEach(function (a) {
          var match = !q || a.textContent.toLowerCase().indexOf(q) !== -1;
          a.style.display = match ? '' : 'none';
          if (match) any = true;
        });
        group.style.display = any ? '' : 'none';
        if (any) anyTotal = true;
      });
      if (empty) empty.style.display = anyTotal ? 'none' : 'block';
    });
  }
})();

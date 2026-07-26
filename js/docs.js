/* docs.js — mobile sidebar, topic search, and chapterized docs.
   The docs used to be one very long scroll. Here we group the content by the
   sidebar's own sections into "chapters" and show one at a time, with prev/next
   navigation — no HTML restructure, it's partitioned at runtime. */
(function () {
  var sidebar = document.getElementById('sidebar');
  var scrim = document.getElementById('scrim');
  var menuBtn = document.getElementById('menu-btn');
  var main = document.querySelector('.shell main') || document.querySelector('main');

  function closeMenu() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (scrim) scrim.classList.remove('show');
    if (menuBtn) { menuBtn.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    document.body.classList.remove('docs-nav-open');
  }
  if (menuBtn && sidebar && scrim) {
    menuBtn.addEventListener('click', function () {
      var open = sidebar.classList.toggle('open');
      scrim.classList.toggle('show', open);
      menuBtn.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      // Lock the page behind and always open at the top (so the search box
      // isn't scrolled up under the nav).
      document.body.classList.toggle('docs-nav-open', open);
      if (open) sidebar.scrollTop = 0;
    });
    scrim.addEventListener('click', closeMenu);
  }

  // ---- Build the group map from the sidebar (id -> chapter index) ----
  var groupEls = Array.prototype.slice.call(document.querySelectorAll('.sidebar .side-group'));
  var idToGroup = {};
  var groups = [];   // { label, ids: [], el: <container> | null, groupEl }
  groupEls.forEach(function (g, gi) {
    var h4 = g.querySelector('h4');
    var ids = [];
    g.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      idToGroup[id] = gi;
      ids.push(id);
    });
    groups.push({ label: h4 ? h4.textContent.trim() : ('Section ' + (gi + 1)), ids: ids, el: null, groupEl: g });
  });

  // ---- Partition <main> content into chapters ----
  if (main) {
    var nodes = Array.prototype.slice.call(main.childNodes);
    var seenH2 = false, current = null, buckets = {};
    nodes.forEach(function (n) {
      if (n.nodeType === 1 && n.tagName === 'H2' && n.id && idToGroup.hasOwnProperty(n.id)) {
        seenH2 = true; current = idToGroup[n.id];
      }
      if (!seenH2 || current === null) return;          // intro header stays put
      (buckets[current] = buckets[current] || []).push(n);
    });
    groups.forEach(function (grp, gi) {
      if (!buckets[gi] || !buckets[gi].length) return;
      var box = document.createElement('div');
      box.className = 'doc-chapter';
      box.setAttribute('data-group', gi);
      var label = document.createElement('p');
      label.className = 'doc-chapter-label';
      label.textContent = grp.label;
      box.appendChild(label);
      buckets[gi].forEach(function (n) { box.appendChild(n); });
      main.appendChild(box);
      grp.el = box;
    });

    // prev/next between chapters that actually have content
    var withContent = groups.filter(function (g) { return g.el; });
    withContent.forEach(function (grp, i) {
      var nav = document.createElement('div');
      nav.className = 'doc-nav';
      var prev = withContent[i - 1], next = withContent[i + 1];
      if (prev) nav.appendChild(navLink(prev, 'Previous', 'prev'));
      if (next) nav.appendChild(navLink(next, 'Next', 'next'));
      grp.el.appendChild(nav);
    });
  }

  function navLink(grp, kind, cls) {
    var a = document.createElement('a');
    a.className = cls;
    a.href = '#' + grp.ids[0];
    a.innerHTML = '<small>' + kind + '</small><span>' + grp.label + '</span>';
    return a;
  }

  function show(gi, scrollId) {
    groups.forEach(function (grp, idx) {
      if (grp.el) grp.el.classList.toggle('active', +grp.el.getAttribute('data-group') === gi);
      if (grp.groupEl) grp.groupEl.classList.toggle('current', idx === gi);
    });
    var target = scrollId && document.getElementById(scrollId);
    if (target) { target.scrollIntoView({ behavior: 'auto', block: 'start' }); }
    else { window.scrollTo(0, 0); }
  }

  function firstChapter() {
    for (var i = 0; i < groups.length; i++) if (groups[i].el) return i;
    return 0;
  }
  function groupForHash() {
    var id = (location.hash || '').slice(1);
    return idToGroup.hasOwnProperty(id) ? { gi: idToGroup[id], id: id } : { gi: firstChapter(), id: null };
  }

  // Initial chapter from the URL hash (or the first one).
  var start = groupForHash();
  show(start.gi, start.id);

  // Clicking any in-page anchor (sidebar or prev/next) switches chapters.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!idToGroup.hasOwnProperty(id)) return;
    e.preventDefault();
    show(idToGroup[id], id);
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    closeMenu();
  });
  window.addEventListener('hashchange', function () {
    var g = groupForHash();
    show(g.gi, g.id);
  });

  // ---- Scrollspy within the visible chapter ----
  var headings = Array.prototype.slice.call(document.querySelectorAll('main h2[id]'));
  if (headings.length && 'IntersectionObserver' in window) {
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id); });
      var top = headings.map(function (h) { return h.id; }).filter(function (id) { return visible.has(id); })[0];
      if (!top) return;
      document.querySelectorAll('.sidebar a.active').forEach(function (a) { a.classList.remove('active'); });
      document.querySelectorAll('.sidebar a[href="#' + top + '"]').forEach(function (a) { a.classList.add('active'); });
    }, { rootMargin: '-64px 0px -70% 0px', threshold: 0 });
    headings.forEach(function (h) { io.observe(h); });
  }

  // ---- Sidebar topic search ----
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

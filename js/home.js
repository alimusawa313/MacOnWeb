/* home.js, landing page interactions: FAQ accordion, macon.yml code tabs,
   companion phone-mock tabs, and the self-typing hero terminal. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- FAQ, CSS grid-rows animates open/close; JS just toggles the class.
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // ----- Generic tab groups: [data-tabs] buttons drive [data-pane] siblings.
  function wireTabs(tabSel, activeCls, onSelect) {
    document.querySelectorAll(tabSel).forEach(function (group) {
      var tabs = group.querySelectorAll('button');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.remove(activeCls); t.setAttribute('aria-selected', 'false'); });
          tab.classList.add(activeCls);
          tab.setAttribute('aria-selected', 'true');
          onSelect(group, tab);
        });
      });
    });
  }

  // macon.yml showcase tabs
  wireTabs('.code-tabs', 'active', function (group, tab) {
    var host = document.getElementById(group.getAttribute('data-for'));
    if (!host) return;
    host.querySelectorAll('.code-pane').forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-pane') === tab.getAttribute('data-tab'));
    });
  });

  // Companion phone-mock tabs
  wireTabs('.phone-tabs', 'active', function (group, tab) {
    var phone = document.querySelector('.phone');
    var caption = document.querySelector('.phone-caption');
    if (!phone) return;
    phone.querySelectorAll('.pscreen').forEach(function (s) {
      s.classList.toggle('active', s.getAttribute('data-screen') === tab.getAttribute('data-tab'));
    });
    if (caption) caption.textContent = tab.getAttribute('data-caption') || '';
  });

  // ----- Hero terminal, types its script forever.
  var typer = document.getElementById('term-typer');
  if (typer) {
    // [text, cssClass, mode], mode "type" animates per-char, "print" appears at once.
    var SCRIPT = [
      ['$ ', 'p', 'print'],
      ['brew install alimusawa313/macon/macon', '', 'type'],
      ['\n', '', 'print'],
      ['$ ', 'p', 'print'],
      ['macon init', '', 'type'],
      ['            # check the toolchain', 'c', 'print'],
      ['\n  ✓ Xcode 26.6   ✓ fastlane   ✓ SwiftLint   ✓ Simulators\n', 'ok', 'print'],
      ['$ ', 'p', 'print'],
      ['macon watch --workspace acme --repo app --branch main --companion', '', 'type'],
      ['\n👀 Watching acme/app, branch main.\n📱 Companion ready, pair code K7QP-2M9X-4RTD\n🔔 New commit a1b2c3d on main.\n──────── build a1b2c3d ────────\n', 'o', 'print'],
      ['✅ Build passed. TestFlight upload done.\n', 'ok', 'print'],
      ['$ ', 'p', 'print']
    ];

    var cursor = document.createElement('span');
    cursor.className = 'term-cursor';
    typer.appendChild(cursor);

    function put(text, cls) {
      var node;
      if (cls) { node = document.createElement('span'); node.className = cls; node.textContent = text; }
      else { node = document.createTextNode(text); }
      typer.insertBefore(node, cursor);
    }

    if (reduce) {
      SCRIPT.forEach(function (step) { put(step[0], step[1]); });
    } else {
      var si = 0;
      (function step() {
        if (si >= SCRIPT.length) {
          setTimeout(function () {
            while (typer.firstChild !== cursor) typer.removeChild(typer.firstChild);
            si = 0; step();
          }, 6000);
          return;
        }
        var item = SCRIPT[si++];
        if (item[2] === 'print') { put(item[0], item[1]); setTimeout(step, 260); return; }
        var ci = 0;
        (function typeChar() {
          if (ci < item[0].length) {
            put(item[0][ci++], item[1]);
            setTimeout(typeChar, 18 + Math.random() * 40);
          } else setTimeout(step, 220);
        })();
      })();
    }
  }
})();

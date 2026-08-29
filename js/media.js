/* media.js, the real app in motion (shared). Every <video data-src> is lazy:
   it gets its source the first time it scrolls near the viewport, plays while
   visible and pauses when it leaves, so a page of ten phone loops costs
   nothing until you look at it. Videos inside a tabbed .live-phone only play
   when they are the .active one. Videos with sound get a play button and are
   never started on their own. Reduced motion means posters only. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-src]'));
  if (!videos.length) return;

  function load(v) {
    if (v.getAttribute('src')) return;
    v.setAttribute('src', v.getAttribute('data-src'));
    v.load();
  }
  function wants(v) {
    // A tab-driven video only plays while it is the active screen.
    return !v.hasAttribute('data-screen') || v.classList.contains('active');
  }
  function play(v) {
    if (!v.hasAttribute('autoplay-ok')) return;
    load(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  // Autoplaying loops (muted). Anything with a data-src and no .film-play sibling.
  videos.forEach(function (v) {
    var manual = v.parentElement && v.parentElement.querySelector('.film-play');
    if (!manual) v.setAttribute('autoplay-ok', '');
  });

  if (reduce || !('IntersectionObserver' in window)) {
    // Posters only. Still wire the play buttons below.
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        v.__inView = e.isIntersecting;
        if (e.isIntersecting) { if (wants(v)) play(v); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.2, rootMargin: '120px 0px' });
    videos.forEach(function (v) { if (v.hasAttribute('autoplay-ok')) io.observe(v); });
  }

  // Tab switches (home.js) announce the newly active screen.
  document.addEventListener('macon:screen', function (ev) {
    var v = ev.detail && ev.detail.video;
    if (!v) return;
    var group = v.parentElement.querySelectorAll('video[data-screen]');
    group.forEach(function (o) { if (o !== v && !o.paused) o.pause(); });
    if (!reduce) play(v);
  });

  // Videos with sound: a poster and a big play button, controls once playing.
  document.querySelectorAll('.film-play').forEach(function (btn) {
    var film = btn.closest('.film');
    var v = film && film.querySelector('video');
    if (!v) return;
    btn.addEventListener('click', function () {
      load(v);
      v.muted = false;
      v.controls = true;
      film.classList.add('playing');
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
    v.addEventListener('ended', function () { film.classList.remove('playing'); v.controls = false; });
  });
})();

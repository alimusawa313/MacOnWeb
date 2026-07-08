/* code.js — pin the copy button outside the scrolling code box, and copy to clipboard */
(function () {
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      try {
        var t = document.createElement('textarea');
        t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); res();
      } catch (e) { rej(e); }
    });
  }

  // Lift each copy button into a non-scrolling wrapper so it stays pinned.
  document.querySelectorAll('.codeblock').forEach(function (block) {
    var copy = block.querySelector('.copy');
    if (!copy) return;
    var wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    block.parentNode.insertBefore(wrap, block);
    wrap.appendChild(block);
    wrap.appendChild(copy);
  });

  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var block = btn.parentElement.querySelector('.codeblock');
      var text = (block ? block.textContent : '').trim();
      var old = btn.textContent;
      copyText(text)
        .then(function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = old; }, 1400); })
        .catch(function () { btn.textContent = 'Copy failed'; setTimeout(function () { btn.textContent = old; }, 1400); });
    });
  });
})();

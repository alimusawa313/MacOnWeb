/* pro.js, the web checkout page.
   The companion opens this URL with ?plan=<product id> and
   ?rc_app_user_id=<customer id>. The plan preselects a card; the customer id is
   what ties a Paddle purchase back to that install, so we show it, keep it for
   the checkout, and let people copy it. Nothing here talks to a network. */

(function () {
  var params = new URLSearchParams(location.search);

  // Preselect whichever plan the app was showing when it sent us here.
  var plan = params.get('plan');
  if (plan) {
    var card = document.querySelector('[data-plan="' + plan.replace(/[^a-z0-9_]/gi, '') + '"]');
    if (card) {
      card.classList.add('chosen');
      var note = document.getElementById('plan-note');
      if (note) {
        note.textContent = 'Carried over from the app: ' + (card.dataset.label || 'your plan') + '.';
        note.hidden = false;
      }
    }
  }

  // The link code. Only shown when the app actually passed one.
  var id = params.get('rc_app_user_id');
  var box = document.getElementById('linkcode');
  if (id && box) {
    var out = document.getElementById('linkcode-value');
    if (out) out.textContent = id;
    box.hidden = false;
    try { sessionStorage.setItem('macon-rc-app-user-id', id); } catch (e) {}

    var copy = document.getElementById('linkcode-copy');
    if (copy) {
      copy.addEventListener('click', function () {
        var done = function () {
          copy.textContent = 'Copied';
          setTimeout(function () { copy.textContent = 'Copy'; }, 1800);
        };
        if (navigator.clipboard) {
          navigator.clipboard.writeText(id).then(done, function () {});
        } else {
          var sel = window.getSelection();
          var range = document.createRange();
          range.selectNodeContents(out);
          sel.removeAllRanges();
          sel.addRange(range);
          done();
        }
      });
    }
  }

  /* Paddle goes here when the account is live. Keep the custom data key exactly
     as written: RevenueCat's Paddle integration reads rc_app_user_id to attach
     the purchase to the customer the app created, and without it a web buyer's
     phone never unlocks.

     Paddle.Initialize({ token: '<client side token>' });
     Paddle.Checkout.open({
       items: [{ priceId: PRICE_IDS[plan] , quantity: 1 }],
       customData: { rc_app_user_id: id }
     });
  */
})();

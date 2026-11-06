(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Mobile menu */
  var toggle = $('.nav-toggle'), nav = $('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  var page = document.body.getAttribute('data-page');

  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/æ/g, 'ae');
  }

  /* ---------------- Timeline ---------------- */
  if (page === 'timeline') {
    var input = $('#tl-search'), count = $('#tl-count'), empty = $('#tl-empty');
    var chips = $$('.chip[data-filter]'), orderBtn = $('#tl-order'), ledger = $('#ledger');
    var blocks = $$('.era-block');
    var entries = $$('.entry');
    entries.forEach(function (el) {
      var h = $('h3', el);
      el._title = h.textContent;
      el._text = norm(el.textContent + ' ' + el.getAttribute('data-y'));
    });
    var era = 'all', desc = false;

    function apply() {
      var q = norm(input.value.trim());
      var total = 0;
      blocks.forEach(function (b) {
        var bid = b.getAttribute('data-era');
        var n = 0;
        var eraOk = era === 'all' || era === bid;
        $$('.entry', b).forEach(function (el) {
          var ok = eraOk && (!q || el._text.indexOf(q) !== -1);
          el.hidden = !ok;
          var h = $('h3', el);
          if (ok && q) {
            var i = norm(el._title).indexOf(q);
            if (i !== -1) {
              h.innerHTML = '';
              h.append(el._title.slice(0, i));
              var m = document.createElement('mark'); m.textContent = el._title.slice(i, i + q.length); h.append(m);
              h.append(el._title.slice(i + q.length));
            } else h.textContent = el._title;
          } else h.textContent = el._title;
          if (ok) n++;
        });
        b.hidden = n === 0;
        $('.cnt', b).textContent = n;
        total += n;
      });
      // repeated-year marker only when visible neighbour shares the year
      blocks.forEach(function (b) {
        var prev = null;
        $$('.entry', b).forEach(function (el) {
          if (el.hidden) return;
          var y = el.getAttribute('data-y');
          $('.yr', el).classList.toggle('same', y === prev);
          prev = y;
        });
      });
      count.textContent = total + (total === 1 ? ' event' : ' events');
      empty.hidden = total !== 0;
    }

    input.addEventListener('input', apply);
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        era = c.getAttribute('data-filter');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        apply();
        var top = ledger.getBoundingClientRect().top + window.scrollY - 150;
        if (window.scrollY > top) window.scrollTo({ top: top });
      });
    });
    orderBtn.addEventListener('click', function () {
      desc = !desc;
      blocks.slice().reverse().forEach(function (b) { ledger.insertBefore(b, empty); });
      blocks.reverse();
      blocks.forEach(function (b) {
        var box = $('.entries', b);
        $$('.entry', box).reverse().forEach(function (el) { box.appendChild(el); });
      });
      orderBtn.textContent = desc ? 'Newest first ↑' : 'Oldest first ↓';
      apply();
    });

    // Rail highlighting
    var railLinks = $$('.rail a');
    if ('IntersectionObserver' in window && railLinks.length) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) {
            var id = en.target.id;
            railLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
          }
        });
      }, { rootMargin: '-160px 0px -60% 0px' });
      blocks.forEach(function (b) { io.observe(b); });
    }

    // Deep link from old URLs: /timeline#slug
    if (location.hash) {
      var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) setTimeout(function () { t.scrollIntoView({ block: 'center' }); }, 60);
    }
  }

  /* ---------------- Rulers ---------------- */
  if (page === 'rulers') {
    var tip = $('#reign-tip');
    function showTip(el, x, y) {
      var p = el.getAttribute('data-tip').split('|');
      tip.innerHTML = '';
      var b = document.createElement('b'); b.textContent = p[0]; tip.appendChild(b);
      tip.append(p[1]); tip.appendChild(document.createElement('br')); tip.append(p[2]);
      tip.hidden = false;
      var w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = Math.min(Math.max(8, x + 14), window.innerWidth - w - 8) + 'px';
      tip.style.top = (y - h - 12 < 8 ? y + 18 : y - h - 12) + 'px';
    }
    $$('.reign-bar').forEach(function (el) {
      el.addEventListener('mousemove', function (ev) { showTip(el, ev.clientX, ev.clientY); });
      el.addEventListener('mouseleave', function () { tip.hidden = true; });
      el.addEventListener('focus', function () { var r = el.getBoundingClientRect(); showTip(el, r.left, r.top); });
      el.addEventListener('blur', function () { tip.hidden = true; });
    });
    window.addEventListener('scroll', function () { tip.hidden = true; }, { passive: true });

    var rInput = $('#r-search'), groupsBox = $('#r-groups'), sorted = $('#r-sorted'), sortedRows = $('#r-sorted-rows'), rEmpty = $('#r-empty');
    var allRows = $$('.ruler-row');
    var mode = 'house';
    var homes = allRows.map(function (r) { return { el: r, parent: r.parentNode, next: null }; });

    function rApply() {
      var q = norm(rInput.value.trim());
      var shown = 0;
      allRows.forEach(function (r) {
        var ok = !q || norm(r.getAttribute('data-search')).indexOf(q) !== -1;
        r.hidden = !ok; if (ok) shown++;
      });
      $$('.house-group').forEach(function (g) {
        if (g === sorted) return;
        var any = $$('.ruler-row', g).some(function (r) { return !r.hidden; });
        g.hidden = !any || (mode === 'length');
      });
      sorted.hidden = mode !== 'length';
      rEmpty.hidden = shown !== 0;
    }
    rInput.addEventListener('input', rApply);
    $$('.chip[data-sort]').forEach(function (c) {
      c.addEventListener('click', function () {
        mode = c.getAttribute('data-sort');
        $$('.chip[data-sort]').forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        if (mode === 'length') {
          var rows = homes.filter(function (h) { return +h.el.getAttribute('data-len') > 0; })
            .sort(function (a, b) { return b.el.getAttribute('data-len') - a.el.getAttribute('data-len'); });
          rows.forEach(function (h) {
            h.el.style.setProperty('--c', getComputedStyle(h.parent).getPropertyValue('--c'));
            sortedRows.appendChild(h.el);
          });
        } else {
          homes.forEach(function (h) { h.el.style.removeProperty('--c'); });
          homes.forEach(function (h) { h.parent.appendChild(h.el); });
        }
        rApply();
      });
    });
    homes.forEach(function (h) { h.parent = h.el.parentNode; });
  }

  /* ---------------- Houses ---------------- */
  if (page === 'houses') {
    var hchips = $$('.chip[data-htype]');
    hchips.forEach(function (c) {
      c.addEventListener('click', function () {
        var t = c.getAttribute('data-htype');
        hchips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        $$('.house').forEach(function (h) { h.hidden = !(t === 'all' || h.getAttribute('data-type') === t); });
      });
    });
  }
})();

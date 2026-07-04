/* ============================================================================
   TEMPORARY DEV TOOL — Section 2 stage previewer
   ------------------------------------------------------------------------
   This is NOT part of the final site. It exists only so you can click
   through Section 2's 11 stages while we're still styling them one at a
   time and GSAP is intentionally turned off.

   What it does: adds a small floating bar (bottom-right of the screen)
   with "< Prev" / "Next >" buttons and a label showing which stage is
   active. Clicking flips aria-hidden on the stages — the exact same
   attribute the CSS rule `.scroll-stage[aria-hidden="true"] { display:
   none; }` is already keying off of. No GSAP, no scroll logic, just a
   manual switch.

   HOW TO USE:
     1. Add this ONE line near the end of <body>, after section-2's HTML:
          <script src="./javaScript/section-2-preview.js"></script>
     2. Refresh the page. Use the buttons to step through every stage.
     3. When you're ready to wire up the real GSAP scroll story, delete
        this file and remove its script tag. It has nothing else your
        production code depends on.
   ============================================================================ */

(function () {
  'use strict';

  var section = document.querySelector('#section-2-empty-shelf');
  if (!section) return;

  var stages = Array.prototype.slice.call(section.querySelectorAll('.scroll-stage'));
  if (!stages.length) return;

  var current = stages.findIndex(function (s) { return s.getAttribute('aria-hidden') === 'false'; });
  if (current === -1) current = 0;

  function show(index) {
    stages.forEach(function (stage, i) {
      stage.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });
    current = index;
    label.textContent = (index + 1) + ' / ' + stages.length + ' — ' + stages[index].dataset.stage;
  }

  // --- tiny floating control bar, inline styles so it needs no CSS file ---
  var bar = document.createElement('div');
  bar.style.cssText =
    'position:fixed;bottom:18px;right:18px;z-index:9999;' +
    'display:flex;align-items:center;gap:10px;' +
    'background:#241A11;color:#FAF6EF;font-family:sans-serif;font-size:13px;' +
    'padding:10px 14px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,0.3);';

  var prevBtn = document.createElement('button');
  prevBtn.textContent = '< Prev';
  var nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next >';
  [prevBtn, nextBtn].forEach(function (btn) {
    btn.style.cssText =
      'background:#B8794E;color:#fff;border:none;border-radius:999px;' +
      'padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;';
  });

  var label = document.createElement('span');
  label.style.cssText = 'white-space:nowrap;';

  prevBtn.addEventListener('click', function () {
    show((current - 1 + stages.length) % stages.length);
  });
  nextBtn.addEventListener('click', function () {
    show((current + 1) % stages.length);
  });

  bar.appendChild(prevBtn);
  bar.appendChild(label);
  bar.appendChild(nextBtn);
  document.body.appendChild(bar);

  show(current);
})();
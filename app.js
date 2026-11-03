const stops = [...document.querySelectorAll('.stop[id]')];
const hero = document.querySelector('.hero');
const whatsNext = document.querySelector('.whats-next');

// Read headings before KaTeX rewrites them with duplicated text.
const titles = stops.map(stop => stop.querySelector('h2').textContent.trim());

// A transition paragraph introduces the stop after it, so move it inside
// that stop. Otherwise it would be orphaned when only one stop is shown.
document.querySelectorAll('.journey > .transition').forEach(t => {
  const next = t.nextElementSibling?.closest('.stop');
  if (next) next.querySelector('.stop-content').prepend(t);
});

// Sidebar section list
const navList = document.getElementById('nav-list');
stops.forEach((stop, i) => {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = '#' + stop.id;
  a.textContent = titles[i];
  li.appendChild(a);
  navList.appendChild(li);
});
const navLinks = [...navList.querySelectorAll('a')];

// Previous / next links at the end of each stop. The first and last stops
// link to the neighbouring unit page when the body declares one.
const { prevPage, prevTitle, nextPage, nextTitle } = document.body.dataset;

function pagerLink(href, label, title, dir) {
  const a = document.createElement('a');
  a.className = 'pager-link pager-' + dir;
  a.href = href;
  a.innerHTML = '<span class="pager-label"></span><span class="pager-title"></span>';
  a.querySelector('.pager-label').textContent = label;
  a.querySelector('.pager-title').textContent = title;
  return a;
}

stops.forEach((stop, i) => {
  const pager = document.createElement('nav');
  pager.className = 'stop-pager';
  pager.setAttribute('aria-label', 'Stop navigation');

  if (i > 0) {
    pager.appendChild(pagerLink('#' + stops[i - 1].id, '← Previous', titles[i - 1], 'prev'));
  } else if (prevPage) {
    pager.appendChild(pagerLink(prevPage, '← Previous unit', prevTitle, 'prev'));
  }

  const count = document.createElement('span');
  count.className = 'pager-count';
  count.textContent = `${i + 1} / ${stops.length}`;
  pager.appendChild(count);

  if (i < stops.length - 1) {
    pager.appendChild(pagerLink('#' + stops[i + 1].id, 'Next →', titles[i + 1], 'next'));
  } else if (nextPage) {
    pager.appendChild(pagerLink(nextPage, 'Next unit →', nextTitle, 'next'));
  }

  stop.querySelector('.stop-content').appendChild(pager);
});

// Render all KaTeX math
document.querySelectorAll('.math-block').forEach(el => {
  katex.render(el.dataset.math, el, { displayMode: true, throwOnError: false });
});
document.querySelectorAll('.math-inline').forEach(el => {
  katex.render(el.dataset.math, el, { displayMode: false, throwOnError: false });
});

// Paged mode: one stop on screen at a time. The URL hash holds the current
// stop, so refresh, bookmarks and the browser back button all work.
document.body.classList.add('paged');

const progress = document.createElement('div');
progress.className = 'read-progress';
document.body.appendChild(progress);

let current = 0;

function indexFromHash() {
  const i = stops.findIndex(s => '#' + s.id === location.hash);
  return i === -1 ? null : i;
}

function show(i) {
  current = i;
  stops.forEach((stop, j) => stop.classList.toggle('is-current', j === i));
  navLinks.forEach((link, j) => link.classList.toggle('active', j === i));
  if (hero) hero.hidden = i !== 0;
  if (whatsNext) whatsNext.hidden = i !== stops.length - 1;
  progress.style.width = ((i + 1) / stops.length) * 100 + '%';
  document.title = `${titles[i]} · ${document.title.split(' · ').pop()}`;
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', () => {
  const i = indexFromHash();
  if (i !== null) show(i);
});

show(indexFromHash() ?? 0);

// Left / right arrow keys move between stops
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;

  const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  const target = stops[current + step];
  if (!step || !target) return;

  e.preventDefault();
  location.hash = target.id;
});

// Mobile sidebar toggle
const sidebar = document.getElementById('sidebar');
document.getElementById('sidebar-toggle').addEventListener('click', () => {
  sidebar.classList.toggle('open');
});
navList.addEventListener('click', e => {
  if (e.target.tagName === 'A' && window.innerWidth <= 768) {
    sidebar.classList.remove('open');
  }
});

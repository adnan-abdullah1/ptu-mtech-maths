const stops = [...document.querySelectorAll('.stop[id]')];
const titleOf = stop => stop.querySelector('h2').textContent.trim();

// Read headings before KaTeX rewrites them with duplicated text.
const titles = stops.map(titleOf);

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

// Previous / next links at the end of each stop. The first and last stops
// link to the neighbouring unit page when the body declares one.
const { prevPage, prevTitle, nextPage, nextTitle } = document.body.dataset;

function pagerLink(href, label, title, dir) {
  const a = document.createElement('a');
  a.className = 'pager-link pager-' + dir;
  a.href = href;
  a.innerHTML = `<span class="pager-label"></span><span class="pager-title"></span>`;
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

// Progress bar and active stop tracking
const progress = document.createElement('div');
progress.className = 'read-progress';
document.body.appendChild(progress);

const navLinks = [...navList.querySelectorAll('a')];
let currentIndex = 0;

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';

  currentIndex = 0;
  stops.forEach((stop, i) => {
    if (stop.getBoundingClientRect().top <= 140) currentIndex = i;
  });
  navLinks.forEach((link, i) => link.classList.toggle('active', i === currentIndex));
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Left / right arrow keys jump between stops
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;

  let target;
  if (e.key === 'ArrowRight') target = stops[currentIndex + 1];
  if (e.key === 'ArrowLeft') target = stops[currentIndex - 1];
  if (!target) return;

  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth' });
  history.replaceState(null, '', '#' + target.id);
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

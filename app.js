// Render all KaTeX math
document.querySelectorAll('.math-block').forEach(el => {
  katex.render(el.dataset.math, el, { displayMode: true, throwOnError: false });
});

document.querySelectorAll('.math-inline').forEach(el => {
  katex.render(el.dataset.math, el, { displayMode: false, throwOnError: false });
});

// Build sidebar nav from sections
const navList = document.getElementById('nav-list');
const sections = document.querySelectorAll('.card[id]');

sections.forEach(section => {
  const heading = section.querySelector('h2');
  if (!heading) return;

  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = '#' + section.id;
  a.textContent = heading.textContent;
  li.appendChild(a);
  navList.appendChild(li);
});

// Highlight active nav item on scroll
const navLinks = navList.querySelectorAll('a');

function updateActiveNav() {
  let current = '';
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120) {
      current = section.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

// Mobile sidebar toggle
const sidebar = document.getElementById('sidebar');
const toggle = document.getElementById('sidebar-toggle');

toggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Close sidebar when clicking a nav link on mobile
navList.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && window.innerWidth <= 768) {
    sidebar.classList.remove('open');
  }
});

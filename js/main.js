import { initHeroScene } from './three-scene.js';
import { initSkillsScene } from './skills-3d.js';

// ── THEME PICKER ────────────────────────────────────────────────────────────
const THEMES = [
  { id: 'midnight', name: 'Midnight',  dark: true,  colors: ['#0a0a0f','#7c3aed','#06b6d4'] },
  { id: 'light',    name: 'Light',     dark: false, colors: ['#f5f5fa','#6d28d9','#0891b2'] },
  { id: 'crimson',  name: 'Crimson',   dark: true,  colors: ['#0f0608','#e11d48','#f97316'] },
  { id: 'forest',   name: 'Forest',    dark: true,  colors: ['#060f08','#16a34a','#34d399'] },
  { id: 'ocean',    name: 'Ocean',     dark: true,  colors: ['#020c18','#0369a1','#22d3ee'] },
  { id: 'sunset',   name: 'Sunset',    dark: true,  colors: ['#0f080a','#db2777','#fb923c'] },
  { id: 'rosegold', name: 'Rose Gold', dark: false, colors: ['#fdf6f0','#be185d','#d97706'] },
  { id: 'slate',    name: 'Slate',     dark: true,  colors: ['#0d1117','#58a6ff','#79c0ff'] },
  { id: 'neon',     name: 'Neon',      dark: true,  colors: ['#000000','#00ff80','#ff00ff'] },
  { id: 'amber',    name: 'Amber',     dark: true,  colors: ['#0f0a02','#d97706','#fbbf24'] },
];

const html = document.documentElement;

function applyTheme(id) {
  html.setAttribute('data-theme', id);
  localStorage.setItem('theme', id);
  // update active swatch
  document.querySelectorAll('.theme-swatch').forEach(s =>
    s.classList.toggle('active', s.dataset.theme === id)
  );
  // update mode buttons
  const isDark = THEMES.find(t => t.id === id)?.dark !== false;
  document.querySelectorAll('.theme-mode-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === (isDark ? 'dark' : 'light'))
  );
}

// Build swatches
const swatchContainer = document.getElementById('theme-swatches');
THEMES.forEach(t => {
  const btn = document.createElement('button');
  btn.className = 'theme-swatch';
  btn.dataset.theme = t.id;
  btn.setAttribute('aria-label', 'Apply ' + t.name + ' theme');
  btn.innerHTML =
    '<div class="swatch-preview">'
    + '<span style="background:' + t.colors[0] + '"></span>'
    + '<span style="background:' + t.colors[1] + '"></span>'
    + '<span style="background:' + t.colors[2] + '"></span>'
    + '</div>'
    + '<span class="swatch-name">' + t.name + '</span>';
  btn.addEventListener('click', () => { applyTheme(t.id); });
  swatchContainer.appendChild(btn);
});

// Build mode buttons
const modeRow = document.getElementById('theme-mode-row');
[{mode:'dark',label:'Dark'},{mode:'light',label:'Light'}].forEach(m => {
  const btn = document.createElement('button');
  btn.className = 'theme-mode-btn';
  btn.dataset.mode = m.mode;
  btn.textContent = m.label;
  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const currentTheme = THEMES.find(t => t.id === current) || THEMES[0];
    if (m.mode === 'light') {
      // find a light variant or use 'light'
      const lightTheme = THEMES.find(t => !t.dark && t.id !== current) || THEMES.find(t => !t.dark);
      applyTheme(lightTheme ? lightTheme.id : 'light');
    } else {
      const darkTheme = THEMES.find(t => t.dark && t.id !== current) || THEMES.find(t => t.dark);
      applyTheme(darkTheme ? darkTheme.id : 'midnight');
    }
  });
  modeRow.appendChild(btn);
});

// Panel open/close
const pickerBtn   = document.getElementById('theme-picker-btn');
const themePanel  = document.getElementById('theme-panel');
const themeBackdrop = document.getElementById('theme-backdrop');
const panelClose  = document.getElementById('theme-panel-close');

function openPanel()  { themePanel.classList.add('open'); themeBackdrop.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closePanel() { themePanel.classList.remove('open'); themeBackdrop.classList.remove('open'); document.body.style.overflow = ''; }

pickerBtn.addEventListener('click', openPanel);
panelClose.addEventListener('click', closePanel);
themeBackdrop.addEventListener('click', closePanel);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

// Init saved or system theme
const savedTheme = localStorage.getItem('theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (systemDark ? 'midnight' : 'light'));


// ── CURSOR ───────────────────────────────────────────────────────────────────
if (window.matchMedia('(pointer: fine)').matches) {
  const cur = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  let rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
    rx += (e.clientX - rx) * 0.12;
    ry += (e.clientY - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
  });
  document.querySelectorAll('a,button,.project-card,.service-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-grow'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-grow'));
  });
}

// ── SCROLL PROGRESS ──────────────────────────────────────────────────────────
const bar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  bar.style.width = pct + '%';
}, { passive: true });

// ── NAV ──────────────────────────────────────────────────────────────────────
const nav = document.querySelector('nav');
const hamburger = document.querySelector('.hamburger');
const navLinksList = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinksList.classList.toggle('open');
});
navLinksList.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksList.classList.remove('open');
  });
});

// Active nav highlight
const allSections = document.querySelectorAll('section[id], #hero');
const navAs = document.querySelectorAll('.nav-links a');
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting)
      navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { threshold: 0.35 });
allSections.forEach(s => secObs.observe(s));

// ── REVEAL ON SCROLL ─────────────────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal, .tl-item').forEach(el => revealObs.observe(el));

// ── ANIMATED COUNTERS ────────────────────────────────────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const duration = 1800;
  (function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = Number.isInteger(target) ? Math.round(target * ease) : (target * ease).toFixed(1);
    el.textContent = val + suffix;
    if (p < 1) requestAnimationFrame(step);
  })(start);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObs.observe(el));

// ── 3D HERO ──────────────────────────────────────────────────────────────────
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tryInitHero() {
  if (!reduced && typeof window.THREE !== 'undefined') {
    initHeroScene('hero-canvas');
  }
}
// Three.js is a regular <script> (not defer/module) so it should be ready,
// but guard with a small timeout in case of slow CDN
if (typeof window.THREE !== 'undefined') {
  tryInitHero();
} else {
  window.addEventListener('load', tryInitHero);
}

// ── SKILLS DATA ──────────────────────────────────────────────────────────────
const SKILLS = [
  { name: 'Python',     icon: 'python',     group: 'backend', note: 'Primary language - Django, DRF, FastAPI, Flask' },
  { name: 'Go',         icon: 'go',         group: 'backend', note: 'High-performance APIs with Gin framework' },
  { name: 'PHP',        icon: 'php',        group: 'backend', note: 'Symfony & Laravel backend systems' },
  { name: 'Django',     icon: 'django',     group: 'backend', note: 'Production-grade REST APIs & microservices' },
  { name: 'FastAPI',    icon: 'fastapi',    group: 'backend', note: 'Async Python APIs' },
  { name: 'Flask',      icon: 'flask',      group: 'backend', note: 'Lightweight Python services' },
  { name: 'Symfony',    icon: 'symfony',    group: 'backend', note: 'PHP microservices & order management' },
  { name: 'JavaScript', icon: 'javascript', group: 'backend', note: 'Node.js real-time services & tooling' },
  { name: 'n8n',        icon: 'n8n',        group: 'ai',      note: 'Workflow automation & AI integrations' },
  { name: 'React',      icon: 'react',      group: 'backend', note: 'Frontend integration & dashboards' },
  { name: 'PostgreSQL', icon: 'postgresql', group: 'data',    note: 'Complex queries, migrations, indexing' },
  { name: 'MySQL',      icon: 'mysql',      group: 'data',    note: '25-30% query optimisation gains' },
  { name: 'Redis',      icon: 'redis',      group: 'data',    note: 'Caching, pub/sub, presence tracking' },
  { name: 'Docker',     icon: 'docker',     group: 'devops',  note: 'Containerised deployments' },
  { name: 'AWS',        icon: 'aws',        group: 'devops',  note: 'EC2, Lambda, S3 - 20% scalability gain' },
  { name: 'GitHub',     icon: 'github',     group: 'devops',  note: 'CI/CD, code review, GitHub Copilot' },
];

// ── SKILLS 3D / FALLBACK ─────────────────────────────────────────────────────
const tooltip = document.getElementById('skills-tooltip');

function onSkillHover(skill, x, y) {
  if (!skill) { tooltip.style.opacity = '0'; return; }
  tooltip.innerHTML = '<strong>' + skill.name + '</strong><br><span style="color:var(--muted);font-size:.75rem">' + skill.note + '</span>';
  tooltip.style.left = (x + 16) + 'px';
  tooltip.style.top  = (y - 10) + 'px';
  tooltip.style.opacity = '1';
}

function hasWebGL() {
  try { return !!document.createElement('canvas').getContext('webgl'); } catch { return false; }
}

let skillsCleanup = null;

function initSkills(group) {
  if (skillsCleanup) { skillsCleanup(); skillsCleanup = null; }
  const filtered = group === 'all' ? SKILLS : SKILLS.filter(s => s.group === group);
  if (!hasWebGL() || reduced || window.innerWidth < 480 || typeof window.THREE === 'undefined') {
    showFallback(filtered);
    return;
  }
  document.querySelector('.skills-fallback').style.display = 'none';
  document.getElementById('skills-canvas-wrap').style.display = 'block';
  skillsCleanup = initSkillsScene('skills-canvas', filtered, onSkillHover);
}

function showFallback(skills) {
  document.getElementById('skills-canvas-wrap').style.display = 'none';
  const fb = document.querySelector('.skills-fallback');
  fb.style.display = 'grid';
  fb.innerHTML = skills.map(s =>
    '<div class="skill-tile" title="' + s.note + '">' +
    '<img src="assets/icons/' + s.icon + '.svg" alt="' + s.name + '" width="36" height="36">' +
    '<span>' + s.name + '</span></div>'
  ).join('');
}

document.querySelectorAll('.skill-group-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.skill-group-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    initSkills(btn.dataset.group);
  });
});

const skillsSection = document.getElementById('skills');
const skillsObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { initSkills('all'); skillsObs.disconnect(); }
}, { threshold: 0.1 });
skillsObs.observe(skillsSection);

// ── PROJECT MODAL ────────────────────────────────────────────────────────────
const overlay = document.getElementById('modal-overlay');
const modalBox = document.getElementById('modal-box');

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const results = card.dataset.results.split('|').map(r => '<li>' + r + '</li>').join('');
    modalBox.innerHTML =
      '<button class="modal-close" id="modal-close-btn" aria-label="Close">&times;</button>' +
      '<h2>' + card.dataset.title + '</h2>' +
      '<div class="modal-section"><h4>Problem</h4><p>' + card.dataset.problem + '</p></div>' +
      '<div class="modal-section"><h4>Solution</h4><p>' + card.dataset.solution + '</p></div>' +
      '<div class="modal-section"><h4>Stack</h4><p>' + card.dataset.stack + '</p></div>' +
      '<div class="modal-section"><h4>Results</h4><ul>' + results + '</ul></div>';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  });
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') card.click(); });
});

overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── CONTACT FORM ─────────────────────────────────────────────────────────────
document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.target);
  const subject = encodeURIComponent('Portfolio Enquiry from ' + data.get('name'));
  const body = encodeURIComponent('Name: ' + data.get('name') + '\nEmail: ' + data.get('email') + '\n\n' + data.get('message'));
  window.location.href = 'mailto:meerkareem581@gmail.com?subject=' + subject + '&body=' + body;
});

// ── YEAR ─────────────────────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

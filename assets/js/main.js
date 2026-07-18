const root = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeIcon = document.querySelector('[data-theme-icon]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('#mobile-menu');

const icons = {
  dark: '<path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/>',
  light: '<path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5 8.5 8.5 0 1 0 20.5 14.4Z"/>'
};

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('portfolio-theme', theme);
  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  themeToggle.setAttribute('aria-pressed', String(!isDark));
  themeIcon.innerHTML = icons[theme];
}

setTheme(root.dataset.theme || 'dark');
themeToggle.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  menuToggle.setAttribute('aria-label', `${open ? 'Open' : 'Close'} navigation menu`);
  mobileMenu.hidden = open;
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mobileMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
}));

// Lightweight count-up animation; data-gsap hooks in the markup keep the hero ready for a future GSAP timeline.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('[data-count]').forEach((stat) => {
  const target = Number(stat.dataset.count);
  const suffix = stat.dataset.suffix || '';
  if (reduceMotion) { stat.textContent = `${target}${suffix}`; return; }
  const start = performance.now();
  const duration = 950;
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    stat.textContent = `${Math.round((1 - (1 - progress) ** 3) * target)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

// Keep the visual marquee duplicate perfectly in sync without exposing it to assistive technology.
const techLists = document.querySelectorAll('.tech-track .tech-list');
if (techLists.length === 2) {
  const duplicate = techLists[0].cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  techLists[1].replaceWith(duplicate);
}

const projectContainer = document.querySelector('#project-showcase');
const projectArrow = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 5h5v5M19 5l-8 8M5 7v12h12"/></svg>';
const githubIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.9.1-.6.4-1.1.7-1.3-2.3-.3-4.7-1.2-4.7-5.2 0-1.2.4-2.1 1-2.9-.1-.3-.4-1.4.1-2.9 0 0 .8-.3 3 1.1a10 10 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.5 1.5.2 2.6.1 2.9.7.8 1 1.7 1 2.9 0 4-2.4 4.9-4.7 5.2.4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2"/></svg>';

if (projectContainer && Array.isArray(window.portfolioProjects)) {
  projectContainer.innerHTML = window.portfolioProjects.map((project, index) => `
    <article class="work-project ${index % 2 ? 'work-project--reverse' : ''}" data-reveal>
      <div class="work-image-frame ${project.accent}">
        <div class="work-image-fallback" aria-hidden="true"><span>${String(index + 1).padStart(2, '0')}</span><strong>${project.title}</strong></div>
        <div class="work-image-shell">
          <img src="${project.image}" alt="${project.alt}" width="${project.width}" height="${project.height}" loading="lazy" decoding="async" data-project-title="${project.title}" data-image-path="${project.image}" />
        </div>
      </div>
      <div class="work-content">
        <p class="work-index">${String(index + 1).padStart(2, '0')} / ${project.label}</p>
        <h3 class="display-title">${project.title}</h3>
        <p class="body-copy">${project.description}</p>
        <ul class="work-tags" aria-label="Technologies used">${project.technologies.map((technology) => `<li>${technology}</li>`).join('')}</ul>
        <div class="work-actions">
          <a class="button-primary focus-ring" href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" aria-label="View ${project.title} live demo (opens in a new tab)">Live Demo ${projectArrow}</a>
          <a class="button-secondary focus-ring" href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" aria-label="View ${project.title} source on GitHub (opens in a new tab)">${githubIcon} GitHub</a>
        </div>
      </div>
    </article>`).join('');

  projectContainer.querySelectorAll('.work-image-shell img').forEach((img) => {
    const frame = img.closest('.work-image-frame');
    const revealImage = () => {
      if (frame) frame.classList.add('image-ready');
    };

    img.addEventListener('load', revealImage);
    img.addEventListener('error', () => {
      if (frame) {
        frame.classList.remove('image-ready');
      }
      console.warn(`Project image failed to load: ${img.dataset.projectTitle || 'Unknown project'} (${img.dataset.imagePath || 'unknown path'})`);
    });

    if (img.complete && img.naturalWidth > 0) {
      revealImage();
    }
  });
}

const revealItems = document.querySelectorAll('[data-reveal]');
if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); currentObserver.unobserve(entry.target); }
  }), { threshold: 0.14 });
  revealItems.forEach((item) => observer.observe(item));
} else { revealItems.forEach((item) => item.classList.add('is-revealed')); }

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {

    const formData = new FormData(contactForm);

    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const service = String(formData.get('service') || '').trim();
    const message = String(formData.get('message') || '').trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !service || !message) {
      event.preventDefault();

      formStatus.className = 'form-status is-error';
      formStatus.textContent =
        'Please complete every field so I can understand your idea clearly.';
      return;
    }

    if (!emailPattern.test(email)) {
      event.preventDefault();

      formStatus.className = 'form-status is-error';
      formStatus.textContent =
        'Please enter a valid email address so I can reply to your message.';
      return;
    }

    formStatus.className = 'form-status is-success';
    formStatus.textContent = 'Sending your message...';

    // Do NOT call preventDefault().
    // Browser submits the form to FormSubmit.
  });
}

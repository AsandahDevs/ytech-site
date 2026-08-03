document.documentElement.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');
const navigationLinks = [...document.querySelectorAll('.nav-link')];
const internalLinks = [...document.querySelectorAll('a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const backToTop = document.querySelector('[data-back-to-top]');

const closeMenu = () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open navigation menu');
  navigation?.classList.remove('open');
  document.body.classList.remove('menu-open');
};

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  navigation?.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

internalLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    const target = targetId && targetId.length > 1 ? document.querySelector(targetId) : null;
    if (!target) return;

    event.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', targetId);
  });
});

const revealElements = document.querySelectorAll('.reveal');
if (!('IntersectionObserver' in window) || reducedMotion) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -40px' });
  revealElements.forEach((element) => revealObserver.observe(element));
}

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visibleSection) return;

    navigationLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${visibleSection.target.id}`;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-30% 0px -60%', threshold: [0, .2, .5] });
  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const updateBackToTop = () => {
  const revealPoint = Math.max(420, window.innerHeight * 0.65);
  backToTop?.classList.toggle('visible', window.scrollY > revealPoint);
};

updateBackToTop();
window.addEventListener('scroll', updateBackToTop, { passive: true });
window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMenu(); });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

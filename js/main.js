document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.querySelector('#current-year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  const themeButton = document.querySelector('#theme-toggle');
  const applyTheme = (isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
    if (themeButton) {
      const label = isDark ? 'Tema claro' : 'Tema oscuro';
      themeButton.setAttribute('aria-label', `Cambiar a ${isDark ? 'tema claro' : 'tema oscuro'}`);
      themeButton.title = `Cambiar a ${isDark ? 'tema claro' : 'tema oscuro'}`;
      themeButton.querySelector('i').className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
      themeButton.querySelector('span').textContent = label;
    }
  };

  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem('bi-academy-theme') || 'light';
  } catch (error) {
    savedTheme = 'light';
  }
  applyTheme(savedTheme === 'dark');
  themeButton?.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    applyTheme(isDark);
    try {
      localStorage.setItem('bi-academy-theme', isDark ? 'dark' : 'light');
    } catch (error) {
      // El cambio visual sigue funcionando si el navegador bloquea el almacenamiento.
    }
  });

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('#mainNav .nav-link, #mainNav .nav-cta, #mainNav .nav-quiz-button').forEach((link) => {
    link.addEventListener('click', () => {
      const menu = document.querySelector('#mainNav');
      if (menu && menu.classList.contains('show') && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });
});

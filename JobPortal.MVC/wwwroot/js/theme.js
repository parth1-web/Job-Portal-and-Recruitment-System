(function() {
  'use strict';

  const THEME_KEY = 'jobportal-theme';
  const THEME_ATTR = 'data-theme';
  const DEFAULT_THEME = 'light';

  const themes = ['light', 'dark', 'blue', 'green', 'purple', 'orange'];

  function getTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && themes.includes(stored)) {
      return stored;
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return DEFAULT_THEME;
  }

  function setTheme(theme) {
    if (!themes.includes(theme)) {
      theme = DEFAULT_THEME;
    }
    document.documentElement.setAttribute(THEME_ATTR, theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcons(theme);
    dispatchThemeChangeEvent(theme);
  }

  function updateThemeIcons(theme) {
    const sunIcons = document.querySelectorAll('[data-theme-icon="sun"]');
    const moonIcons = document.querySelectorAll('[data-theme-icon="moon"]');
    const themeIcons = document.querySelectorAll('[data-theme-icon]');

    sunIcons.forEach(icon => {
      icon.style.display = theme === 'dark' ? 'block' : 'none';
    });

    moonIcons.forEach(icon => {
      icon.style.display = theme === 'dark' ? 'none' : 'block';
    });

    themeIcons.forEach(icon => {
      const iconTheme = icon.getAttribute('data-theme-icon');
      if (iconTheme && iconTheme !== 'sun' && iconTheme !== 'moon') {
        icon.style.display = iconTheme === theme ? 'block' : 'none';
      }
    });
  }

  function dispatchThemeChangeEvent(theme) {
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme }
    }));
  }

  function initTheme() {
    const theme = getTheme();
    setTheme(theme);

    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute(THEME_ATTR);
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
      });
    });

    const themeSelect = document.querySelector('[data-theme-select]');
    if (themeSelect) {
      themeSelect.value = theme;
      themeSelect.addEventListener('change', (e) => {
        setTheme(e.target.value);
      });
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  window.ThemeManager = {
    getTheme,
    setTheme,
    themes
  };
})();
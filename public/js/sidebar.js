(function() {
  'use strict';

  const SIDEBAR_KEY = 'jobportal-sidebar-collapsed';
  const MOBILE_BREAKPOINT = 1024;

  function getSidebarState() {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    return stored === 'true';
  }

  function setSidebarState(collapsed) {
    localStorage.setItem(SIDEBAR_KEY, collapsed.toString());
    document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    updateSidebarElements(collapsed);
    dispatchSidebarChangeEvent(collapsed);
  }

  function updateSidebarElements(collapsed) {
    const sidebar = document.querySelector('.sidebar');
    const header = document.querySelector('.header');
    const mainContent = document.querySelector('.main-content');
    const toggleButtons = document.querySelectorAll('[data-sidebar-toggle]');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar) {
      sidebar.classList.toggle('collapsed', collapsed);
      sidebar.setAttribute('aria-expanded', (!collapsed).toString());
    }

    if (header) {
      header.classList.toggle('sidebar-collapsed', collapsed);
    }

    if (mainContent) {
      mainContent.classList.toggle('sidebar-collapsed', collapsed);
    }

    toggleButtons.forEach(btn => {
      btn.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
      btn.setAttribute('aria-expanded', (!collapsed).toString());
      const icon = btn.querySelector('svg');
      if (icon) {
        icon.style.transform = collapsed ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });

    if (window.innerWidth < MOBILE_BREAKPOINT) {
      if (overlay) {
        overlay.classList.toggle('open', !collapsed);
      }
      if (sidebar) {
        sidebar.classList.toggle('open', !collapsed);
      }
    }
  }

  function dispatchSidebarChangeEvent(collapsed) {
    window.dispatchEvent(new CustomEvent('sidebarchange', {
      detail: { collapsed }
    }));
  }

  function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleButtons = document.querySelectorAll('[data-sidebar-toggle]');
    const overlay = document.querySelector('.sidebar-overlay');

    const isCollapsed = getSidebarState();
    if (isCollapsed && window.innerWidth >= MOBILE_BREAKPOINT) {
      setSidebarState(true);
    }

    toggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentState = document.body.classList.contains('sidebar-collapsed');
        setSidebarState(!currentState);
      });
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        if (window.innerWidth < MOBILE_BREAKPOINT) {
          setSidebarState(true);
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && window.innerWidth < MOBILE_BREAKPOINT) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          setSidebarState(true);
        }
      }
    });

    const navLinks = document.querySelectorAll('.nav-link[data-submenu]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const submenuId = link.getAttribute('data-submenu');
        const submenu = document.getElementById(submenuId);
        const isOpen = link.classList.contains('open');

        document.querySelectorAll('.nav-link[data-submenu].open').forEach(openLink => {
          if (openLink !== link) {
            openLink.classList.remove('open');
            const openSubmenu = document.getElementById(openLink.getAttribute('data-submenu'));
            if (openSubmenu) openSubmenu.classList.remove('open');
          }
        });

        link.classList.toggle('open', !isOpen);
        if (submenu) {
          submenu.classList.toggle('open', !isOpen);
        }
      });
    });

    const mobileMenuBtn = document.querySelector('[data-mobile-menu-toggle]');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        const isOpen = document.body.classList.contains('sidebar-collapsed');
        setSidebarState(!isOpen);
      });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (window.innerWidth >= MOBILE_BREAKPOINT) {
          if (overlay) overlay.classList.remove('open');
          if (sidebar) sidebar.classList.remove('open');
          const isCollapsed = getSidebarState();
          setSidebarState(isCollapsed);
        } else {
          if (sidebar && !sidebar.classList.contains('open')) {
            sidebar.classList.remove('collapsed');
          }
        }
      }, 150);
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.querySelector('[data-sidebar-toggle]');
        const mobileMenuBtn = document.querySelector('[data-mobile-menu-toggle]');

        if (sidebar && sidebar.classList.contains('open')) {
          const isClickInsideSidebar = sidebar.contains(e.target);
          const isClickOnToggle = toggleBtn && toggleBtn.contains(e.target);
          const isClickOnMobileBtn = mobileMenuBtn && mobileMenuBtn.contains(e.target);

          if (!isClickInsideSidebar && !isClickOnToggle && !isClickOnMobileBtn) {
            setSidebarState(true);
          }
        }
      }
    });

    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-link[href]');
    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href && currentPath.startsWith(href) && href !== '/') {
        item.classList.add('active');
        const submenuId = item.getAttribute('data-submenu');
        if (submenuId) {
          const submenu = document.getElementById(submenuId);
          const parentLink = document.querySelector(`[data-submenu="${submenuId}"]`);
          if (parentLink && submenu) {
            parentLink.classList.add('open');
            submenu.classList.add('open');
          }
        }
      } else if (href === '/' && currentPath === '/') {
        item.classList.add('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }

  window.SidebarManager = {
    getState: getSidebarState,
    setState: setSidebarState,
    toggle: () => setSidebarState(!getSidebarState()),
    collapse: () => setSidebarState(true),
    expand: () => setSidebarState(false)
  };
})();
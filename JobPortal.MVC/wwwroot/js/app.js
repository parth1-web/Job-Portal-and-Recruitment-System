(function() {
  'use strict';

  function initDropdowns() {
    document.addEventListener('click', (e) => {
      const toggles = document.querySelectorAll('[data-dropdown-toggle]');
      const dropdowns = document.querySelectorAll('.dropdown');

      toggles.forEach(toggle => {
        const dropdown = toggle.closest('.dropdown');
        if (dropdown && (toggle === e.target || toggle.contains(e.target))) {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = dropdown.classList.contains('open');

          dropdowns.forEach(d => d.classList.remove('open'));
          if (!isOpen) {
            dropdown.classList.add('open');
          }
        }
      });

      if (!e.target.closest('.dropdown')) {
        dropdowns.forEach(d => d.classList.remove('open'));
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
      }
    });
  }

  function initModals() {
    const openButtons = document.querySelectorAll('[data-modal-open]');
    const closeButtons = document.querySelectorAll('[data-modal-close]');
    const modals = document.querySelectorAll('.modal');

    openButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = btn.getAttribute('data-modal-open');
        const modal = document.getElementById(modalId);
        if (modal) {
          openModal(modal);
        }
      });
    });

    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) {
          closeModal(modal);
        }
      });
    });

    modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.open').forEach(closeModal);
      }
    });

    function openModal(modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
      modal.dispatchEvent(new CustomEvent('modalopen'));
    }

    function closeModal(modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      modal.dispatchEvent(new CustomEvent('modalclose'));
    }
  }

  function initToasts() {
    window.showToast = function(message, type = 'info', duration = 5000) {
      const container = getOrCreateToastContainer();
      const toast = createToast(message, type);
      container.appendChild(toast);

      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      if (duration > 0) {
        setTimeout(() => {
          hideToast(toast);
        }, duration);
      }

      return toast;
    };

    function getOrCreateToastContainer() {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
      }
      return container;
    }

    function createToast(message, type) {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'assertive');

      const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
      };

      toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close notification">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;

      toast.querySelector('.toast-close').addEventListener('click', () => hideToast(toast));

      return toast;
    }

    function hideToast(toast) {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      }, { once: true });
    }
  }

  function initForms() {
    document.querySelectorAll('form[data-ajax]').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        const formData = new FormData(form);

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner spinner-sm spinner-white"></span> Processing...';
          }

          const response = await fetch(form.action, {
            method: form.method || 'POST',
            body: formData,
            headers: {
              'X-Requested-With': 'XMLHttpRequest'
            }
          });

          const contentType = response.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            // Server returned HTML (normal MVC post/redirect). Let the browser handle it.
            if (response.redirected) {
              window.location.href = response.url;
            } else {
              window.location.reload();
            }
            return;
          }

          const data = await response.json();

          if (response.ok) {
            showToast(data.message || 'Success!', 'success');
            if (data.redirectUrl) {
              setTimeout(() => window.location.href = data.redirectUrl, 1000);
            } else if (form.dataset.reset === 'true') {
              form.reset();
            }
            form.dispatchEvent(new CustomEvent('formsuccess', { detail: data }));
          } else {
            showToast(data.message || 'An error occurred', 'error');
            if (data.errors) {
              displayValidationErrors(form, data.errors);
            }
            form.dispatchEvent(new CustomEvent('formerror', { detail: data }));
          }
        } catch (error) {
          showToast('Network error. Please try again.', 'error');
          form.dispatchEvent(new CustomEvent('formerror', { detail: { error: error.message } }));
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        }
      });
    });

    function displayValidationErrors(form, errors) {
      form.querySelectorAll('.form-error').forEach(el => el.remove());
      form.querySelectorAll('.form-input.error, .form-select.error, .form-textarea.error').forEach(el => el.classList.remove('error'));

      Object.entries(errors).forEach(([field, messages]) => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input) {
          input.classList.add('error');
          const errorDiv = document.createElement('div');
          errorDiv.className = 'form-error';
          errorDiv.textContent = Array.isArray(messages) ? messages[0] : messages;
          input.parentNode.appendChild(errorDiv);
        }
      });
    }

    document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorDiv = input.parentNode.querySelector('.form-error');
        if (errorDiv) errorDiv.remove();
      });
    });
  }

  function initPasswordStrength() {
    document.querySelectorAll('[data-password-strength]').forEach(input => {
      const meter = document.createElement('div');
      meter.className = 'password-strength';
      meter.innerHTML = '<div class="password-strength-bar"><div class="password-strength-fill"></div></div><div class="password-strength-text"></div>';
      input.parentNode.appendChild(meter);

      input.addEventListener('input', () => {
        const strength = calculatePasswordStrength(input.value);
        const fill = meter.querySelector('.password-strength-fill');
        const text = meter.querySelector('.password-strength-text');

        fill.className = `password-strength-fill ${strength.level}`;
        text.textContent = strength.text;
      });
    });

    function calculatePasswordStrength(password) {
      let score = 0;
      const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      };

      Object.values(checks).forEach(check => { if (check) score++; });

      if (password.length === 0) return { level: '', text: '' };
      if (score <= 1) return { level: 'weak', text: 'Weak password' };
      if (score === 2) return { level: 'fair', text: 'Fair password' };
      if (score === 3) return { level: 'good', text: 'Good password' };
      return { level: 'strong', text: 'Strong password' };
    }
  }

  function initFileUpload() {
    document.querySelectorAll('.file-upload').forEach(upload => {
      const input = upload.querySelector('.file-upload-input');
      const preview = upload.querySelector('.file-upload-preview');

      upload.addEventListener('click', (e) => {
        if (e.target === upload || e.target.closest('.file-upload-text') || e.target.closest('.file-upload-icon')) {
          input.click();
        }
      });

      upload.addEventListener('dragover', (e) => {
        e.preventDefault();
        upload.classList.add('drag-over');
      });

      upload.addEventListener('dragleave', () => {
        upload.classList.remove('drag-over');
      });

      upload.addEventListener('drop', (e) => {
        e.preventDefault();
        upload.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
          input.files = e.dataTransfer.files;
          input.dispatchEvent(new Event('change'));
        }
      });

      input.addEventListener('change', () => {
        if (preview) {
          preview.innerHTML = '';
          Array.from(input.files).forEach(file => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'file-preview-item';
                item.innerHTML = `
                  <img src="${e.target.result}" alt="${file.name}">
                  <button type="button" class="file-preview-remove" aria-label="Remove ${file.name}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                `;
                item.querySelector('.file-preview-remove').addEventListener('click', (ev) => {
                  ev.stopPropagation();
                  const dt = new DataTransfer();
                  Array.from(input.files).filter(f => f !== file).forEach(f => dt.items.add(f));
                  input.files = dt.files;
                  input.dispatchEvent(new Event('change'));
                });
                preview.appendChild(item);
              };
              reader.readAsDataURL(file);
            }
          });
        }
      });
    });
  }

  function initConfirmActions() {
    document.addEventListener('click', (e) => {
      const confirmBtn = e.target.closest('[data-confirm]');
      if (confirmBtn) {
        e.preventDefault();
        const message = confirmBtn.getAttribute('data-confirm');
        if (confirm(message)) {
          if (confirmBtn.tagName === 'A') {
            window.location.href = confirmBtn.href;
          } else if (confirmBtn.tagName === 'BUTTON' && confirmBtn.form) {
            confirmBtn.form.submit();
          } else if (confirmBtn.dataset.action) {
            eval(confirmBtn.dataset.action);
          }
        }
      }
    });
  }

  function initCopyToClipboard() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = btn.getAttribute('data-copy');
        try {
          await navigator.clipboard.writeText(text);
          showToast('Copied to clipboard!', 'success', 2000);
        } catch {
          showToast('Failed to copy', 'error');
        }
      });
    });
  }

  function initScrollToTop() {
    const btn = document.createElement('button');
    btn.className = 'scroll-to-top btn btn-icon btn-outline-secondary';
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="15" x2="12" y2="9"/><line x1="6" y1="15" x2="12" y2="9"/></svg>';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; z-index: 400; opacity: 0; visibility: hidden; transform: translateY(20px); transition: all var(--transition-normal);';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.style.opacity = '1';
        btn.style.visibility = 'visible';
        btn.style.transform = 'translateY(0)';
      } else {
        btn.style.opacity = '0';
        btn.style.visibility = 'hidden';
        btn.style.transform = 'translateY(20px)';
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '50px' });

      document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
    }
  }

  function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  }

  function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
  }

  // Job actions
  window.saveJob = async function(jobId) {
    const btn = document.querySelector(`.save-job-btn[data-job-id="${jobId}"]`);
    const isSaved = btn && btn.classList.contains('saved');
    const endpoint = isSaved
      ? `/Jobs/Unsave?jobId=${encodeURIComponent(jobId)}`
      : `/Jobs/Save?jobId=${encodeURIComponent(jobId)}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': window.appConfig?.csrfToken || ''
        }
      });

      if (response.status === 401) {
        showToast('Please sign in to save jobs.', 'warning');
        setTimeout(() => { window.location.href = '/Auth/Login?returnUrl=' + encodeURIComponent(window.location.pathname); }, 800);
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast(data.message, 'success');
        // Toggle button state
        if (btn) {
          btn.classList.toggle('saved');
          btn.setAttribute('aria-label', btn.classList.contains('saved') ? 'Remove from saved jobs' : 'Save job');
        }
      } else {
        showToast(data.message || 'Failed to save job', 'error');
        if (data.redirectUrl) {
          setTimeout(() => window.location.href = data.redirectUrl, 1200);
        }
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    }
  };

  window.applyToJob = async function(jobId, formData) {
    try {
      const response = await fetch(`/Jobs/Apply?jobId=${encodeURIComponent(jobId)}`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': window.appConfig?.csrfToken || ''
        }
      });
      
      if (response.status === 401) {
        showToast('Please sign in as a candidate to apply.', 'warning');
        setTimeout(() => { window.location.href = '/Auth/Login?returnUrl=' + encodeURIComponent(window.location.pathname); }, 800);
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast(data.message, 'success');
        if (data.redirectUrl) {
          setTimeout(() => window.location.href = data.redirectUrl, 1000);
        }
      } else {
        showToast(data.message || 'Failed to submit application', 'error');
        if (data.redirectUrl) {
          setTimeout(() => window.location.href = data.redirectUrl, 1200);
        }
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    }
  };

  function initHeaderNotifications() {
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-mark-all-read]');
      if (!btn) return;
      e.preventDefault();
      try {
        const response = await fetch('/Notifications/MarkAllRead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': window.appConfig?.csrfToken || ''
          }
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success !== false) {
          document.querySelectorAll('.notification-item.unread').forEach(item => item.classList.remove('unread'));
          const badge = document.getElementById('notificationBadge');
          if (badge) badge.style.display = 'none';
          const list = document.getElementById('notificationList');
          showToast('All notifications marked as read.', 'success');
          if (list && !list.querySelector('.notification-item.unread')) {
            // Refresh the dropdown count display only; list stays as-is.
          }
        } else {
          showToast('Failed to mark notifications as read.', 'error');
        }
      } catch (error) {
        showToast('Network error. Please try again.', 'error');
      }
    });
  }

  function init() {
    initDropdowns();
    initModals();
    initToasts();
    initForms();
    initPasswordStrength();
    initFileUpload();
    initConfirmActions();
    initCopyToClipboard();
    initScrollToTop();
    initLazyLoading();
    initKeyboardNavigation();
    initAnimations();
    initHeaderNotifications();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.App = {
    showToast: window.showToast
  };
})();
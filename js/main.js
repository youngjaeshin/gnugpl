/* Shared, progressively enhanced navigation, publication filters and gallery. */
document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (hamburger && menu) {
    const desktop = window.matchMedia('(min-width: 960px)');
    function setMenu(open, returnFocus = false) {
      menu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      if (returnFocus) hamburger.focus();
    }
    document.documentElement.classList.add('nav-ready');
    hamburger.hidden = false;
    hamburger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    menu.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
    document.addEventListener('click', event => {
      if (!event.target.closest('#navbar')) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('open')) setMenu(false, true);
    });
    desktop.addEventListener('change', () => setMenu(false));
  }

  const filters = document.querySelector('[data-publication-filters]');
  const papers = [...document.querySelectorAll('#publication-list .pub-item[data-year]')];
  if (filters && papers.length) {
    const buttons = [...filters.querySelectorAll('[data-year-filter]')];
    const count = document.getElementById('publication-count');
    filters.hidden = false;
    function filterYear(year) {
      let visible = 0;
      papers.forEach(paper => {
        paper.hidden = year !== 'all' && paper.dataset.year !== year;
        if (!paper.hidden) visible++;
      });
      buttons.forEach(button => {
        const active = button.dataset.yearFilter === year;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (count) count.textContent = `${year === 'all' ? '전체' : year + '년'} ${visible}편`;
    }
    buttons.forEach(button => button.addEventListener('click', () => filterYear(button.dataset.yearFilter)));
    window.addEventListener('hashchange', () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target && papers.includes(target)) {
        filterYear('all');
        target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      }
    });
  }

  const photos = [...document.querySelectorAll('.gallery-item')].filter(item => item.querySelector('img'));
  if (photos.length && typeof HTMLDialogElement !== 'undefined') {
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', '연구실 사진 확대');
    dialog.innerHTML = '<button type="button" class="lightbox-close" aria-label="사진 닫기">닫기</button><img alt=""><p></p>';
    document.body.append(dialog);
    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('p');
    let trigger;
    let previousOverflow = '';
    photos.forEach(item => item.addEventListener('click', () => {
      trigger = item;
      const original = item.querySelector('img');
      image.src = original.src;
      image.alt = original.alt;
      caption.textContent = item.dataset.caption || original.alt;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    }));
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      image.removeAttribute('src');
      if (trigger) trigger.focus();
    });
  }

  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    function updateBackToTop() {
      backToTop.hidden = window.scrollY <= 400;
      backToTop.style.opacity = '1';
      backToTop.style.pointerEvents = 'auto';
    }
    updateBackToTop();
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      document.getElementById('main-content')?.focus({ preventScroll: true });
    });
  }
});

/* ============================================================
   GNU Geophysics Lab — main.js
   Mobile nav toggle, scroll reveal, smooth scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Mobile nav toggle ---- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      // animate icon
      const lines = hamburger.querySelectorAll('span');
      if (isOpen) {
        lines[0].style.transform = 'translateY(8px) rotate(45deg)';
        lines[1].style.opacity  = '0';
        lines[2].style.transform = 'translateY(-8px) rotate(-45deg)';
      } else {
        lines[0].style.transform = '';
        lines[1].style.opacity  = '';
        lines[2].style.transform = '';
      }
    });

    // close on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        const lines = hamburger.querySelectorAll('span');
        lines[0].style.transform = '';
        lines[1].style.opacity  = '';
        lines[2].style.transform = '';
      }
    });
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---- Active nav link ---- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- Publication year filter ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const pubItems   = document.querySelectorAll('[data-year]');

  if (filterBtns.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const year = btn.dataset.filter;

        pubItems.forEach(function (item) {
          if (year === 'all' || item.dataset.year === year) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---- Gallery lightbox (minimal) ---- */
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (galleryItems.length > 0) {
    // create overlay
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
      <div id="lightbox-backdrop" style="
        position:fixed;inset:0;background:rgba(0,0,0,0.88);
        z-index:9000;display:none;align-items:center;
        justify-content:center;padding:1.5rem;
      ">
        <button id="lightbox-close" aria-label="닫기" style="
          position:absolute;top:1.25rem;right:1.5rem;
          background:rgba(255,255,255,0.12);border:none;
          color:white;font-size:1.5rem;cursor:pointer;
          width:42px;height:42px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
        ">✕</button>
        <img id="lightbox-img" src="" alt="" style="
          max-width:100%;max-height:85vh;border-radius:6px;
          box-shadow:0 20px 60px rgba(0,0,0,0.5);
        "/>
        <p id="lightbox-caption" style="
          position:absolute;bottom:2rem;left:0;right:0;
          text-align:center;color:rgba(255,255,255,0.75);
          font-size:0.85rem;
        "></p>
      </div>
    `;
    document.body.appendChild(lightbox);

    const backdrop = document.getElementById('lightbox-backdrop');
    const lbImg    = document.getElementById('lightbox-img');
    const lbCap    = document.getElementById('lightbox-caption');
    const lbClose  = document.getElementById('lightbox-close');

    function openLightbox(src, caption) {
      lbImg.src = src;
      lbCap.textContent = caption || '';
      backdrop.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      backdrop.style.display = 'none';
      document.body.style.overflow = '';
      lbImg.src = '';
    }

    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () {
        const img     = item.querySelector('img');
        const caption = item.dataset.caption || '';
        if (img) openLightbox(img.src, caption);
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ---- Back to top button ---- */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.style.opacity = '1';
        backToTop.style.pointerEvents = 'auto';
      } else {
        backToTop.style.opacity = '0';
        backToTop.style.pointerEvents = 'none';
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});

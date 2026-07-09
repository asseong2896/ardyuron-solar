// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ===== ACTIVE NAV LINK =====
const sections   = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-links a:not(.nav-cta)');

function updateActiveLink() {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 140) current = s.id;
  });
  navLinkEls.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}
window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    setTimeout(() => entry.target.classList.add('visible'), i * 70);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
let countersStarted = false;

const statsObserver = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting || countersStarted) return;
  countersStarted = true;

  document.querySelectorAll('.stat-number').forEach(counter => {
    const target   = parseInt(counter.dataset.target, 10);
    const duration = 1600;
    const steps    = 60;
    const inc      = target / steps;
    let   current  = 0;
    let   step     = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(inc * step), target);
      counter.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, duration / steps);
  });

  statsObserver.disconnect();
}, { threshold: 0.5 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

// ===== GALLERY FILTER =====
const filterBtns  = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    galleryItems.forEach(item => {
      const show = filter === 'all' || item.dataset.category === filter;
      item.classList.toggle('hidden', !show);
    });
  });
});

// ===== LIGHTBOX =====
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');

let activeItems = [];
let currentIdx  = 0;

function getVisibleItems() {
  return [...galleryItems].filter(i => !i.classList.contains('hidden'));
}

function showImage(idx) {
  const item = activeItems[idx];
  lightboxImg.src        = item.dataset.src;
  lightboxImg.alt        = item.dataset.title;
  lightboxTitle.textContent  = item.dataset.title;
  lightboxCounter.textContent = `${idx + 1} / ${activeItems.length}`;
}

function openLightbox(idx) {
  activeItems = getVisibleItems();
  currentIdx  = idx;
  showImage(currentIdx);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  lightboxImg.focus?.();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function prevImage() {
  currentIdx = (currentIdx - 1 + activeItems.length) % activeItems.length;
  showImage(currentIdx);
}

function nextImage() {
  currentIdx = (currentIdx + 1) % activeItems.length;
  showImage(currentIdx);
}

galleryItems.forEach(item => {
  const openHandler = () => {
    const visible = getVisibleItems();
    openLightbox(visible.indexOf(item));
  };
  item.addEventListener('click', openHandler);
  item.querySelector('.gallery-view').addEventListener('click', (e) => {
    e.stopPropagation();
    openHandler();
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   prevImage();
  if (e.key === 'ArrowRight')  nextImage();
});

// Touch swipe support for lightbox
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend',   (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const WEB3FORMS_ACCESS_KEY = '99cea469-9c6a-42c4-902b-66e37204164e';

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('fname').value.trim();
  if (!name) { showToast('Please enter your full name.', 'error'); return; }
  const phone = document.getElementById('phone').value.trim();
  if (!phone) { showToast('Please enter your phone number.', 'error'); return; }
  const email   = document.getElementById('email').value.trim();
  const service = document.getElementById('service').value;
  const message = document.getElementById('message').value.trim();

  const submitBtn     = contactForm.querySelector('button[type="submit"]');
  const submitBtnHTML = submitBtn.innerHTML;
  submitBtn.disabled  = true;
  submitBtn.innerHTML = '<span>Sending...</span>';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `New quote request from ${name} — Ardyuron Solar website`,
        from_name: 'Ardyuron Solar Website',
        name,
        phone,
        email: email || 'Not provided',
        service_interested_in: service || 'Not specified',
        message: message || '(no message provided)',
      }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message || 'Submission failed');
    showToast(`✅ Thanks, ${name}! We'll contact you shortly.`);
    contactForm.reset();
  } catch (err) {
    showToast('❌ Something went wrong. Please call or message us directly.', 'error');
  } finally {
    submitBtn.disabled  = false;
    submitBtn.innerHTML = submitBtnHTML;
  }
});

// ===== TOAST =====
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message, type = 'success') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.style.borderLeftColor = type === 'error' ? '#ef4444' : 'var(--green)';
  toast.style.borderColor     = type === 'error' ? '#ef4444' : 'var(--green)';
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4500);
}

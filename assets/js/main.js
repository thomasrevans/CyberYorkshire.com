/**
 * Cyber Yorkshire - Interactive Frontend Engine
 * https://cyberyorkshire.com/
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const isOpen = navLinks.classList.contains('mobile-open');
      mobileBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking any nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // Flyer Lightbox Modal
  const lightboxModal = document.getElementById('flyerLightbox');
  const openModalBtns = document.querySelectorAll('.open-flyer-modal');
  const closeModalBtn = document.querySelector('.modal-close-btn');

  function openLightbox(e) {
    if (e) e.preventDefault();
    if (lightboxModal) {
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', openLightbox);
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Contact Form Handling
  const contactForm = document.getElementById('securityInquiryForm');
  const successBox = document.getElementById('formSuccessMsg');

  if (contactForm && successBox) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const honeypot = document.getElementById('website');
      if (honeypot && honeypot.value) {
        return;
      }
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = 'Encrypting & Transmitting...';
      submitBtn.disabled = true;

      setTimeout(() => {
        const nameVal = document.getElementById('inquiryName')?.value || 'Client';
        successBox.style.display = 'block';
        successBox.innerHTML = '<strong>? Transmission Received</strong><br>Thank you, ' + encodeURIComponent(nameVal).replace(/%20/g, ' ') + '. Your inquiry has been routed to our Leeds principal security advisors. We will contact you shortly via <strong>07700 900123</strong> or <strong>contact@cyberyorkshire.com</strong>.';
        
        contactForm.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 700);
    });
  }

  // Micro Terminal Latency Simulator
  const latencyEl = document.getElementById('liveLatency');
  if (latencyEl) {
    setInterval(() => {
      const ping = Math.floor(Math.random() * 8) + 9;
      latencyEl.textContent = ping + 'ms';
    }, 3500);
  }
});

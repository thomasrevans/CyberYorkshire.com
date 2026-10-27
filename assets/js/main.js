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
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const honeypot = document.getElementById('website');
      if (honeypot && honeypot.value) {
        return;
      }
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = 'Encrypting & Transmitting...';
      submitBtn.disabled = true;
      successBox.style.display = 'none';
      successBox.textContent = '';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: {
            Accept: 'application/json'
          }
        });
        const result = await response.json();

        if (!response.ok || result.status !== 'success') {
          throw new Error(result.message || 'The inquiry could not be sent.');
        }

        const nameVal = document.getElementById('inquiryName')?.value || 'Client';
        successBox.textContent = 'Transmission received. Thank you, ' + nameVal + '. Your inquiry has been securely routed to our Leeds principal security advisors.';
        successBox.style.display = 'block';
        contactForm.reset();
        successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (error) {
        const errorMessage = error instanceof Error && error.message && !error.message.includes('Unexpected')
          ? error.message
          : 'We could not send your inquiry. Please email contact@cyberyorkshire.com directly.';
        successBox.textContent = errorMessage;
        successBox.style.display = 'block';
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
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

/* =========================================================
   CloudManagePro Website JavaScript
   This file controls:
   - Mobile menu open/close
   - Dynamic copyright year
   - Back to top without showing #top in the URL
   - Contact popup modal
   - Contact form mailto submission
   ========================================================= */


/* =========================================================
   1. Mobile navigation menu
   ========================================================= */
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('#nav-menu');

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}


/* =========================================================
   2. Dynamic copyright year
   ========================================================= */
const year = document.querySelector('#year');

if (year) {
  year.textContent = new Date().getFullYear();
}


/* =========================================================
   3. Back to top without leaving #top in the URL
   ========================================================= */
document.querySelectorAll('a[href="#top"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Keeps the URL clean: https://www.cloudmanagepro.com/
    history.replaceState(null, '', window.location.pathname + window.location.search);
  });
});


/* =========================================================
   4. Contact popup modal
   ========================================================= */
const contactModal = document.getElementById('contactModal');
const openContactButtons = document.querySelectorAll('.open-contact-modal');
const closeContactButton = document.querySelector('.contact-modal-close');
const contactBackdrop = document.querySelector('.contact-modal-backdrop');
const contactForm = document.getElementById('contactForm');

function openContactModal(event) {
  if (event) {
    event.preventDefault();
  }

  if (!contactModal) {
    return;
  }

  contactModal.classList.add('open');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeContactModal() {
  if (!contactModal) {
    return;
  }

  contactModal.classList.remove('open');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

if (contactModal) {
  openContactButtons.forEach((button) => {
    button.addEventListener('click', openContactModal);
  });

  if (closeContactButton) {
    closeContactButton.addEventListener('click', closeContactModal);
  }

  if (contactBackdrop) {
    contactBackdrop.addEventListener('click', closeContactModal);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && contactModal.classList.contains('open')) {
      closeContactModal();
    }
  });
}


/* =========================================================
   5. Contact form mailto submission
   Static websites do not send form emails by themselves.
   This builds an email draft using the user's email app.
   ========================================================= */
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('contactName')?.value || '';
    const email = document.getElementById('contactEmail')?.value || '';
    const phone = document.getElementById('contactPhone')?.value || '';
    const message = document.getElementById('contactMessage')?.value || '';

    const subject = encodeURIComponent('CloudManagePro Website Contact Request');
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:admin@cloudmanagepro.com?subject=${subject}&body=${body}`;
  });
}

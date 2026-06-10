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

const year = document.querySelector('#year');
if (year) {
  year.textContent = new Date().getFullYear();
}
// Smooth Back to Top without showing #top in URL
document.querySelectorAll('a[href="#top"]').forEach((link) => {
  link.addEventListener('click', function (event) {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    history.replaceState(null, '', window.location.pathname);
  });
});
// Contact popup form
const contactModal = document.getElementById('contactModal');
const openContactButtons = document.querySelectorAll('.open-contact-modal');
const closeContactButton = document.querySelector('.contact-modal-close');
const contactBackdrop = document.querySelector('.contact-modal-backdrop');
const contactForm = document.getElementById('contactForm');

function openContactModal(event) {
  event.preventDefault();
  contactModal.classList.add('open');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeContactModal() {
  contactModal.classList.remove('open');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

openContactButtons.forEach((button) => {
  button.addEventListener('click', openContactModal);
});

closeContactButton.addEventListener('click', closeContactModal);
contactBackdrop.addEventListener('click', closeContactModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && contactModal.classList.contains('open')) {
    closeContactModal();
  }
});

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const phone = document.getElementById('contactPhone').value;
  const message = document.getElementById('contactMessage').value;

  const subject = encodeURIComponent('CloudManagePro Website Contact Request');
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
  );

  window.location.href = `mailto:admin@cloudmanagepro.com?subject=${subject}&body=${body}`;
});

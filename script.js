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

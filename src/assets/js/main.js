// FAQ chevron rotation
// Rotates the chevron icon when a Bootstrap accordion item opens or closes

document.addEventListener('DOMContentLoaded', function () {
  const faqButtons = document.querySelectorAll('.faq-btn');

  faqButtons.forEach(function (btn) {
    const targetId = btn.getAttribute('data-bs-target');
    const target = document.querySelector(targetId);
    const chevron = btn.querySelector('.faq-chevron');

    if (!target || !chevron) return;

    target.addEventListener('show.bs.collapse', function () {
      chevron.style.transform = 'rotate(180deg)';
    });

    target.addEventListener('hide.bs.collapse', function () {
      chevron.style.transform = 'rotate(0deg)';
    });
  });
});

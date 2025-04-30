let current = 0;
let slides = [];

async function loadSlides() {
  const res = await fetch('/slides');
  slides = await res.json();
  await loadStats();
  updateSlide();
}

async function loadStats() {
  const res = await fetch('/stats');
  const stats = await res.json();

  document.getElementById('sick-leave').textContent = stats.sickLeave || '0%';
  document.getElementById('days-without-injury').textContent = stats.daysWithoutInjury || '0';
  document.getElementById('reporting-frequency').textContent = stats.reportingFrequency || '0%';
}

function updateSlide() {
  const slide = slides[current];
  if (!slide) return;

  const heading = document.getElementById('slide-heading');
  const paragraph = document.getElementById('slide-paragraph');
  const textWrapper = document.querySelector('.text-wrapper');
  const topSection = document.querySelector('.top-section');

  document.getElementById('slide-image').src = slide.image;

  const hasHeader = slide.header && slide.header.trim() !== '';
  const hasText = slide.text && slide.text.trim() !== '';

  heading.textContent = hasHeader ? slide.header : '';
  paragraph.textContent = hasText ? slide.text : '';

  heading.style.display = hasHeader ? 'block' : 'none';
  paragraph.style.display = hasText ? 'block' : 'none';

  heading.style.color = slide.headerColor || '#ffffff';
  heading.style.fontFamily = slide.headerFont || 'inherit';
  paragraph.style.color = slide.textColor || '#ffffff';
  paragraph.style.fontFamily = slide.textFont || 'inherit';

  if (hasHeader || hasText) {
    topSection.classList.add('with-text');
    textWrapper.style.display = 'flex';
  } else {
    topSection.classList.remove('with-text');
    textWrapper.style.display = 'none';
  }
}

function nextSlide() {
  current = (current + 1) % slides.length;
  updateSlide();
}

function prevSlide() {
  current = (current - 1 + slides.length) % slides.length;
  updateSlide();
}

loadSlides();

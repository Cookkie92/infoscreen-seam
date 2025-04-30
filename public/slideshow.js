let current = 0;
let slides = [];

async function loadSlides() {
  const res = await fetch('/slides');
  slides = await res.json();

  await loadStats();
  updateSlide();
  setInterval(nextSlide, 12000);
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

  document.getElementById('slide-image').src = slide.image;

  const heading = document.getElementById('slide-heading');
  const paragraph = document.getElementById('slide-paragraph');
  const textWrapper = document.querySelector('.text-wrapper');
  const topSection = document.querySelector('.top-section');

  const hasHeader = slide.header && slide.header.trim() !== '';
  const hasText = slide.text && slide.text.trim() !== '';

  // Content handling
  if (hasHeader) {
    heading.textContent = slide.header;
    heading.style.display = 'block';
  } else {
    heading.style.display = 'none';
  }

  if (hasText) {
    paragraph.textContent = slide.text;
    paragraph.style.display = 'block';
  } else {
    paragraph.style.display = 'none';
  }

  // Font and color handling
  heading.style.color = slide.headerColor || '#ffffff';
  heading.style.fontFamily = slide.headerFont || 'inherit';
  paragraph.style.color = slide.textColor || '#ffffff';
  paragraph.style.fontFamily = slide.textFont || 'inherit';

  // Layout handling
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

loadSlides();

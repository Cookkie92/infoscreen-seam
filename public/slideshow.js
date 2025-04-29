let current = 0;
let slides = [];

async function loadSlides() {
  const res = await fetch('/slides');
  slides = await res.json();
  
  updateSlide();
  setInterval(nextSlide, 12000);

  loadStats();
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
  document.getElementById('slide-heading').textContent = slide.header || 'Default Title';
  document.getElementById('slide-paragraph').textContent = slide.text || 'Default paragraph...';
}

function nextSlide() {
  current = (current + 1) % slides.length;
  updateSlide();
}

loadSlides();

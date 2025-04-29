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

  if (slide.header && slide.header.trim() !== '') {
    heading.textContent = slide.header;
    heading.style.display = 'block';
  } else {
    heading.style.display = 'none';
  }

  if (slide.text && slide.text.trim() !== '') {
    paragraph.textContent = slide.text;
    paragraph.style.display = 'block';
  } else {
    paragraph.style.display = 'none';
  }
}

function nextSlide() {
  current = (current + 1) % slides.length;
  updateSlide();
}

loadSlides();

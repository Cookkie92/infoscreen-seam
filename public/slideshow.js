// slideshow.js
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

  const lastStats = JSON.parse(localStorage.getItem('lastStats')) || {};
  const prevStats = JSON.parse(localStorage.getItem('prevStats')) || {};

  // Only update prevStats if something actually changed
  if (
    stats.sickLeave !== lastStats.sickLeave ||
    stats.daysWithoutInjury !== lastStats.daysWithoutInjury ||
    stats.reportingFrequency !== lastStats.reportingFrequency
  ) {
    localStorage.setItem('prevStats', JSON.stringify(lastStats));
  }

  localStorage.setItem('lastStats', JSON.stringify(stats));

  updateStatDisplay('sick-leave', stats.sickLeave, prevStats.sickLeave, 'down');
  updateStatDisplay('days-without-injury', stats.daysWithoutInjury, prevStats.daysWithoutInjury, 'smiley');
  updateStatDisplay('reporting-frequency', stats.reportingFrequency, prevStats.reportingFrequency, 'up');
}

function updateStatDisplay(id, currentValue, prevValue, type) {
  const el = document.getElementById(id);

  let current = currentValue;
  let previous = prevValue;

  // Strip and parse percentages for comparison
  if (id === 'sick-leave') {
    current = parseFloat(currentValue?.replace('%', '').replace(',', '.'));
    previous = parseFloat(prevValue?.replace('%', '').replace(',', '.'));
  } else {
    current = parseFloat(currentValue);
    previous = parseFloat(prevValue);
  }

  let display = isNaN(current)
    ? currentValue
    : id === 'sick-leave'
    ? `${current.toFixed(1)}%`
    : `${current}`;

  if (type === 'down') {
    if (!isNaN(previous)) {
      display += current < previous ? ' 🟢 ↓' : current > previous ? ' 🔴 ↑' : '';
    }
  } else if (type === 'up') {
    if (!isNaN(previous)) {
      display += current > previous ? ' 🟢 ↑' : current < previous ? ' 🔴 ↓' : '';
    }
  } else if (type === 'smiley') {
    if (!isNaN(current) && current >= 30) {
      display += ' 😊';
    }
  }

  el.textContent = display;
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

loadSlides();
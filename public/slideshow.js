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

  const image = document.getElementById('slide-image');
  const heading = document.getElementById('slide-heading');
  const paragraph = document.getElementById('slide-paragraph');
  const textWrapper = document.querySelector('.text-wrapper');
  const topSection = document.querySelector('.top-section');

  image.classList.add('fade-out');
  heading.classList.add('fade-out');
  paragraph.classList.add('fade-out');

  setTimeout(() => {
    image.src = slide.image;

    const hasHeader = slide.header?.trim();
    const hasText = slide.text?.trim();

    heading.textContent = hasHeader ? slide.header : '';
    heading.style.display = hasHeader ? 'block' : 'none';

    paragraph.textContent = hasText ? slide.text : '';
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

    image.classList.remove('fade-out');
    heading.classList.remove('fade-out');
    paragraph.classList.remove('fade-out');
  }, 500);
}

function nextSlide() {
  current = (current + 1) % slides.length;
  updateSlide();
}

// Auto-refresh every 60 minutes
setTimeout(() => {
  window.location.reload();
}, 60 * 60 * 1000);

// Update date/time
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('nb-NO', { weekday: 'short', day: '2-digit', month: 'short' });
  const clockDisplay = document.getElementById('clockDisplay');
  if (clockDisplay) {
    clockDisplay.textContent = `${date} • ${time}`;
  }
}

setInterval(updateClock, 1000);
updateClock();

loadSlides();

// 🔁 Auto celebration every 20 minutes
setInterval(() => {
  window.location.href = '/celebration.html';
}, 20 * 60 * 1000);

// 🎯 Admin-triggered celebration poll
async function checkCelebrationTrigger() {
  try {
    const res = await fetch('/celebration/trigger');
    const data = await res.json();
    if (data.triggered) {
      window.location.href = '/celebration.html';
    }
  } catch (err) {
    console.error("Celebration trigger check failed", err);
  }
}
setInterval(checkCelebrationTrigger, 5000);

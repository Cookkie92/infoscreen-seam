let current = 0;
let slides = [];

async function loadSlides() {
  try {
    const res = await fetch('/slides');
    slides = await res.json();
  } catch (err) {
    console.error("Failed to load slides:", err);
    slides = [];
  }

  await loadStats();
  updateSlide();
  setInterval(nextSlide, 12000);
}

// Fallback: reload if no slides load after 5 seconds
setTimeout(() => {
  if (!slides.length || !document.getElementById('slide-image').src) {
    console.warn("No slides loaded, reloading page...");
    location.reload();
  }
}, 5000);

async function loadStats() {
  try {
    const res = await fetch('/stats');
    const stats = await res.json();

    const lastStats = JSON.parse(localStorage.getItem('lastStats')) || {};
    const prevStats = JSON.parse(localStorage.getItem('prevStats')) || {
      sickLeave: stats.sickLeave,
      daysWithoutInjury: stats.daysWithoutInjury,
      reportingFrequency: stats.reportingFrequency
    };

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
  } catch (err) {
    console.error("Failed to load stats:", err);
  }
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

  // Hide loading message
  document.getElementById('loadingMessage')?.remove();

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

// Auto-refresh every 10 minutes
setTimeout(() => {
  window.location.reload();
}, 10 * 60 * 1000);

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

// 🔁 Auto celebration every 2 minutes
setInterval(() => {
  window.location.href = '/celebration.html';
}, 2 * 60 * 1000);

// 🎯 Admin-triggered celebration poll (robust version)
async function checkCelebrationTrigger() {
  try {
    const res = await fetch('/celebration/trigger');
    const data = await res.json();
    if (data.triggered) {
      // Check if there is at least one valid celebration with an image
      const celebrationsRes = await fetch('/celebrations');
      const celebrations = await celebrationsRes.json();

      if (celebrations.length > 0) {
        const latestCelebration = celebrations[celebrations.length - 1];
        if (latestCelebration.image && latestCelebration.image.trim() !== '') {
          // There is valid celebration data -> go to celebration screen
          window.location.href = '/celebration.html';
          return;
        } else {
          console.warn("Trigger received but no valid celebration image found. Ignoring trigger.");
        }
      } else {
        console.warn("Trigger received but no celebrations exist. Ignoring trigger.");
      }
    }
  } catch (err) {
    console.error("Celebration trigger check failed", err);
  }
}
setInterval(checkCelebrationTrigger, 5000);

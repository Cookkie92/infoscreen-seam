// let current = 0;
// let slides = [];

// async function loadSlides() {
//   try {
//     const res = await fetch('/slides');
//     slides = await res.json();
//   } catch (err) {
//     console.error("Failed to load slides:", err);
//     slides = [];
//   }

//   await loadStats();
//   updateSlide();
//   setInterval(nextSlide, 12000);
// }

// // Fallback: reload if no slides load after 5 seconds
// setTimeout(() => {
//   if (!slides.length || !document.getElementById('slide-image').src) {
//     console.warn("No slides loaded, reloading page...");
//     location.reload();
//   }
// }, 5000);

// async function loadStats() {
//   try {
//     const res = await fetch('/stats');
//     const stats = await res.json();

//     const lastStats = JSON.parse(localStorage.getItem('lastStats')) || {};
//     const prevStats = JSON.parse(localStorage.getItem('prevStats')) || {
//       sickLeave: stats.sickLeave,
//       daysWithoutInjury: stats.daysWithoutInjury,
//       reportingFrequency: stats.reportingFrequency
//     };

//     if (
//       stats.sickLeave !== lastStats.sickLeave ||
//       stats.daysWithoutInjury !== lastStats.daysWithoutInjury ||
//       stats.reportingFrequency !== lastStats.reportingFrequency
//     ) {
//       localStorage.setItem('prevStats', JSON.stringify(lastStats));
//     }
//     localStorage.setItem('lastStats', JSON.stringify(stats));

//     updateStatDisplay('sick-leave', stats.sickLeave, prevStats.sickLeave, 'down');
//     updateStatDisplay('days-without-injury', stats.daysWithoutInjury, prevStats.daysWithoutInjury, 'smiley');
//     updateStatDisplay('reporting-frequency', stats.reportingFrequency, prevStats.reportingFrequency, 'up');
//   } catch (err) {
//     console.error("Failed to load stats:", err);
//   }
// }

// function updateStatDisplay(id, currentValue, prevValue, type) {
//   const el = document.getElementById(id);

//   let current = currentValue;
//   let previous = prevValue;

//   if (id === 'sick-leave') {
//     current = parseFloat(currentValue?.replace('%', '').replace(',', '.'));
//     previous = parseFloat(prevValue?.replace('%', '').replace(',', '.'));
//   } else {
//     current = parseFloat(currentValue);
//     previous = parseFloat(prevValue);
//   }

//   let display = isNaN(current)
//     ? currentValue
//     : id === 'sick-leave'
//     ? `${current.toFixed(1)}%`
//     : `${current}`;

//   if (type === 'down') {
//     if (!isNaN(previous)) {
//       display += current < previous ? ' 🟢 ↓' : current > previous ? ' 🔴 ↑' : '';
//     }
//   } else if (type === 'up') {
//     if (!isNaN(previous)) {
//       display += current > previous ? ' 🟢 ↑' : current < previous ? ' 🔴 ↓' : '';
//     }
//   } else if (type === 'smiley') {
//     if (!isNaN(current) && current >= 30) {
//       display += ' 😊';
//     }
//   }

//   el.textContent = display;
// }

// function updateSlide() {
//   const slide = slides[current];
//   if (!slide) return;

//   const image = document.getElementById('slide-image');
//   const heading = document.getElementById('slide-heading');
//   const paragraph = document.getElementById('slide-paragraph');
//   const textWrapper = document.querySelector('.text-wrapper');
//   const topSection = document.querySelector('.top-section');

//   document.getElementById('loadingMessage')?.remove();

//   image.classList.add('fade-out');
//   heading.classList.add('fade-out');
//   paragraph.classList.add('fade-out');

//   setTimeout(() => {
//     image.src = slide.image;

//     const hasHeader = slide.header?.trim();
//     const hasText = slide.text?.trim();

//     heading.textContent = hasHeader ? slide.header : '';
//     heading.style.display = hasHeader ? 'block' : 'none';

//     paragraph.textContent = hasText ? slide.text : '';
//     paragraph.style.display = hasText ? 'block' : 'none';

//     heading.style.color = slide.headerColor || '#ffffff';
//     heading.style.fontFamily = slide.headerFont || 'inherit';
//     paragraph.style.color = slide.textColor || '#ffffff';
//     paragraph.style.fontFamily = slide.textFont || 'inherit';

//     if (hasHeader || hasText) {
//       topSection.classList.add('with-text');
//       textWrapper.style.display = 'flex';
//     } else {
//       topSection.classList.remove('with-text');
//       textWrapper.style.display = 'none';
//     }

//     image.classList.remove('fade-out');
//     heading.classList.remove('fade-out');
//     paragraph.classList.remove('fade-out');
//   }, 500);
// }

// function nextSlide() {
//   current = (current + 1) % slides.length;
//   updateSlide();
// }

// // Auto-refresh every 10 minutes
// setTimeout(() => {
//   window.location.reload();
// }, 10 * 60 * 1000);

// // Update clock every second
// function updateClock() {
//   const now = new Date();
//   const time = now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
//   const date = now.toLocaleDateString('nb-NO', { weekday: 'short', day: '2-digit', month: 'short' });
//   const clockDisplay = document.getElementById('clockDisplay');
//   if (clockDisplay) {
//     clockDisplay.textContent = `${date} • ${time}`;
//   }
// }

// setInterval(updateClock, 1000);
// updateClock();
// loadSlides();
// document.getElementById("sickleave-box").style.display = "flex";
// document.getElementById("grafana-box").style.display = "none";
// // Auto celebration every 2 minutes
// setInterval(() => {
//   window.location.href = '/celebration.html';
// }, 2 * 60 * 1000);

// // Admin-triggered celebration check
// async function checkCelebrationTrigger() {
//   try {
//     const res = await fetch('/celebration/trigger');
//     const data = await res.json();
//     if (data.triggered) {
//       const celebrationsRes = await fetch('/celebrations');
//       const celebrations = await celebrationsRes.json();

//       if (celebrations.length > 0) {
//         const latestCelebration = celebrations[celebrations.length - 1];
//         if (latestCelebration.image && latestCelebration.image.trim() !== '') {
//           window.location.href = '/celebration.html';
//         } else {
//           console.warn("Trigger received but no valid celebration image found.");
//         }
//       } else {
//         console.warn("Trigger received but no celebrations exist.");
//       }
//     }
//   } catch (err) {
//     console.error("Celebration trigger check failed", err);
//   }
// }
// setInterval(checkCelebrationTrigger, 5000);

// // 🔄 Veksle mellom sickleave og grafana hvert 2. minutt
// let showingGrafana = false;

// setInterval(() => {
//   const sickleave = document.getElementById("sickleave-box");
//   const grafana = document.getElementById("grafana-box");

//   if (!sickleave || !grafana) return;

//   if (showingGrafana) {
//     sickleave.style.display = "flex";     // Restore proper layout
//     grafana.style.display = "none";
//   } else {
//     sickleave.style.display = "none";
//     grafana.style.display = "block";
//   }

//   showingGrafana = !showingGrafana;
// }, 10 * 1000); // change to 10 * 1000 for testing



// let current = 0;
// let slides = [];

// async function loadSlides() {
//   try {
//     const res = await fetch('/slides');
//     slides = await res.json();
//   } catch (err) {
//     console.error("Failed to load slides:", err);
//     slides = [];
//   }

//   await loadStats();
//   updateSlide();
//   setInterval(nextSlide, 12000);
// }

// // Fallback: reload hvis ingen slides etter 5 sek
// setTimeout(() => {
//   const img = document.getElementById('slide-image');
//   if (!slides.length || !img || !img.src) {
//     console.warn("No slides loaded, reloading page...");
//     location.reload();
//   }
// }, 5000);

// async function loadStats() {
//   try {
//     const res = await fetch('/stats');
//     const stats = await res.json();

//     const lastStats = JSON.parse(localStorage.getItem('lastStats')) || {};
//     const prevStats = JSON.parse(localStorage.getItem('prevStats')) || {
//       sickLeave: stats.sickLeave,
//       daysWithoutInjury: stats.daysWithoutInjury,
//       reportingFrequency: stats.reportingFrequency
//     };

//     if (
//       stats.sickLeave !== lastStats.sickLeave ||
//       stats.daysWithoutInjury !== lastStats.daysWithoutInjury ||
//       stats.reportingFrequency !== lastStats.reportingFrequency
//     ) {
//       localStorage.setItem('prevStats', JSON.stringify(lastStats));
//     }
//     localStorage.setItem('lastStats', JSON.stringify(stats));

//     updateStatDisplay('sick-leave', stats.sickLeave, prevStats.sickLeave, 'down');
//     updateStatDisplay('days-without-injury', stats.daysWithoutInjury, prevStats.daysWithoutInjury, 'smiley');
//     updateStatDisplay('reporting-frequency', stats.reportingFrequency, prevStats.reportingFrequency, 'up');
//   } catch (err) {
//     console.error("Failed to load stats:", err);
//   }
// }

// function updateStatDisplay(id, currentValue, prevValue, type) {
//   const el = document.getElementById(id);
//   if (!el) return;

//   let current = currentValue;
//   let previous = prevValue;

//   if (id === 'sick-leave') {
//     current = parseFloat(currentValue?.replace('%', '').replace(',', '.'));
//     previous = parseFloat(prevValue?.replace('%', '').replace(',', '.'));
//   } else {
//     current = parseFloat(currentValue);
//     previous = parseFloat(prevValue);
//   }

//   let display = isNaN(current)
//     ? currentValue
//     : id === 'sick-leave'
//     ? `${current.toFixed(1)}%`
//     : `${current}`;

//   if (type === 'down') {
//     if (!isNaN(previous)) {
//       display += current < previous ? ' 🟢 ↓' : current > previous ? ' 🔴 ↑' : '';
//     }
//   } else if (type === 'up') {
//     if (!isNaN(previous)) {
//       display += current > previous ? ' 🟢 ↑' : current < previous ? ' 🔴 ↓' : '';
//     }
//   } else if (type === 'smiley') {
//     if (!isNaN(current) && current >= 30) {
//       display += ' 😊';
//     }
//   }

//   el.textContent = display;
// }

// function updateSlide() {
//   const slide = slides[current];
//   if (!slide) return;

//   const image = document.getElementById('slide-image');
//   const heading = document.getElementById('slide-heading');
//   const paragraph = document.getElementById('slide-paragraph');
//   const textWrapper = document.querySelector('.text-wrapper');
//   const topSection = document.querySelector('.top-section');

//   document.getElementById('loadingMessage')?.remove();

//   image?.classList.add('fade-out');
//   heading?.classList.add('fade-out');
//   paragraph?.classList.add('fade-out');

//   setTimeout(() => {
//     if (image) image.src = slide.image || '';

//     const hasHeader = slide.header?.trim();
//     const hasText = slide.text?.trim();

//     if (heading) {
//       heading.textContent = hasHeader ? slide.header : '';
//       heading.style.display = hasHeader ? 'block' : 'none';
//       heading.style.color = slide.headerColor || '#ffffff';
//       heading.style.fontFamily = slide.headerFont || 'inherit';
//     }

//     if (paragraph) {
//       paragraph.textContent = hasText ? slide.text : '';
//       paragraph.style.display = hasText ? 'block' : 'none';
//       paragraph.style.color = slide.textColor || '#ffffff';
//       paragraph.style.fontFamily = slide.textFont || 'inherit';
//     }

//     if (topSection && textWrapper) {
//       if (hasHeader || hasText) {
//         topSection.classList.add('with-text');
//         textWrapper.style.display = 'flex';
//       } else {
//         topSection.classList.remove('with-text');
//         textWrapper.style.display = 'none';
//       }
//     }

//     image?.classList.remove('fade-out');
//     heading?.classList.remove('fade-out');
//     paragraph?.classList.remove('fade-out');
//   }, 500);
// }

// function nextSlide() {
//   if (!slides.length) return;
//   current = (current + 1) % slides.length;
//   updateSlide();
// }

// // Auto-refresh hver 10. minutt
// setTimeout(() => {
//   window.location.reload();
// }, 10 * 60 * 1000);

// // Klokke hvert sekund
// function updateClock() {
//   const now = new Date();
//   const time = now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
//   const date = now.toLocaleDateString('nb-NO', { weekday: 'short', day: '2-digit', month: 'short' });
//   const clockDisplay = document.getElementById('clockDisplay');
//   if (clockDisplay) {
//     clockDisplay.textContent = `${date} • ${time}`;
//   }
// }

// setInterval(updateClock, 1000);
// updateClock();

// // Start hovedflyt
// loadSlides();

// /* ----------------------------------------------------
//    BEHOLD BEGGE BOKSER SYNLIGE — ingen toggling lenger
//    (fjernet init-manipulasjon og toggle-intervallet)
// ----------------------------------------------------- */
// // Ikke sett display via JS – la CSS styre layouten
// // document.getElementById("sickleave-box").style.display = "flex";
// // document.getElementById("grafana-box").style.display = "none";

// // 🎉 Celebration: la funksjonaliteten stå – vi ser på den etterpå.
// // MIDlertidig: deaktiver auto-redirect slik at siden ikke forlater visningen.
// // setInterval(() => {
// //   window.location.href = '/celebration.html';
// // }, 2 * 60 * 1000);

// async function checkCelebrationTrigger() {
//   try {
//     const res = await fetch('/celebration/trigger');
//     const data = await res.json();
//     if (data.triggered) {
//       const celebrationsRes = await fetch('/celebrations');
//       const celebrations = await celebrationsRes.json();

//       if (celebrations.length > 0) {
//         const latestCelebration = celebrations[celebrations.length - 1];
//         if (latestCelebration.image && latestCelebration.image.trim() !== '') {
//           window.location.href = '/celebration.html';
//         } else {
//           console.warn("Trigger received but no valid celebration image found.");
//         }
//       } else {
//         console.warn("Trigger received but no celebrations exist.");
//       }
//     }
//   } catch (err) {
//     console.error("Celebration trigger check failed", err);
//   }
// }
// setInterval(checkCelebrationTrigger, 5000);


// ------------------------
// slideshow.js (ryddet)
// ------------------------

let current = 0;
let slides = [];

// ---------- Utils ----------
function cacheBust(url) {
  try {
    const u = new URL(url, window.location.origin);
    u.searchParams.set('_t', Date.now().toString());
    return u.href;
  } catch {
    return url;
  }
}

function normalizeCelebrations(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(c => {
      const image = c.image || c.imageUrl || c.url || c.photo || c.picture || '';
      const heading = c.heading || c.title || c.text || c.name || '';
      return {
        image: (image || '').toString().trim(),
        heading: (heading || '').toString().trim(),
      };
    })
    .filter(c => c.image !== '');
}

async function hasValidCelebration() {
  try {
    const res = await fetch('/celebrations', { cache: 'no-store' });
    const data = await res.json();
    const list = normalizeCelebrations(data);
    return list.length > 0;
  } catch {
    return false;
  }
}

// ---------- Slides ----------
async function loadSlides() {
  try {
    const res = await fetch('/slides', { cache: 'no-store' });
    slides = await res.json();
  } catch (err) {
    console.error('Failed to load slides:', err);
    slides = [];
  }

  await loadStats();
  updateSlide();

  // Roter slides hvert 12. sekund
  setInterval(nextSlide, 12000);
}

// Fallback: reload hvis ingen slides etter 5 sek
setTimeout(() => {
  const img = document.getElementById('slide-image');
  if (!slides.length || !img || !img.src) {
    console.warn('No slides loaded, reloading page...');
    location.reload();
  }
}, 5000);

// ---------- Stats ----------
async function loadStats() {
  try {
    const res = await fetch('/stats', { cache: 'no-store' });
    const stats = await res.json();

    const lastStats = JSON.parse(localStorage.getItem('lastStats')) || {};
    const prevStats = JSON.parse(localStorage.getItem('prevStats')) || {
      sickLeave: stats.sickLeave,
      daysWithoutInjury: stats.daysWithoutInjury,
      reportingFrequency: stats.reportingFrequency,
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
    console.error('Failed to load stats:', err);
  }
}

function updateStatDisplay(id, currentValue, prevValue, type) {
  const el = document.getElementById(id);
  if (!el) return;

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

// ---------- Render ----------
function updateSlide() {
  const slide = slides[current];
  if (!slide) return;

  const image = document.getElementById('slide-image');
  const heading = document.getElementById('slide-heading');
  const paragraph = document.getElementById('slide-paragraph');
  const textWrapper = document.querySelector('.text-wrapper');
  const topSection = document.querySelector('.top-section');

  document.getElementById('loadingMessage')?.remove();

  image?.classList.add('fade-out');
  heading?.classList.add('fade-out');
  paragraph?.classList.add('fade-out');

  setTimeout(() => {
    if (image) image.src = slide.image ? cacheBust(slide.image) : '';

    const hasHeader = slide.header?.trim();
    const hasText = slide.text?.trim();

    if (heading) {
      heading.textContent = hasHeader ? slide.header : '';
      heading.style.display = hasHeader ? 'block' : 'none';
      heading.style.color = slide.headerColor || '#ffffff';
      heading.style.fontFamily = slide.headerFont || 'inherit';
    }

    if (paragraph) {
      paragraph.textContent = hasText ? slide.text : '';
      paragraph.style.display = hasText ? 'block' : 'none';
      paragraph.style.color = slide.textColor || '#ffffff';
      paragraph.style.fontFamily = slide.textFont || 'inherit';
    }

    if (topSection && textWrapper) {
      if (hasHeader || hasText) {
        topSection.classList.add('with-text');
        textWrapper.style.display = 'flex';
      } else {
        topSection.classList.remove('with-text');
        textWrapper.style.display = 'none';
      }
    }

    image?.classList.remove('fade-out');
    heading?.classList.remove('fade-out');
    paragraph?.classList.remove('fade-out');
  }, 500);
}

function nextSlide() {
  if (!slides.length) return;
  current = (current + 1) % slides.length;
  updateSlide();
}

// ---------- Auto-refresh hver 10. min ----------
setTimeout(() => {
  window.location.reload();
}, 10 * 60 * 1000);

// ---------- Klokke ----------
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

// ---------- Celebration trigger ----------
function normalizeCelebrations(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(c => {
      const image = c.image || c.imageUrl || c.url || c.photo || c.picture || '';
      const heading = c.heading || c.title || c.text || c.name || '';
      return { image: (image || '').toString().trim(), heading: (heading || '').toString().trim() };
    })
    .filter(c => c.image !== '');
}

async function hasValidCelebration() {
  try {
    const u = new URL('/celebrations', location.origin);
    u.searchParams.set('_t', Date.now().toString());
    const res = await fetch(u, { cache: 'no-store' });
    if (!res.ok) {
      console.warn('[celebration] /celebrations HTTP', res.status);
      return false;
    }
    const data = await res.json();
    const list = normalizeCelebrations(data);
    console.log('[celebration] celebrations:', list);
    return list.length > 0;
  } catch (e) {
    console.error('[celebration] hasValidCelebration error', e);
    return false;
  }
}

async function checkCelebrationTrigger() {
  try {
    const u = new URL('/celebration/trigger', location.origin);
    u.searchParams.set('_t', Date.now().toString());
    const res = await fetch(u, { cache: 'no-store' });
    if (!res.ok) {
      console.warn('[celebration] trigger HTTP', res.status);
      return;
    }
    const data = await res.json();
    console.log('[celebration] trigger payload:', data);

    if (data && data.triggered) {
      console.log('[celebration] trigger detected, validating list…');
      const ok = await hasValidCelebration();
      if (ok) {
        console.log('[celebration] redirecting → /celebration.html');
        window.location.href = '/celebration.html';
      } else {
        console.warn('[celebration] trigger set, but no valid celebrations with images found.');
      }
    }
  } catch (err) {
    console.error('[celebration] trigger check failed', err);
  }
}

// Kjør med én gang ved load
checkCelebrationTrigger();

// Test-poll hvert 1000 ms (sett tilbake til 5000 når ferdig å teste)
setInterval(checkCelebrationTrigger, 1000);

// Sjekk også når fanen får fokus (etter du trykker i admin)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) checkCelebrationTrigger();
});
window.addEventListener('focus', checkCelebrationTrigger);

// Manuell tvangstest: ?celebrate=1 i URL eller tast "C"
(function maybeForceCelebrate() {
  const params = new URLSearchParams(location.search);
  if (params.get('celebrate') === '1') {
    hasValidCelebration().then(ok => {
      if (ok) window.location.href = '/celebration.html';
      else console.warn('[celebration] ?celebrate=1 satt, men ingen gyldige celebrations.');
    });
  }
})();
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'c') {
    hasValidCelebration().then(ok => {
      if (ok) window.location.href = '/celebration.html';
      else console.warn('[celebration] C-trykk, men ingen gyldige celebrations.');
    });
  }
});



// ---------- Start ----------
loadSlides();

// Viktig: Vi setter ikke display på #sickleave-box / #grafana-box i JS.
// La CSS styre at de står side-om-side.

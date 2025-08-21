
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

// ---------- Celebration trigger + auto (simple + robust) ----------

// Centralized redirect so we can throttle if needed
function redirectToCelebration(reason = 'unknown') {
  console.log(`[celebration] redirect (${reason}) → /celebration.html`);
  // mark when we redirected (prevents immediate re-redirects)
  sessionStorage.setItem('lastCelebrationRedirectTs', String(Date.now()));
  window.location.href = '/celebration.html';
}

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
    u.searchParams.set('_t', Date.now().toString()); // cache-bust
    const res = await fetch(u, { cache: 'no-store' });
    if (!res.ok) {
      console.warn('[celebration] /celebrations HTTP', res.status);
      return false;
    }
    const data = await res.json();
    const list = normalizeCelebrations(data);
    console.log('[celebration] celebrations count:', list.length);
    return list.length > 0;
  } catch (e) {
    console.error('[celebration] hasValidCelebration error', e);
    return false;
  }
}

// --- ADMIN TRIGGER POLLER (works with your existing /celebration/trigger) ---
// async function checkCelebrationTrigger() {
//   try {
//     const u = new URL('/celebration/trigger', location.origin);
//     u.searchParams.set('_t', Date.now().toString()); // cache-bust
//     const res = await fetch(u, { cache: 'no-store' });
//     if (!res.ok) return;

//     const data = await res.json();
//     console.log('[celebration] trigger payload:', data);

//     if (data && data.triggered) {
//       const ok = await hasValidCelebration();
//       if (ok) redirectToCelebration('admin-trigger');
//       else console.warn('[celebration] trigger set, but no valid celebrations with images found.');
//     }
//   } catch (err) {
//     console.error('[celebration] trigger check failed', err);
//   }
// }

// // Kick immediately + poll (set back to 5000 when done testing)
// checkCelebrationTrigger();
// setInterval(checkCelebrationTrigger, 1000);
// document.addEventListener('visibilitychange', () => { if (!document.hidden) checkCelebrationTrigger(); });
// window.addEventListener('focus', checkCelebrationTrigger);

// // --- AUTO CELEBRATION EVERY 5 MINUTES ---
// const AUTO_CELEB_MS = 5 * 60 * 1000;

// // Simple safety: don't auto-redirect within 90s of a previous redirect
// function recentlyRedirected() {
//   const last = Number(sessionStorage.getItem('lastCelebrationRedirectTs') || 0);
//   return last && (Date.now() - last) < 90_000;
// }

// async function autoCelebrateIfAny() {
//   console.log('[celebration] auto: tick');
//   if (recentlyRedirected()) {
//     console.log('[celebration] auto: recently redirected, skipping this tick');
//     return;
//   }
//   try {
//     const ok = await hasValidCelebration();
//     if (ok) redirectToCelebration('auto-5min');
//     else console.log('[celebration] auto: no celebrations, skip');
//   } catch (e) {
//     console.warn('[celebration] auto: error', e);
//   }
// }

// // First auto-check after 5 minutes, then every 5 minutes
// setTimeout(autoCelebrateIfAny, AUTO_CELEB_MS);
// setInterval(autoCelebrateIfAny, AUTO_CELEB_MS);

// // --- Manual test helpers ---
// (function maybeForceCelebrate() {
//   const params = new URLSearchParams(location.search);
//   if (params.get('celebrate') === '1') {
//     hasValidCelebration().then(ok => ok ? redirectToCelebration('url-force') :
//       console.warn('[celebration] ?celebrate=1 set, but no celebrations.'));
//   }
// })();
// window.addEventListener('keydown', (e) => {
//   if (e.key.toLowerCase() === 'c') {
//     hasValidCelebration().then(ok => ok ? redirectToCelebration('key-C') :
//       console.warn('[celebration] key C, but no celebrations.'));
//   }
// });





// ---------- Start ----------
loadSlides();


// TEMP: prove redirect works at all (remove after test)
// setTimeout(() => {
//   console.log('[celebration] TEMP failsafe redirect firing');
//   window.location.href = '/celebration.html';
// }, 10_000);


// Viktig: Vi setter ikke display på #sickleave-box / #grafana-box i JS.
// La CSS styre at de står side-om-side.
// ---------- HARD AUTO REDIRECT EVERY 5 MIN ----------
const HARD_AUTO_MS = 60 * 1000;

// avoid immediate re-trigger loops when coming back from celebration
function recentlyRedirected() {
  const last = Number(sessionStorage.getItem('lastCelebrationRedirectTs') || 0);
  return last && (Date.now() - last) < 90_000; // 90s guard
}

setInterval(() => {
  if (recentlyRedirected()) {
    console.log('[celebration] HARD auto: skipped (recent redirect)');
    return;
  }
  console.log('[celebration] HARD auto: redirect → /celebration.html');
  sessionStorage.setItem('lastCelebrationRedirectTs', String(Date.now()));
  window.location.href = '/celebration.html';
}, HARD_AUTO_MS);

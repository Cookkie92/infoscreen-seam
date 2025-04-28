let current = 0;
let slides = [];

async function loadSlides() {
  const res = await fetch('/slides');
  slides = await res.json();
  
  updateSlide(); // show first slide
  setInterval(nextSlide, 12000); // change every 12s
}

function updateSlide() {
  const slide = slides[current];
  if (!slide) return;

  document.getElementById('slide-image').src = slide.image;
  document.getElementById('slide-heading').textContent = slide.title || 'Default Title';
  document.getElementById('slide-paragraph').textContent = slide.text || 'Default paragraph...';
}

function nextSlide() {
  current = (current + 1) % slides.length;
  updateSlide();
}

loadSlides();

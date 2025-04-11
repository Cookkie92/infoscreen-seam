let current = 0;
let slides = [];

async function loadSlides() {
  const res = await fetch('/slides');
  slides = await res.json();
  const container = document.getElementById('slides-container');
  container.innerHTML = '';

  slides.forEach((slide, index) => {
    const div = document.createElement('div');
    div.className = 'slide';
    if (index === 0) div.classList.add('active');

    // ✅ Use backticks for proper variable interpolation
    div.innerHTML = `<img src="${slide.image}" /><p>${slide.text}</p>`;
    container.appendChild(div);
  });

  setInterval(nextSlide, 8000);
}

function nextSlide() {
  const allSlides = document.querySelectorAll('.slide');
  allSlides[current].classList.remove('active');
  current = (current + 1) % slides.length;
  allSlides[current].classList.add('active');
}

loadSlides();

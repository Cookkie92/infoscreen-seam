const form = document.getElementById('uploadForm');
const status = document.getElementById('status');
const slideList = document.getElementById('slideList');
const statsForm = document.getElementById('statsForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  const res = await fetch('/upload', {
    method: 'POST',
    body: formData,
  });

  if (res.ok) {
    status.textContent = 'Upload successful!';
    form.reset();
    loadSlides();
  } else {
    status.textContent = 'Upload failed.';
  }
});

statsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const stats = {
    sickLeave: document.getElementById('sickLeaveInput').value,
    daysWithoutInjury: document.getElementById('daysWithoutInjuryInput').value,
    reportingFrequency: document.getElementById('reportingFrequencyInput').value,
  };

  const res = await fetch('/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats),
  });

  if (res.ok) {
    alert('Statistics updated!');
  } else {
    alert('Failed to update statistics.');
  }
});

async function loadSlides() {
  const res = await fetch('/slides');
  const slides = await res.json();
  slideList.innerHTML = '';

  slides.forEach((slide, index) => {
    const div = document.createElement('div');
    div.style.border = '1px solid gray';
    div.style.padding = '1rem';
    div.style.margin = '1rem 0';

    const img = document.createElement('img');
    img.src = slide.image;
    img.style.maxWidth = '150px';
    img.style.display = 'block';

    const header = document.createElement('h3');
    header.textContent = slide.header || 'No Header';

    const text = document.createElement('p');
    text.textContent = slide.text || 'No paragraph text';

    div.appendChild(img);
    div.appendChild(header);
    div.appendChild(text);

    slideList.appendChild(div);
  });
}

loadSlides();

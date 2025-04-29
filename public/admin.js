const form = document.getElementById('uploadForm');
const status = document.getElementById('status');
const slideList = document.getElementById('slideList');
const statsForm = document.getElementById('statsForm');

// Handle slide upload
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  const header = document.getElementById('headerInput').value;
  formData.append('header', header);

  const text = document.getElementById('textInput').value;
  formData.append('text', text);

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

// Handle statistics update
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

// Load existing slides
async function loadSlides() {
  const res = await fetch('/slides');
  const slides = await res.json();
  slideList.innerHTML = '';

  slides.forEach((slide, index) => {
    const div = document.createElement('div');
    div.className = 'slide-item';

    const img = document.createElement('img');
    img.src = slide.image;
    img.style.maxWidth = '150px';
    img.style.marginBottom = '10px';

    const headerInput = document.createElement('input');
    headerInput.value = slide.header || '';
    headerInput.placeholder = 'Edit header...';
    headerInput.style.marginBottom = '5px';

    const textInput = document.createElement('textarea');
    textInput.value = slide.text || '';
    textInput.placeholder = 'Edit paragraph text...';
    textInput.rows = 3;

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.marginTop = '5px';
    saveButton.onclick = async () => {
      const updated = {
        header: headerInput.value,
        text: textInput.value
      };
      await fetch(`/slide/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      loadSlides();
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.backgroundColor = '#dc3545';
    deleteButton.onclick = async () => {
      if (confirm('Are you sure you want to delete this slide?')) {
        await fetch(`/slide/${index}`, { method: 'DELETE' });
        loadSlides();
      }
    };

    const previewButton = document.createElement('button');
    previewButton.textContent = 'Preview';
    previewButton.style.backgroundColor = '#007bff';
    previewButton.onclick = () => {
      window.location.href = `/preview.html?slide=${index}`;
    };

    div.appendChild(img);
    div.appendChild(headerInput);
    div.appendChild(textInput);
    div.appendChild(saveButton);
    div.appendChild(previewButton);
    div.appendChild(deleteButton);

    slideList.appendChild(div);
  });
}

// Initial load
loadSlides();

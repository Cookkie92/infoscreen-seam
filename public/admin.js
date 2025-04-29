const form = document.getElementById('uploadForm');
const status = document.getElementById('status');
const slideList = document.getElementById('slideList');
const statsForm = document.getElementById('statsForm');

// Handle slide upload
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const header = document.getElementById('headerInput').value.trim();
  const text = document.getElementById('textInput').value.trim();
  const image = document.getElementById('image').files[0];

  if (!header || !text || !image) {
    status.textContent = 'Please fill in all fields and select an image.';
    return;
  }

  const formData = new FormData();
  formData.append('image', image);
  formData.append('header', header);
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

// Toast function
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 2500);
}

// Handle statistics update
statsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const stats = {
    sickLeave: document.getElementById('sickLeaveInput').value.trim(),
    daysWithoutInjury: document.getElementById('daysWithoutInjuryInput').value.trim(),
    reportingFrequency: document.getElementById('reportingFrequencyInput').value.trim(),
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
    img.className = 'slide-img';

    const headerInput = document.createElement('input');
    headerInput.value = slide.header || '';
    headerInput.placeholder = 'Edit header...';
    headerInput.className = 'slide-header-input';

    const textInput = document.createElement('textarea');
    textInput.value = slide.text || '';
    textInput.placeholder = 'Edit paragraph text...';
    textInput.rows = 3;
    textInput.className = 'slide-textarea';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'save-btn';
    saveButton.onclick = async () => {
      const updated = {
        header: headerInput.value.trim(),
        text: textInput.value.trim()
      };
      await fetch(`/slide/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      showToast('✔ Slide saved!');
      loadSlides();
    };

    const previewButton = document.createElement('button');
    previewButton.textContent = 'Preview';
    previewButton.className = 'preview-btn';
    previewButton.onclick = () => {
      window.location.href = `/preview.html?slide=${index}`;
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-btn';
    deleteButton.onclick = async () => {
      if (confirm('Are you sure you want to delete this slide?')) {
        await fetch(`/slide/${index}`, { method: 'DELETE' });
        loadSlides();
      }
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

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

// Toast function
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100); // Slight delay for transition

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 2500); // Show toast for 2.5 seconds
}


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
    img.className = 'slide-img';  // ✅ Use a CSS class!

    // Create styled header input
    const headerInput = document.createElement('input');
    headerInput.value = slide.header || '';
    headerInput.placeholder = 'Edit header...';
    headerInput.className = 'slide-header-input';

    // Create styled paragraph text input
    const textInput = document.createElement('textarea');
    textInput.value = slide.text || '';
    textInput.placeholder = 'Edit paragraph text...';
    textInput.rows = 3;
    textInput.className = 'slide-textarea';

    // Save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'save-btn';
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
      showToast('✔ Slide saved!');
      loadSlides();
    };

    // Preview button
    const previewButton = document.createElement('button');
    previewButton.textContent = 'Preview';
    previewButton.className = 'preview-btn';
    previewButton.onclick = () => {
      window.location.href = `/preview.html?slide=${index}`;
    };

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-btn';
    deleteButton.onclick = async () => {
      if (confirm('Are you sure you want to delete this slide?')) {
        await fetch(`/slide/${index}`, { method: 'DELETE' });
        loadSlides();
      }
    };

    // Append elements to slide card
    div.appendChild(img);
    div.appendChild(headerInput);
    div.appendChild(textInput);
    div.appendChild(saveButton);
    div.appendChild(previewButton);
    div.appendChild(deleteButton);

    // Add the slide to the list
    slideList.appendChild(div);
  });
}

// Initial load
loadSlides();

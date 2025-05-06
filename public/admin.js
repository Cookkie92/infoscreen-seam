// ✅ admin.js with full slide + celebration support
const form = document.getElementById('uploadForm');
const status = document.getElementById('status');
const slideList = document.getElementById('slideList');
const statsForm = document.getElementById('statsForm');
const celebrationForm = document.getElementById('celebrationForm');
const triggerCelebrationBtn = document.getElementById('triggerCelebrationBtn');

// Handle slide upload
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const header = document.getElementById('headerInput').value.trim();
  const text = document.getElementById('textInput').value.trim();
  const image = document.getElementById('image').files[0];
  const headerColor = document.getElementById('headerColor').value;
  const headerFont = document.getElementById('headerFont').value;
  const textColor = document.getElementById('textColor').value;
  const textFont = document.getElementById('textFont').value;

  if (!image) {
    status.textContent = 'Please select an image.';
    return;
  }

  const formData = new FormData();
  formData.append('image', image);
  formData.append('header', header);
  formData.append('text', text);
  formData.append('headerColor', headerColor);
  formData.append('headerFont', headerFont);
  formData.append('textColor', textColor);
  formData.append('textFont', textFont);

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

// Handle celebration upload
celebrationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const image = document.getElementById('celebrationImage').files[0];
  const sound = document.getElementById('celebrationSound').files[0];

  if (!image) {
    alert('Please select a celebration image.');
    return;
  }

  const formData = new FormData();
  formData.append('image', image);
  if (sound) formData.append('sound', sound);

  const res = await fetch('/celebration', {
    method: 'POST',
    body: formData
  });

  if (res.ok) {
    showToast('🎉 Celebration uploaded!');
    celebrationForm.reset();
  } else {
    alert('Failed to upload celebration.');
  }
});

triggerCelebrationBtn.addEventListener('click', async () => {
  const res = await fetch('/celebration/trigger', { method: 'POST' });
  if (res.ok) {
    showToast('🎉 Celebration triggered!');
  } else {
    alert('Failed to trigger celebration.');
  }
});

// Toast function
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 500);
  }, 2500);
}

// Statistics update
statsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  let sickLeave = document.getElementById('sickLeaveInput').value.trim();
  const daysWithoutInjury = document.getElementById('daysWithoutInjuryInput').value.trim();
  const reportingFrequency = document.getElementById('reportingFrequencyInput').value.trim();

  if (sickLeave && !sickLeave.endsWith('%')) {
    sickLeave += '%';
  }

  const stats = {};
  if (sickLeave !== '') stats.sickLeave = sickLeave;
  if (daysWithoutInjury !== '') stats.daysWithoutInjury = daysWithoutInjury;
  if (reportingFrequency !== '') stats.reportingFrequency = reportingFrequency;

  if (Object.keys(stats).length === 0) {
    alert('Please enter at least one field to update.');
    return;
  }

  const res = await fetch('/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats)
  });

  if (res.ok) {
    alert('Statistics updated!');
    statsForm.reset();
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

    const headerLabel = document.createElement('label');
    headerLabel.textContent = 'Header Text';
    const headerInput = document.createElement('input');
    headerInput.value = slide.header || '';
    headerInput.className = 'slide-header-input';

    const textLabel = document.createElement('label');
    textLabel.textContent = 'Paragraph Text';
    const textInput = document.createElement('textarea');
    textInput.value = slide.text || '';
    textInput.rows = 3;
    textInput.className = 'slide-textarea';

    const headerColorLabel = document.createElement('label');
    headerColorLabel.textContent = 'Header Color';
    const headerColorInput = document.createElement('input');
    headerColorInput.type = 'color';
    headerColorInput.value = slide.headerColor || '#ffffff';
    headerColorInput.className = 'slide-color-input';

    const textColorLabel = document.createElement('label');
    textColorLabel.textContent = 'Paragraph Color';
    const textColorInput = document.createElement('input');
    textColorInput.type = 'color';
    textColorInput.value = slide.textColor || '#ffffff';
    textColorInput.className = 'slide-color-input';

    const headerFontLabel = document.createElement('label');
    headerFontLabel.textContent = 'Header Font';
    const headerFontSelect = document.createElement('select');
    headerFontSelect.className = 'slide-font-select';
    ['inherit', 'Arial', 'Georgia', 'Courier New', 'Times New Roman', 'Roboto', 'Lobster', 'Source Sans 3'].forEach(font => {
      const opt = document.createElement('option');
      opt.value = font.includes(' ') ? `'${font}'` : font;
      opt.textContent = font;
      if (slide.headerFont === opt.value) opt.selected = true;
      headerFontSelect.appendChild(opt);
    });

    const textFontLabel = document.createElement('label');
    textFontLabel.textContent = 'Paragraph Font';
    const textFontSelect = document.createElement('select');
    textFontSelect.className = 'slide-font-select';
    ['inherit', 'Arial', 'Georgia', 'Courier New', 'Times New Roman', 'Roboto', 'Lobster', 'Source Sans 3'].forEach(font => {
      const opt = document.createElement('option');
      opt.value = font.includes(' ') ? `'${font}'` : font;
      opt.textContent = font;
      if (slide.textFont === opt.value) opt.selected = true;
      textFontSelect.appendChild(opt);
    });

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'save-btn';
    saveButton.onclick = async () => {
      const updated = {
        header: headerInput.value.trim(),
        text: textInput.value.trim(),
        headerColor: headerColorInput.value,
        headerFont: headerFontSelect.value,
        textColor: textColorInput.value,
        textFont: textFontSelect.value
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
    div.appendChild(headerLabel);
    div.appendChild(headerInput);
    div.appendChild(headerColorLabel);
    div.appendChild(headerColorInput);
    div.appendChild(headerFontLabel);
    div.appendChild(headerFontSelect);
    div.appendChild(textLabel);
    div.appendChild(textInput);
    div.appendChild(textColorLabel);
    div.appendChild(textColorInput);
    div.appendChild(textFontLabel);
    div.appendChild(textFontSelect);
    div.appendChild(saveButton);
    div.appendChild(previewButton);
    div.appendChild(deleteButton);

    slideList.appendChild(div);
  });
}

const deleteAllBtn = document.getElementById('deleteAllBtn');
if (deleteAllBtn) {
  deleteAllBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete ALL slides? This cannot be undone.')) {
      const res = await fetch('/slides', { method: 'DELETE' });
      if (res.ok) {
        showToast('🗑️ All slides deleted!');
        loadSlides();
      } else {
        alert('Failed to delete slides.');
      }
    }
  });
}

loadSlides();

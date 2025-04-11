
const form = document.getElementById('uploadForm');
const status = document.getElementById('status');
const slideList = document.getElementById('slideList');

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

    const text = document.createElement('p');
    text.textContent = slide.text;

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = slide.text;
    textInput.style.display = 'none';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.style.display = 'none';
    saveBtn.onclick = async () => {
      const res = await fetch(`/slide/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput.value }),
      });
      if (res.ok) {
        loadSlides();
      }
    };

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      text.style.display = 'none';
      textInput.style.display = 'inline-block';
      saveBtn.style.display = 'inline-block';
      editBtn.style.display = 'none';
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.onclick = async () => {
      if (confirm('Are you sure?')) {
        await fetch(`/slide/${index}`, { method: 'DELETE' });
        loadSlides();
      }
    };

    div.appendChild(img);
    div.appendChild(text);
    div.appendChild(textInput);
    div.appendChild(editBtn);
    div.appendChild(saveBtn);
    div.appendChild(delBtn);
    slideList.appendChild(div);
  });
}

loadSlides();

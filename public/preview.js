async function loadSlide() {
    const urlParams = new URLSearchParams(window.location.search);
    const slideIndex = urlParams.get('slide');
  
    const res = await fetch('/slides');
    const slides = await res.json();
    const slide = slides[slideIndex];
  
    if (!slide) return;
  
    document.getElementById('slide-image').src = slide.image;
    document.getElementById('slide-heading').textContent = slide.header || 'Default Title';
    document.getElementById('slide-paragraph').textContent = slide.text || 'Default paragraph...';
  }
  
  document.getElementById('backButton').onclick = () => {
    window.location.href = '/admin.html';
  };
  
  loadSlide();
  
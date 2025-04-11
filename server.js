
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const uploadsDir = path.join(__dirname, 'uploads');
const dataFile = path.join(__dirname, 'data', 'slides.json');
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  const slides = JSON.parse(fs.readFileSync(dataFile));
  const newSlide = {
    image: `/uploads/${req.file.filename}`,
    text: req.body.text || '',
  };
  slides.push(newSlide);
  fs.writeFileSync(dataFile, JSON.stringify(slides, null, 2));
  res.status(200).json({ success: true });
});

app.get('/slides', (req, res) => {
  const slides = JSON.parse(fs.readFileSync(dataFile));
  res.json(slides);
});

app.delete('/slide/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  let slides = JSON.parse(fs.readFileSync(dataFile));
  if (index >= 0 && index < slides.length) {
    const removed = slides.splice(index, 1);
    fs.writeFileSync(dataFile, JSON.stringify(slides, null, 2));
    const imagePath = path.join(__dirname, removed[0].image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid index' });
  }
});

app.put('/slide/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  let slides = JSON.parse(fs.readFileSync(dataFile));
  if (index >= 0 && index < slides.length) {
    slides[index].text = req.body.text || '';
    fs.writeFileSync(dataFile, JSON.stringify(slides, null, 2));
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid index' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

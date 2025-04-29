const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// File paths
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
const slidesFile = path.join(dataDir, 'slides.json');
const statsFile = path.join(dataDir, 'stats.json');

// Ensure folders/files exist
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

if (!fs.existsSync(slidesFile)) fs.writeFileSync(slidesFile, '[]');
if (!fs.existsSync(statsFile)) {
  fs.writeFileSync(statsFile, JSON.stringify({
    sickLeave: "0%",
    daysWithoutInjury: "0",
    reportingFrequency: "0%"
  }, null, 2));
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Upload a new slide
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded.' });
    }

    const { header = '', text = '' } = req.body;
    const slides = JSON.parse(fs.readFileSync(slidesFile));

    const newSlide = {
      image: `/uploads/${req.file.filename}`,
      header,
      text,
    };

    slides.push(newSlide);
    fs.writeFileSync(slidesFile, JSON.stringify(slides, null, 2));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload slide.' });
  }
});

// Get all slides
app.get('/slides', (req, res) => {
  try {
    const slides = JSON.parse(fs.readFileSync(slidesFile));
    res.json(slides);
  } catch (err) {
    console.error('Load Slides Error:', err);
    res.status(500).json({ error: 'Failed to load slides.' });
  }
});

// Delete a slide
app.delete('/slide/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    let slides = JSON.parse(fs.readFileSync(slidesFile));

    if (index >= 0 && index < slides.length) {
      const [removed] = slides.splice(index, 1);
      fs.writeFileSync(slidesFile, JSON.stringify(slides, null, 2));

      const imagePath = path.join(__dirname, removed.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid slide index.' });
    }
  } catch (err) {
    console.error('Delete Slide Error:', err);
    res.status(500).json({ error: 'Failed to delete slide.' });
  }
});

// Edit a slide (header and text)
app.put('/slide/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const { header, text } = req.body;
    let slides = JSON.parse(fs.readFileSync(slidesFile));

    if (index >= 0 && index < slides.length) {
      slides[index].header = header ?? slides[index].header;
      slides[index].text = text ?? slides[index].text;
      fs.writeFileSync(slidesFile, JSON.stringify(slides, null, 2));
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid slide index.' });
    }
  } catch (err) {
    console.error('Edit Slide Error:', err);
    res.status(500).json({ error: 'Failed to edit slide.' });
  }
});

// Update statistics
app.post('/stats', (req, res) => {
  try {
    const stats = {
      sickLeave: req.body.sickLeave || "0%",
      daysWithoutInjury: req.body.daysWithoutInjury || "0",
      reportingFrequency: req.body.reportingFrequency || "0%",
    };
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Update Stats Error:', err);
    res.status(500).json({ error: 'Failed to update statistics.' });
  }
});

// Get statistics
app.get('/stats', (req, res) => {
  try {
    const stats = JSON.parse(fs.readFileSync(statsFile));
    res.json(stats);
  } catch (err) {
    console.error('Load Stats Error:', err);
    res.status(500).json({ error: 'Failed to load statistics.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

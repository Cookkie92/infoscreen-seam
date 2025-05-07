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
const celebrationFile = path.join(dataDir, 'celebration.json');
const celebrationsFile = path.join(dataDir, 'celebrations.json');

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
if (!fs.existsSync(celebrationFile)) {
  fs.writeFileSync(celebrationFile, JSON.stringify({ image: '', sound: '', heading: '' }, null, 2));
}
if (!fs.existsSync(celebrationsFile)) fs.writeFileSync(celebrationsFile, '[]');

let celebrationTrigger = false;

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

    const {
      header = '',
      text = '',
      headerColor = '#ffffff',
      headerFont = 'inherit',
      textColor = '#ffffff',
      textFont = 'inherit'
    } = req.body;

    const slides = JSON.parse(fs.readFileSync(slidesFile));

    const newSlide = {
      image: `/uploads/${req.file.filename}`,
      header,
      text,
      headerColor,
      headerFont,
      textColor,
      textFont
    };

    slides.push(newSlide);
    fs.writeFileSync(slidesFile, JSON.stringify(slides, null, 2));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload slide.' });
  }
});

// Upload new celebration
app.post('/celebrations', upload.any(), (req, res) => {
  try {
    const celebrationData = {};

    for (const file of req.files) {
      if (file.fieldname === 'celebrationImage') {
        celebrationData.image = `/uploads/${file.filename}`;
      }
      if (file.fieldname === 'celebrationSound') {
        celebrationData.sound = `/uploads/${file.filename}`;
      }
    }

    if (req.body.celebrationHeading) {
      celebrationData.heading = req.body.celebrationHeading;
    }

    const celebrations = JSON.parse(fs.readFileSync(celebrationsFile));
    celebrations.push(celebrationData);
    fs.writeFileSync(celebrationsFile, JSON.stringify(celebrations, null, 2));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Upload Celebration Error:', err);
    res.status(500).json({ error: 'Failed to upload celebration.' });
  }
});

// Get all celebrations
app.get('/celebrations', (req, res) => {
  try {
    const celebrations = JSON.parse(fs.readFileSync(celebrationsFile));
    res.json(celebrations);
  } catch (err) {
    console.error('Load Celebrations Error:', err);
    res.status(500).json({ error: 'Failed to load celebrations.' });
  }
});

// Delete celebration by index
app.delete('/celebration/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const celebrations = JSON.parse(fs.readFileSync(celebrationsFile));

    if (index >= 0 && index < celebrations.length) {
      const removed = celebrations.splice(index, 1)[0];
      fs.writeFileSync(celebrationsFile, JSON.stringify(celebrations, null, 2));

      if (removed.image) {
        const imagePath = path.join(__dirname, 'uploads', path.basename(removed.image));
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
      if (removed.sound) {
        const soundPath = path.join(__dirname, 'uploads', path.basename(removed.sound));
        if (fs.existsSync(soundPath)) fs.unlinkSync(soundPath);
      }

      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid celebration index' });
    }
  } catch (err) {
    console.error('Delete Celebration Error:', err);
    res.status(500).json({ error: 'Failed to delete celebration.' });
  }
});

// Restore celebration trigger endpoint
app.post('/celebration/trigger', (req, res) => {
  celebrationTrigger = true;
  res.status(200).json({ triggered: true });
});

app.get('/celebration/trigger', (req, res) => {
  const wasTriggered = celebrationTrigger;
  celebrationTrigger = false;
  res.status(200).json({ triggered: wasTriggered });
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

      const imagePath = path.join(__dirname, 'uploads', path.basename(removed.image));
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

// Delete all slides
app.delete('/slides', (req, res) => {
  try {
    const slides = JSON.parse(fs.readFileSync(slidesFile));

    slides.forEach(slide => {
      const imagePath = path.join(__dirname, 'uploads', path.basename(slide.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    fs.writeFileSync(slidesFile, '[]');

    res.json({ success: true });
  } catch (err) {
    console.error('Delete All Slides Error:', err);
    res.status(500).json({ error: 'Failed to delete all slides.' });
  }
});

// Edit a slide
app.put('/slide/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);
    const slides = JSON.parse(fs.readFileSync(slidesFile));

    if (index >= 0 && index < slides.length) {
      const updated = req.body;

      slides[index] = {
        ...slides[index],
        header: updated.header ?? slides[index].header,
        text: updated.text ?? slides[index].text,
        headerColor: updated.headerColor ?? slides[index].headerColor,
        headerFont: updated.headerFont ?? slides[index].headerFont,
        textColor: updated.textColor ?? slides[index].textColor,
        textFont: updated.textFont ?? slides[index].textFont,
      };

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
    const currentStats = JSON.parse(fs.readFileSync(statsFile));
    const updatedStats = { ...currentStats, ...req.body };
    fs.writeFileSync(statsFile, JSON.stringify(updatedStats, null, 2));
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

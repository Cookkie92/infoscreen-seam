# infoscreen-seam
to show info on the infoscreens


# 📺 infoscreen-seam

A simple internal infoscreen system for looping image slides, with an admin interface for HR and QHSE to upload and manage content.

---

## 🧱 Project Structure

infoscreen-seam/ ├── public/ │ ├── index.html ← Slideshow page │ ├── admin.html ← Admin upload & management page │ ├── style.css ← Shared styles │ ├── slideshow.js ← Slideshow logic │ └── admin.js ← Admin panel logic │ ├── uploads/ ← Uploaded images (auto-created) ├── data/ │ └── slides.json ← Stores all slide info (image + text) │ ├── server.js ← Node.js Express backend ├── package.json └── .gitignore

yaml
Copy
Edit

---

## 🚀 How It Works

### 🌐 Slideshow (`/`)
- Opens fullscreen and cycles through all uploaded slides.
- Each slide contains:
  - The uploaded image
  - An optional text caption
- Automatically transitions every 8 seconds.

### 🔧 Admin Panel (`/admin.html`)
- Lets HR/QHSE:
  - Upload a new image and optional text
  - View all uploaded slides
  - Edit text captions inline
  - Delete slides

---

## 🏃 How to Run It

1. **Install dependencies**
   ```bash
   npm install
Start the server

bash
Copy
Edit
node server.js
Access the pages

Admin: http://localhost:3000/admin.html

Slideshow: http://localhost:3000/

🌐 Accessing from Other Devices
Find your local IP address:

Run ipconfig (Windows) or ifconfig (Mac/Linux)

Look for something like 192.168.1.42

Others can access:

Admin: http://192.168.1.42:3000/admin.html

Slideshow: http://192.168.1.42:3000/

⚠️ Ensure:

All devices are on the same network

Port 3000 is allowed through your firewall

✅ Current Features
Upload image + text via admin panel

View and edit all slides

Delete slides (removes image too)

Slides show in fullscreen loop

🛠️ To Do (Future Improvements)
 Password protect /admin.html

 Drag-and-drop uploader

 Edit existing slide images

 Autostart on boot for display PCs

 Use infoscreen.local with LAN DNS or hosts file


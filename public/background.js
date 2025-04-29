
// Create the background container
const background = document.createElement('div');
background.className = 'background-circles';
document.body.prepend(background);

// Define soft color options
const colors = [
  'rgba(255, 255, 255, 0.55)',  // Soft white
  'rgba(0, 171, 239, 0.53)',    // Soft light blue
  'rgba(0, 255, 149, 0.45)',    // Soft green
  'rgba(255, 217, 0, 0.48)',    // Soft yellow
  'rgba(255, 99, 71, 0.56)'     // Soft reddish
];

for (let i = 0; i < 30; i++) {
  const circle = document.createElement('div');
  circle.className = 'circle';

  const size = Math.random() * 300 + 100; // Random size 100-400px
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;

  // Random start position
  circle.style.top = `${Math.random() * 100}%`;
  circle.style.left = `${Math.random() * 100}%`;

  // Random color
  const color = colors[Math.floor(Math.random() * colors.length)];
  circle.style.border = `2px solid ${color}`;

  // Random animation speeds
  const floatSpinDuration = 120 + Math.random() * 80; // 120s - 200s
  const fadeDuration = 10 + Math.random() * 10;        // 10s - 20s

  circle.style.animation = `
    floatAndSpin ${floatSpinDuration}s linear infinite alternate,
    fade ${fadeDuration}s ease-in-out infinite alternate
  `;

  background.appendChild(circle);
}


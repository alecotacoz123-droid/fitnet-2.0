const fs = require('fs');
const path = require('path');
const https = require('https');

const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
const destPath = path.resolve(__dirname, 'uploads', 'demo_video.mp4');

console.log('Descargando video de muestra de W3Schools...');
const file = fs.createWriteStream(destPath);

https.get(videoUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Error: Código ${response.statusCode}`);
    process.exit(1);
  }
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('¡Descargado con éxito!');
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

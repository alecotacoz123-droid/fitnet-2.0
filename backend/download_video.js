const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const videoUrl = 'https://player.vimeo.com/external/225106571.hd.mp4';
const destPath = path.resolve(__dirname, 'uploads', 'demo_video.mp4');

console.log('Descargando video de fitness real de Vimeo...');
const file = fs.createWriteStream(destPath);

const parsedUrl = url.parse(videoUrl);
const options = {
  hostname: parsedUrl.hostname,
  path: parsedUrl.path,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
};

https.get(options, (response) => {
  if (response.statusCode === 301 || response.statusCode === 302) {
    const redirectUrl = response.headers.location;
    console.log(`Redirigiendo a: ${redirectUrl}`);
    https.get(redirectUrl, (redirectResponse) => {
      redirectResponse.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('¡Video de fitness descargado con éxito!');
        process.exit(0);
      });
    });
    return;
  }

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

const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable gzip/brotli compression
app.use(compression());

// Domain-level redirect: chrono.ninja -> chrononinja.app (preserve path/query/hash)
app.use((req, res, next) => {
  try {
    const host = String(req.headers.host || '').toLowerCase();
    if (host === 'chrono.ninja' || host === 'www.chrono.ninja') {
      const target = `https://chrononinja.app${req.originalUrl || ''}`;
      res.redirect(301, target);
      return;
    }
  } catch {}
  next();
});

// Serve static files from the build directory (CRA output) with proper cache headers
app.use(
  express.static(path.join(__dirname, 'build'), {
    index: false,
    setHeaders: (res, filePath) => {
      // Long cache for app icons
      if (/\\logo(?:192|512)\.png$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return;
      }
      // Long cache for hashed static assets
      if (filePath.includes(path.join('build', 'static'))) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return;
      }
      // Cache other static assets for 1 day, but not HTML
      if (/\.(?:js|css|png|webp|jpg|jpeg|gif|svg|ico|woff2?)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
      if (/index\.html$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  })
);

// Redirect root to /menu for better UX (SSR redirect)
app.get('/', (req, res) => {
  res.redirect(302, '/menu');
});

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/distance', (req, res) => {
  const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  const params = new URLSearchParams({
    origins: req.query.origin,
    destinations: req.query.destination,
    mode: 'driving',
    units: 'metric',
    key: process.env.GOOGLE_API_KEY
  });

  fetch(`${url}?${params}`)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(error => res.status(500).json({ error }));
});

app.listen(3000);

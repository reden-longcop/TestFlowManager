import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/flow', (req, res) => {
  // Format the JSON data with 4 spaces of indentation
  const formattedData = JSON.stringify(req.body, null, 4);

  fs.writeFile(path.join(__dirname, 'public', 'flow.json'), formattedData, (err) => {
    if (err) {
      console.error('Failed to save data:', err);
      return res.status(500).json({ message: 'Failed to save data.' });
    }
    res.status(200).json({ message: 'Data saved successfully.' });
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
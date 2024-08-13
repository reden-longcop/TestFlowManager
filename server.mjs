import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Handle saving the JSON file
app.post('/save-flow', (req, res) => {
  fs.writeFile(path.join(__dirname, 'public', 'flow.json'), JSON.stringify(req.body), (err) => {
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

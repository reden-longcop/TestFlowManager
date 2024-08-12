const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3001; // Change this port number if needed

app.use(express.json());

const jsonFilePath = path.join(__dirname, 'data.json');

// Load the flow data from the JSON file
app.get('/api/flow', async (req, res) => {
  try {
    const data = await fs.readFile(jsonFilePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).send('Failed to read data.');
  }
});

// Save the flow data to the JSON file
app.post('/api/flow', async (req, res) => {
  try {
    await fs.writeFile(jsonFilePath, JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Failed to save data.');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
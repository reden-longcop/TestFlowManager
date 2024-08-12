const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000; // You can change this port if needed

app.use(bodyParser.json());

// Path to your JSON file
const jsonFilePath = path.join(__dirname, 'flow.json');

// Handle GET request to /api/flow
app.get('/api/flow', (req, res) => {
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read flow data' });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// Handle POST request to /api/flow
app.post('/api/flow', (req, res) => {
  const flowData = req.body;
  fs.writeFile(jsonFilePath, JSON.stringify(flowData, null, 2), 'utf8', (err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to save flow data' });
    } else {
      res.status(200).json({ message: 'Flow data saved successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
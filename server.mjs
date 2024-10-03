/*
 * This file is part of Test Flow Manager.
 *
 * Test Flow Manager is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Test Flow Manager is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Test Flow Manager. If not, see <http://www.gnu.org/licenses/>.
*/

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { exec } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "150mb" }));
app.use(express.static(path.join(__dirname, "public")));

const flowFilePath = path.join(__dirname, "public", "versions.json");
if (!fs.existsSync(flowFilePath)) {
  fs.writeFileSync(flowFilePath, JSON.stringify({ versions: [] }, null, 4));
}

app.post("/flow", (req, res) => {
  const formattedData = JSON.stringify(req.body, null, 4);
  fs.writeFile(path.join(__dirname, "public", "flow.json"), formattedData, (err) => {
    if (err) {
      console.error("Failed to save data:", err);
      return res.status(500).json({ message: "Failed to save data." });
    }
    res.status(200).json({ message: "Data saved successfully." });
  });
});

app.post("/flow/saveVersion", (req, res) => {
  const versionData = req.body;

  fs.readFile(flowFilePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Failed to read flow file:", err);
      return res.status(500).json({ message: "Failed to read flow file." });
    }

    let flow;
    try {
      flow = JSON.parse(data);
    } catch (parseError) {
      console.error("Failed to parse flow file:", parseError);
      return res.status(500).json({ message: "Failed to parse flow file." });
    }

    flow.versions = flow.versions || [];

    if (typeof versionData.flowData === 'string') {
      try {
        versionData.flowData = JSON.parse(versionData.flowData);
      } catch (parseError) {
        console.error("Failed to parse flowData:", parseError);
        return res.status(500).json({ message: "Failed to parse flowData." });
      }
    }

    flow.versions.push(versionData);

    if (flow.versions.length > 5) {
      flow.versions = flow.versions.slice(-5);
    }

    fs.writeFile(flowFilePath, JSON.stringify(flow, null, 4), (err) => {
      if (err) {
        console.error("Failed to save version data:", err);
        return res.status(500).json({ message: "Failed to save version data." });
      }
      res.status(200).json({ message: "Version data saved successfully." });
    });
  });
});


app.get("/flow/getVersions", (req, res) => {
  fs.readFile(flowFilePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Failed to read flow file:", err);
      return res.status(500).json({ message: "Failed to read flow file." });
    }

    const flow = JSON.parse(data);
    const versions = flow.versions || [];

    const parsedVersions = versions.map(version => {
      return {
        ...version,
        flowData: JSON.parse(version.flowData)
      };
    });

    res.header("Content-Type", "application/json");
    res.json({ versions: parsedVersions });
  });
});

app.post('/run-script', (req, res) => {
  const { testCaseId } = req.body;

  if (!testCaseId) {
      return res.status(400).json({ message: 'Test case ID is required.' });
  }

  // Execute the Python script
  exec(`python run_automation.py ${testCaseId}`, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error executing script: ${error.message}`);
          return res.status(500).json({ message: 'Failed to execute script.' });
      }
      
      console.log('eh');
      console.log(`Script output: ${stdout}`);

      // Log the type of stdout
      console.log(`Type of stdout: ${typeof stdout}`);
      
      var result = stdout; // Assuming stdout is correctly captured as a string
      console.log(`Result: ${result}`);

      if (stderr) {
          console.error(`Script errors: ${stderr}`);
      }

      // Send the test result back to the client
      res.status(200).json({ message: 'Script executed successfully.', result });
  });
});



app.post('/test', (req, res) => {
  res.send('POST request received');
});


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
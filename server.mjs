import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.static("public"));

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

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
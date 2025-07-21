const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());

app.get("/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon parameter" });
  }

  try {
    const fetch = await import("node-fetch"); // dynamic import
    const response = await fetch.default(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "PinDropTool/1.0",
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Reverse geocode error:", error);
    res.status(500).json({ error: "Failed to fetch address" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

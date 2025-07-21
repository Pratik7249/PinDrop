const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());

app.get("/reverse-geocode", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and longitude are required." });
  }

  try {
    const fetch = await import("node-fetch");

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

    const response = await fetch.default(url, {
      headers: {
        "User-Agent": "PinDropTool/1.0 (contactme@pindroptool.com)", 
      },
    });

    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error("Error while fetching geocode:", err.message);
    res.status(500).json({ error: "Failed to fetch address from API." });
  }
});

app.listen(PORT, () => {
  console.log(`proxy running at: http://localhost:${PORT}`);
});

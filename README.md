# 📍 Pin Drop Tool with Remarks

An interactive map-based tool where users can drop pins, add remarks, and fetch addresses for the pinned locations. All pins are saved and listed for easy navigation and persistent across sessions using local storage.



##  Features

- 🗺️ **Interactive Map:** Click to drop a pin anywhere on the map.
- 📝 **Remarks:** Add optional comments to each pin via a popup form.
- 📍 **Reverse Geocoding:** Automatically fetch the address using the latitude and longitude (via OpenStreetMap's Nominatim API).
- 💾 **Saved Pins Sidebar:** View a list of all saved pins with remarks and addresses.
- 🧭 **Pin Navigation:** Click any pin from the sidebar to fly to its location on the map.
- 🔁 **Persistence:** All pin data is saved in local storage and remains across sessions.



## 📦 Installation

**Clone the repository:**
   ```bash
   git clone https://github.com/Pratik7249/PinDrop.git
   cd PinDrop
   ```
**Install dependencies:**
```
npm install react react-dom react-scripts leaflet react-leaflet
npm install express node-fetch #for proxy-server.js
``` 
**Start the development server:**

```
npm start
``` 
**(Optional) Start the Proxy Server for Address Fetching:**
```
node proxy-server.js
```
This is used to avoid CORS issues when calling the Nominatim API.

## Technologies Used
- React

- Leaflet (for maps)

- OpenStreetMap Nominatim API

- LocalStorage (for data persistence)

## Project Structure
```
.
├── public/
├── src/
│   ├── App.js
│   ├── MapView.js
│   └── ...
├── proxy-server.js
├── package.json
└── README.md
```

## Acknowledgements
- Leaflet — Open-source JavaScript library for mobile-friendly maps.

- OpenStreetMap — Community-powered open map platform.

- Nominatim — Geocoding tool used for address lookup.

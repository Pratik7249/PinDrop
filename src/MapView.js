import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Handles map clicks to set new marker
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// Fly to selected pin
const FlyToPin = ({ pin }) => {
  const map = useMap();
  useEffect(() => {
    if (pin) {
      map.flyTo([pin.lat, pin.lng], 14);
    }
  }, [pin, map]);
  return null;
};

// Fetch address from proxy server
const fetchAddress = async (lat, lng) => {
  try {
    const res = await fetch(
      `http://localhost:4000/reverse-geocode?lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data.display_name || "Address not found";
  } catch (error) {
    console.error("Address fetch failed:", error);
    return "Address fetch error";
  }
};

const MapView = () => {
  const [newPin, setNewPin] = useState(null);
  const [remark, setRemark] = useState("");
  const [savedPins, setSavedPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editRemark, setEditRemark] = useState("");

  useEffect(() => {
    const storedPins = JSON.parse(localStorage.getItem("pins")) || [];
    setSavedPins(storedPins);
  }, []);

  const handleMapClick = (latlng) => {
    setNewPin(latlng);
    setRemark("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const address = await fetchAddress(newPin.lat, newPin.lng);
    const newPinData = {
      lat: newPin.lat,
      lng: newPin.lng,
      remark: remark,
      address: address,
    };
    const updatedPins = [...savedPins, newPinData];
    localStorage.setItem("pins", JSON.stringify(updatedPins));
    setSavedPins(updatedPins);
    setNewPin(null);
  };

  const handleDeletePin = (indexToDelete) => {
    const updatedPins = savedPins.filter((_, i) => i !== indexToDelete);
    localStorage.setItem("pins", JSON.stringify(updatedPins));
    setSavedPins(updatedPins);
    setSelectedPin(null);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all pins?")) {
      localStorage.removeItem("pins");
      setSavedPins([]);
      setSelectedPin(null);
    }
  };

  const handleSaveEdit = (index) => {
    const updatedPins = [...savedPins];
    updatedPins[index].remark = editRemark;
    localStorage.setItem("pins", JSON.stringify(updatedPins));
    setSavedPins(updatedPins);
    setEditIndex(null);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "300px",
          padding: "10px",
          background: "#f4f4f4",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        <h3>Saved Pins</h3>

        {savedPins.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              background: "#d9534f",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              marginBottom: "10px",
              cursor: "pointer",
            }}
          >
            Clear All Pins
          </button>
        )}

        {savedPins.length === 0 && <p>No pins saved yet.</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {savedPins.map((pin, index) => (
            <li
              key={index}
              style={{
                marginBottom: "10px",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                background: selectedPin === pin ? "#e0e0e0" : "#fff",
                position: "relative",
              }}
            >
              {editIndex === index ? (
                <div>
                  <textarea
                    value={editRemark}
                    onChange={(e) => setEditRemark(e.target.value)}
                    rows={2}
                    style={{ width: "100%" }}
                  />
                  <button onClick={() => handleSaveEdit(index)}>Save</button>
                  <button onClick={() => setEditIndex(null)}>Cancel</button>
                </div>
              ) : (
                <div
                  onClick={() => setSelectedPin(pin)}
                  style={{ cursor: "pointer" }}
                >
                  <strong>Remark:</strong>
                  <br />
                  {pin.remark || "No remark"}
                  <br />
                  <small>
                    <strong>Address:</strong> {pin.address || "Loading..."}
                  </small>
                </div>
              )}

              <button
                onClick={() => handleDeletePin(index)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  cursor: "pointer",
                }}
                title="Delete this pin"
              >
                ×
              </button>

              {editIndex !== index && (
                <button
                  onClick={() => {
                    setEditIndex(index);
                    setEditRemark(pin.remark || "");
                  }}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "30px",
                    background: "#0275d8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    cursor: "pointer",
                  }}
                  title="Edit this pin"
                >
                  ✎
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onMapClick={handleMapClick} />
          {selectedPin && <FlyToPin pin={selectedPin} />}

          {newPin && (
            <Marker position={[newPin.lat, newPin.lng]}>
              <Popup>
                <form onSubmit={handleSubmit}>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Enter remark..."
                    rows={3}
                    style={{ width: "100%" }}
                  />
                  <br />
                  <button type="submit">Save Pin</button>
                </form>
              </Popup>
            </Marker>
          )}

          {savedPins.map((pin, index) => (
            <Marker key={index} position={[pin.lat, pin.lng]}>
              <Popup>
                <strong>Remark:</strong>
                <br />
                {pin.remark || "No remark"}
                <br />
                <br />
                <strong>Address:</strong>
                <br />
                {pin.address || "Loading..."}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;

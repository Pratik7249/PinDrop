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

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click: (e) => onClick(e.latlng),
  });
  return null;
};

const AnimateToPin = ({ pin }) => {
  const map = useMap();
  useEffect(() => {
    if (pin) map.flyTo([pin.lat, pin.lng], 14);
  }, [pin, map]);
  return null;
};

const getAddressFromCoordinates = async (lat, lon) => {
  try {
    const response = await fetch(
      `http://localhost:4000/reverse-geocode?lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    return data.display_name || "Address not found";
  } catch (err) {
    console.error("Failed to fetch address:", err);
    return "Error fetching address";
  }
};

const MapView = () => {
  const [draftPin, setDraftPin] = useState(null);
  const [remarkInput, setRemarkInput] = useState("");
  const [pins, setPins] = useState([]);
  const [focusedPin, setFocusedPin] = useState(null);
  const [editModeIndex, setEditModeIndex] = useState(null);
  const [editedRemark, setEditedRemark] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pins")) || [];
    setPins(stored);
  }, []);

  const handleMapClick = (latlng) => {
    setDraftPin(latlng);
    setRemarkInput("");
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    const address = await getAddressFromCoordinates(draftPin.lat, draftPin.lng);
    const newEntry = {
      lat: draftPin.lat,
      lng: draftPin.lng,
      remark: remarkInput,
      address,
    };
    const updated = [...pins, newEntry];
    localStorage.setItem("pins", JSON.stringify(updated));
    setPins(updated);
    setDraftPin(null);
  };

  // Delete a pin by index
  const handleDelete = (index) => {
    const filtered = pins.filter((_, i) => i !== index);
    localStorage.setItem("pins", JSON.stringify(filtered));
    setPins(filtered);
    setFocusedPin(null);
  };

  // Clear all saved pins
  const handleClearPins = () => {
    if (window.confirm("Are you sure you want to remove all pins?")) {
      localStorage.removeItem("pins");
      setPins([]);
      setFocusedPin(null);
    }
  };

  // Save an edited remark
  const handleSaveEdit = (index) => {
    const updated = [...pins];
    updated[index].remark = editedRemark;
    localStorage.setItem("pins", JSON.stringify(updated));
    setPins(updated);
    setEditModeIndex(null);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar for pin list */}
      <aside
        style={{
          width: "300px",
          padding: "1rem",
          background: "#f4f4f4",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        <h3>Saved Pins</h3>

        {pins.length > 0 && (
          <button
            onClick={handleClearPins}
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

        {pins.length === 0 && <p>No pins saved yet.</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {pins.map((pin, index) => (
            <li
              key={index}
              style={{
                marginBottom: "10px",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                background: focusedPin === pin ? "#e0e0e0" : "#fff",
                position: "relative",
              }}
            >
              {editModeIndex === index ? (
                <div>
                  <textarea
                    value={editedRemark}
                    onChange={(e) => setEditedRemark(e.target.value)}
                    rows={2}
                    style={{ width: "100%" }}
                  />
                  <button onClick={() => handleSaveEdit(index)}>Save</button>
                  <button onClick={() => setEditModeIndex(null)}>Cancel</button>
                </div>
              ) : (
                <div onClick={() => setFocusedPin(pin)} style={{ cursor: "pointer" }}>
                  <strong>Remark:</strong>
                  <br />
                  {pin.remark || "No remark"}
                  <br />
                  <small><strong>Address:</strong> {pin.address || "Fetching..."}</small>
                </div>
              )}

              <button
                onClick={() => handleDelete(index)}
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

              {editModeIndex !== index && (
                <button
                  onClick={() => {
                    setEditModeIndex(index);
                    setEditedRemark(pin.remark || "");
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
      </aside>

      {/* Map View */}
      <main style={{ flex: 1 }}>
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />
          {focusedPin && <AnimateToPin pin={focusedPin} />}

          {draftPin && (
            <Marker position={[draftPin.lat, draftPin.lng]}>
              <Popup>
                <form onSubmit={handleSavePin}>
                  <textarea
                    value={remarkInput}
                    onChange={(e) => setRemarkInput(e.target.value)}
                    placeholder="Write a remark..."
                    rows={3}
                    style={{ width: "100%" }}
                  />
                  <br />
                  <button type="submit">Save Pin</button>
                </form>
              </Popup>
            </Marker>
          )}

          {pins.map((pin, idx) => (
            <Marker key={idx} position={[pin.lat, pin.lng]}>
              <Popup>
                <strong>Remark:</strong>
                <br />
                {pin.remark || "No remark"}
                <br />
                <br />
                <strong>Address:</strong>
                <br />
                {pin.address || "Fetching..."}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
};

export default MapView;

// React-Leaflet v4 syntax (React 18 compatible)
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default markers for React
const markerIcon = L.icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon.png`,
  shadowUrl: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const PropertyMap = ({ properties, selectedProperty, onSelect }) => {
  const [position, setPosition] = useState([6.1128, 125.1716]); // General Santos, PH

  useEffect(() => {
    if (selectedProperty?.lat && selectedProperty?.lng) {
      setPosition([selectedProperty.lat, selectedProperty.lng]);
    }
  }, [selectedProperty]);

  return (
    <div style={{ height: '500px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', borderRadius: '12px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* All Property Markers */}
        {properties?.map((property) => (
          <Marker 
            key={property._id} 
            position={[property.lat || 6.1128, property.lng || 125.1716]}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSelect(property)
            }}
          >
            <Popup>
              <div className="p-3">
                <h6 className="fw-bold mb-2">{property.title}</h6>
                <p className="mb-2">{property.address}</p>
                <p className="text-success fw-bold mb-2">
                  ₱{property.price?.toLocaleString()}/month
                </p>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => onSelect(property)}
                >
                  Select Property
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Selected Property (Red Highlight) */}
        {selectedProperty && (
          <Marker 
            position={[selectedProperty.lat || 6.1128, selectedProperty.lng || 125.1716]}
            icon={L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>
              <div className="p-3">
                <h6 className="text-danger fw-bold mb-2">
                  📍 SELECTED: {selectedProperty.title}
                </h6>
                <p className="small mb-2">Lat: {selectedProperty.lat?.toFixed(4)}</p>
                <p className="small mb-3">Lng: {selectedProperty.lng?.toFixed(4)}</p>
                <button className="btn btn-sm btn-warning w-100">
                  Update Location
                </button>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;

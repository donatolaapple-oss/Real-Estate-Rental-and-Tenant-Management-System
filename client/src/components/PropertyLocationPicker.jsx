import { useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const TUP_CENTER = [6.331, 124.951];

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Click map to set lat/lng (StayScout Tupi). Updates controlled string values.
 */
export default function PropertyLocationPicker({ lat, lng, onChange }) {
  const la = parseFloat(lat);
  const ln = parseFloat(lng);
  const has = !Number.isNaN(la) && !Number.isNaN(ln);

  const onPick = useCallback(
    (latitude, longitude) => {
      onChange({
        lat: String(Math.round(latitude * 1e6) / 1e6),
        lng: String(Math.round(longitude * 1e6) / 1e6),
      });
    },
    [onChange]
  );

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm mt-2" style={{ height: 260 }}>
      <MapContainer
        center={has ? [la, ln] : TUP_CENTER}
        zoom={has ? 16 : 14}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onPick} />
        {has && <Marker position={[la, ln]} />}
      </MapContainer>
      <p className="text-xs text-gray-500 mt-1 px-1">
        Click the map to drop a pin — latitude and longitude update automatically.
      </p>
    </div>
  );
}

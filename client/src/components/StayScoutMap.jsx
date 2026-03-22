import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Link } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CENTER = [6.331, 124.951];

function HeatLayer({ points, enabled }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!enabled || !points?.length) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }
    const heat = L.heatLayer(
      points.map((p) => [p.lat, p.lng, p.intensity ?? 0.5]),
      {
        radius: 28,
        blur: 22,
        max: 1,
        gradient: { 0: "#ef4444", 0.5: "#eab308", 1: "#22c55e" },
      }
    );
    heat.addTo(map);
    layerRef.current = heat;
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points, enabled]);

  return null;
}

function FlyTo({ target, zoom = 15 }) {
  const map = useMap();
  useEffect(() => {
    if (target?.lat != null && target?.lng != null) {
      map.flyTo([target.lat, target.lng], zoom, { duration: 0.8 });
    }
  }, [map, target, zoom]);
  return null;
}

/**
 * @param {object} props
 * @param {"pins" | "heatmap" | "both"} props.mode
 * @param {object} [props.focusPosition] — { lat, lng } to fly map
 */
export default function StayScoutMap({
  properties = [],
  heatmapPoints = [],
  mode = "both",
  focusPosition = null,
}) {
  const showPins = mode === "pins" || mode === "both";
  const showHeat = mode === "heatmap" || mode === "both";
  const memoHeat = useMemo(() => heatmapPoints, [heatmapPoints]);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm" style={{ height: 460 }}>
      <MapContainer center={CENTER} zoom={14} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo target={focusPosition} />
        <HeatLayer points={memoHeat} enabled={showHeat} />
        {showPins &&
          properties.map((p) => (
            <Marker key={p._id} position={[p.lat, p.lng]}>
              <Tooltip direction="top" offset={[0, -36]} opacity={0.95} permanent={false}>
                <div className="text-xs font-medium whitespace-nowrap">
                  ₱{p.price?.toLocaleString?.() ?? p.price} |{" "}
                  {p.distanceKm != null ? `${p.distanceKm}km` : "—"} |{" "}
                  {p.walkMinutes != null ? `${p.walkMinutes}min walk` : "—"}
                </div>
              </Tooltip>
              <Popup>
                <div className="text-sm min-w-[220px]">
                  <div className="font-semibold">{p.name}</div>
                  <p className="text-slate-600 text-xs mt-1">{p.description || "—"}</p>
                  <div className="mt-1">₱{p.price?.toLocaleString?.() ?? p.price}</div>
                  <div className="text-xs text-slate-500">
                    {p.distanceKm != null ? `${p.distanceKm} km from SEAIT` : "—"} ·{" "}
                    {p.walkMinutes != null ? `~${p.walkMinutes} min walk` : "—"}
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    <Link className="text-indigo-600 underline" to={`/property/${p._id}`}>
                      360° tour &amp; details
                    </Link>
                    <Link
                      className="text-indigo-600 underline"
                      to="/tenant/chat"
                      state={{ openChatWithLandlord: p.landlordId }}
                    >
                      Chat with landlord
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

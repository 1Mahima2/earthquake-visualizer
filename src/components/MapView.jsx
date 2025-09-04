import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";

/** Color scale by magnitude (USGS-inspired) */
function colorForMag(mag) {
  if (mag >= 6) return "#800026";
  if (mag >= 5) return "#BD0026";
  if (mag >= 4) return "#E31A1C";
  if (mag >= 3) return "#FC4E2A";
  if (mag >= 2) return "#FD8D3C";
  return "#FEB24C";
}

/** Convert USGS feature to {lat, lng, depth, mag, place, time, url, id} */
function normalize(feature) {
  const [lng, lat, depth] = feature?.geometry?.coordinates || [null, null, null];
  const { mag, place, time, url } = feature?.properties || {};
  return { id: feature?.id, lat, lng, depth, mag, place, time, url };
}

/** Fit map view to included points (when many points change). */
function FitToMarkers({ points }) {
  const map = useMap();
  const bounds = useMemo(() => {
    const valid = points.filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
    if (valid.length === 0) return null;
    const latLngs = valid.map((p) => [p.lat, p.lng]);
    return latLngs;
  }, [points]);

  useEffect(() => {
    if (!bounds || bounds.length === 0) return;
    // If only 1 point, set a reasonable zoom; else fit bounds.
    if (bounds.length === 1) {
      map.setView(bounds[0], 5, { animate: true });
    } else {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [bounds, map]);

  return null;
}

export default function MapView({ earthquakes }) {
  const points = useMemo(() => earthquakes.map(normalize), [earthquakes]);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      className="map-wrapper"
      worldCopyJump={true}
      preferCanvas={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToMarkers points={points} />

      {points.map((p) => {
        if (typeof p.lat !== "number" || typeof p.lng !== "number" || typeof p.mag !== "number") {
          return null;
        }
        const color = colorForMag(p.mag);
        const radius = Math.max(3, p.mag * 3.5); // scale circle size with magnitude

        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 1 }}
          >
            <Popup>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.place || "Unknown location"}</div>
                <div>Magnitude: <strong>{p.mag?.toFixed(1)}</strong></div>
                <div>Depth: {typeof p.depth === "number" ? `${p.depth} km` : "N/A"}</div>
                <div>Time: {p.time ? new Date(p.time).toLocaleString() : "N/A"}</div>
                {p.url && (
                  <div style={{ marginTop: 6 }}>
                    <a href={p.url} target="_blank" rel="noreferrer">USGS Details</a>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

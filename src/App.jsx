import { useEffect, useMemo, useRef, useState } from "react";
import MapView from "./components/MapView";
import Controls from "./components/Controls";

const FEEDS = {
  hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
  day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
};

export default function App() {
  const [timeRange, setTimeRange] = useState("day");      // hour | day | week
  const [minMag, setMinMag] = useState(0);                // filter threshold
  const [data, setData] = useState([]);                   // USGS features
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const url = FEEDS[timeRange];
    setLoading(true);
    setError("");
    setData([]);

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(Array.isArray(json.features) ? json.features : []);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Failed to fetch earthquakes. Please try again.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [timeRange]);

  const filtered = useMemo(() => {
    return data.filter((f) => typeof f?.properties?.mag === "number" && f.properties.mag >= minMag);
  }, [data, minMag]);

  return (
    <div className="app">
      <header className="header">
        <span className="title">🌍 Earthquake Visualizer</span>
        <div className="controls">
          <Controls
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            minMag={minMag}
            setMinMag={setMinMag}
          />
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.9 }}>
          {lastUpdated ? `Updated: ${lastUpdated.toLocaleString()}` : ""}
        </div>
      </header>

      <main className="content">
        {loading && <div className="status">Loading earthquakes…</div>}
        {error && <div className="status error">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="status">No earthquakes match the current filters.</div>
        )}
        <div className="map-wrapper">
          <MapView earthquakes={filtered} />
        </div>

        {/* Legend overlay */}
        <div className="legend" aria-label="Magnitude legend">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Magnitude</div>
          {[
            { label: "≥ 6.0", color: "#800026" },
            { label: "5.0 – 5.9", color: "#BD0026" },
            { label: "4.0 – 4.9", color: "#E31A1C" },
            { label: "3.0 – 3.9", color: "#FC4E2A" },
            { label: "2.0 – 2.9", color: "#FD8D3C" },
            { label: "< 2.0", color: "#FEB24C" },
          ].map((row) => (
            <div key={row.label} className="row">
              <span className="swatch" style={{ background: row.color }} />
              <span>{row.label}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, fontSize: 11, opacity: 0.8 }}>
            Circle size scales with magnitude
          </div>
        </div>
      </main>
    </div>
  );
}

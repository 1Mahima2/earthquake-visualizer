export default function Controls({ timeRange, setTimeRange, minMag, setMinMag }) {
  return (
    <>
      <label>
        Range:&nbsp;
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          aria-label="Time range"
        >
          <option value="hour">Last Hour</option>
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
        </select>
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        Min Magnitude:&nbsp;
        <input
          type="range"
          min="0"
          max="7"
          step="0.1"
          value={minMag}
          onChange={(e) => setMinMag(parseFloat(e.target.value))}
          aria-label="Minimum magnitude"
          style={{ width: 160 }}
        />
        <span style={{ width: 36, textAlign: "right" }}>{minMag.toFixed(1)}</span>
      </label>
    </>
  );
}

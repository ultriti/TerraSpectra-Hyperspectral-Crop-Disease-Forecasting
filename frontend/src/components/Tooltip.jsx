export default function Tooltip({ info }) {
  if (!info || !info.object) return null;

  const { x, y, object, layer } = info;
  const props = object.properties || object;

  return (
    <div
      className="gis-tooltip"
      style={{
        left: `${x + 15}px`,
        top: `${y + 15}px`
      }}
    >
      <div className="tooltip-header">
        <span className="tooltip-tag">{layer?.id || "GIS FEATURE"}</span>
        <h4>{props.name || props.sector || props.id || "Spatial Object"}</h4>
      </div>

      <div className="tooltip-body">
        {props.threat && (
          <div className="tooltip-alert">
            <span className="alert-badge">PRE-SYMPTOMATIC ALERT</span>
            <div className="alert-text">{props.threat}</div>
            <div className="alert-lead">Lead Time: <strong>{props.forecastLeadTime}</strong></div>
            <div className="alert-conf">AI Confidence: <strong>{props.confidenceScore}</strong></div>
          </div>
        )}

        {props.crop && (
          <div className="tooltip-row">
            <span className="lbl">Crop Variety:</span>
            <span className="val">{props.crop}</span>
          </div>
        )}

        {props.acreage && (
          <div className="tooltip-row">
            <span className="lbl">Acreage:</span>
            <span className="val">{props.acreage} Acres</span>
          </div>
        )}

        {props.chlorophyllIndex !== undefined && (
          <div className="tooltip-row">
            <span className="lbl">Chlorophyll Index:</span>
            <span className={`val ${props.chlorophyllIndex < 0.7 ? "val-warn" : "val-ok"}`}>
              {props.chlorophyllIndex}
            </span>
          </div>
        )}

        {props.chlorophyllVal !== undefined && (
          <div className="tooltip-row">
            <span className="lbl">Pixel Reflectance:</span>
            <span className={`val ${props.chlorophyllVal < 0.6 ? "val-warn" : "val-ok"}`}>
              {(props.chlorophyllVal * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {props.stressLevel !== undefined && (
          <div className="tooltip-row">
            <span className="lbl">Biochemical Stress:</span>
            <span className={`val ${props.stressLevel > 0.6 ? "val-danger" : "val-ok"}`}>
              {(props.stressLevel * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {props.soilMoisture && (
          <div className="tooltip-row">
            <span className="lbl">Soil Moisture:</span>
            <span className="val">{props.soilMoisture}</span>
          </div>
        )}

        {props.spectralReflectanceB705 !== undefined && (
          <div className="tooltip-row">
            <span className="lbl">Red-Edge (705nm):</span>
            <span className="val">{props.spectralReflectanceB705}</span>
          </div>
        )}
      </div>

      <div className="tooltip-footer">
        GPS: {info.coordinate ? `${info.coordinate[1].toFixed(4)}°N, ${Math.abs(info.coordinate[0]).toFixed(4)}°W` : "Salinas Valley"}
      </div>
    </div>
  );
}

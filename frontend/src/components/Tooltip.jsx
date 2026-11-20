export default function Tooltip({ info }) {
  if (!info || !info.object) return null;

  const { x, y, object, layer } = info;
  const props = object.properties || object;

  const isBlight = props.disease_risk >= 0.75 || props.status === "CRITICAL_BLIGHT";
  const isStressed = props.disease_risk >= 0.4 && props.disease_risk < 0.75;

  return (
    <div
      className="gis-tooltip"
      style={{
        left: `${x + 15}px`,
        top: `${y + 15}px`
      }}
    >
      <div className="tooltip-header">
        <span className="tooltip-tag">
          {props.cell_id ? `3D PIXEL ${props.cell_id}` : layer?.id || "GIS FEATURE"}
        </span>
        <h4>
          {props.cell_id
            ? `${props.sector || "Field Parcel"} (${props.crop || "Crop"})`
            : props.name || props.sector || props.id || "Spatial Object"}
        </h4>
      </div>

      <div className="tooltip-body">
        {/* Early Warning Alert */}
        {(props.threat || props.is_hotspot || isBlight) && (
          <div className="tooltip-alert">
            <span className="alert-badge">PRE-SYMPTOMATIC BLIGHT ALERT</span>
            <div className="alert-text">{props.threat || "Fungal Blight Outbreak Risk"}</div>
            <div className="alert-lead">Lead Time: <strong>21 Days Pre-Symptomatic</strong></div>
            <div className="alert-conf">AI Confidence: <strong>{((props.confidence || 0.948) * 100).toFixed(1)}%</strong></div>
          </div>
        )}

        {/* Disease Risk Score */}
        {props.disease_risk !== undefined && (
          <div className="tooltip-row">
            <span className="lbl">Disease Risk Score:</span>
            <span
              className={`val ${
                isBlight ? "val-danger" : isStressed ? "val-warn" : "val-ok"
              }`}
            >
              {(props.disease_risk * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {/* Crop Variety */}
        {props.crop && !props.cell_id && (
          <div className="tooltip-row">
            <span className="lbl">Crop Variety:</span>
            <span className="val">{props.crop}</span>
          </div>
        )}

        {/* Acreage */}
        {props.acreage && (
          <div className="tooltip-row">
            <span className="lbl">Acreage:</span>
            <span className="val">{props.acreage} Acres</span>
          </div>
        )}

        {/* Chlorophyll Index (CAI) */}
        {(props.chlorophyll_index !== undefined || props.chlorophyllIndex !== undefined) && (
          <div className="tooltip-row">
            <span className="lbl">Chlorophyll Index:</span>
            <span
              className={`val ${
                (props.chlorophyll_index ?? props.chlorophyllIndex) < 0.65
                  ? "val-warn"
                  : "val-ok"
              }`}
            >
              {(props.chlorophyll_index ?? props.chlorophyllIndex).toFixed(2)}
            </span>
          </div>
        )}

        {/* Red Edge Slope (705nm - 740nm) */}
        {props.red_edge_slope !== undefined && (
          <div className="tooltip-row">
            <span className="lbl">Red-Edge Slope:</span>
            <span
              className={`val ${
                props.red_edge_slope < 0.4 ? "val-danger" : "val-ok"
              }`}
            >
              {props.red_edge_slope.toFixed(2)}
            </span>
          </div>
        )}

        {/* Water Stress */}
        {props.water_stress_index !== undefined && (
          <div className="tooltip-row">
            <span className="lbl">SWIR Water Stress:</span>
            <span className="val">{props.water_stress_index.toFixed(2)}</span>
          </div>
        )}

        {/* Canopy Height */}
        {props.canopy_height_m !== undefined && (
          <div className="tooltip-row">
            <span className="lbl">Canopy Height:</span>
            <span className="val">{props.canopy_height_m}m</span>
          </div>
        )}

        {/* Soil Moisture */}
        {props.soilMoisture && (
          <div className="tooltip-row">
            <span className="lbl">Soil Moisture:</span>
            <span className="val">{props.soilMoisture}</span>
          </div>
        )}
      </div>

      <div className="tooltip-footer">
        {props.cell_id ? (
          <div className="click-hint">Click pixel to open full spectral curve HUD</div>
        ) : (
          <div>GPS: {info.coordinate ? `${info.coordinate[1].toFixed(4)}°N, ${Math.abs(info.coordinate[0]).toFixed(4)}°W` : "Salinas Valley"}</div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";

import FarmInformationPanel from "../components/Analytics/FarmInformationPanel";
import FarmMap from "../components/Map/FarmMap";
import { farmBoundary } from "../data/farmData";

import PredictionVisualization from "../components/App_Components/PredictionVisualization";
import DiseaseConfidenceHeatmap from "../components/Analytics/DiseaseConfidenceHeatmap";
import FarmMonitoringAnalytics from "../components/Analytics/FarmMonitoringAnalytics";

const TABS = [
  {
    id: "prediction",
    icon: "🧠",
    label: "Prediction",
    hint: "Stress classification map",
    Component: PredictionVisualization,
  },
  {
    id: "heatmap",
    icon: "🔥",
    label: "Confidence Heatmap",
    hint: "Pixel-level probability",
    Component: DiseaseConfidenceHeatmap,
  },
  {
    id: "analytics",
    icon: "📊",
    label: "Monitoring Analytics",
    hint: "Trends and field metrics",
    Component: FarmMonitoringAnalytics,
  },
];

function Card({ title, subtitle, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg shadow-black/30">
      <header className="border-b border-slate-800 px-6 py-4">
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function Dashboard() {
  const farm = farmBoundary.features[0];
  const [active, setActive] = useState(TABS[0].id);
  const { Component: ActiveComponent, label } = TABS.find((t) => t.id === active);

  const farmInfo = {
    name: farm.properties.name,
    cropType: farm.properties.crop,
    area: farm.properties.area,
    latitude: 13.282,
    longitude: 77.5225,
    status: "Monitoring Active",
    lastUpdated: "26 Nov 2026",
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
            TerraSpectra
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Farm Monitoring
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Hyperspectral crop health overview and disease forecasting
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
          Updated {farmInfo.lastUpdated}
        </span>
      </header>

      <FarmInformationPanel farm={farmInfo} />

      {/* Map */}
      <Card
        title="Farm Map"
        subtitle="Satellite-based geographical farm visualization"
      >
        <div className="h-[60vh] min-h-[360px] w-full">
          {/* <FarmMap /> */}
        </div>
      </Card>

      {/* Analytics tabs */}
      <div className="flex flex-col gap-4">
        <div
          role="tablist"
          aria-label="Analytics views"
          className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-2 sm:grid-cols-3"
        >
          {TABS.map(({ id, icon, label, hint }) => {
            const selected = active === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ${
                  selected
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/40"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {icon}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{label}</span>
                  <span
                    className={`block truncate text-xs ${
                      selected ? "text-green-100" : "text-slate-500"
                    }`}
                  >
                    {hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" aria-label={label}>
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
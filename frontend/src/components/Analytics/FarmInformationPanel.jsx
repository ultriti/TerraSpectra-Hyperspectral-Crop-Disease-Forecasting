const DEFAULT_FARM = {
  name: "TerraSpectra Demo Farm",
  cropType: "Not specified",
  area: "Not calculated",
  latitude: 13.28221,
  longitude: 77.52263,
  status: "Demo Monitoring",
  lastUpdated: "Awaiting data",
};

function Field({ icon, label, value, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/70 p-4 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span aria-hidden>{icon}</span>
        {label}
      </div>
      <p className="mt-1.5 truncate text-base font-semibold text-slate-100">
        {value}
      </p>
    </div>
  );
}

export default function FarmInformationPanel({ farm = DEFAULT_FARM }) {
  return (
    <section className="my-4 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg shadow-black/30">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-green-700 to-emerald-600 px-6 py-5 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur">
            🌾
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight">
              Farm Information
            </h3>
            <p className="text-sm text-green-50">
              Farm profile and monitoring details
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium backdrop-blur">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-300" />
          </span>
          {farm.status}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        <Field icon="🏡" label="Farm Name" value={farm.name} />
        <Field icon="🌱" label="Crop Type" value={farm.cropType} />
        <Field icon="📐" label="Farm Area" value={farm.area} />
        <Field icon="🧭" label="Latitude" value={farm.latitude} />
        <Field icon="🧭" label="Longitude" value={farm.longitude} />
        <Field icon="🕒" label="Last Monitored" value={farm.lastUpdated} />
      </div>
    </section>
  );
}

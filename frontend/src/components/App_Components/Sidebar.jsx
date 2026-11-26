import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Dashboard", icon: "🌾", end: true },
  { to: "/model-evaluation", label: "Model Evaluation", icon: "📈" },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-green-600 text-white shadow-lg shadow-green-900/40"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`;

export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[30vw] shrink-0 flex-col border-r border-slate-800 bg-slate-950">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 text-xl">
          🌱
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-white">
            TerraSpectra
          </p>
          <p className="text-xs text-slate-400">Crop disease forecasting</p>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </p>
        {LINKS.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <span className="text-lg" aria-hidden>
              {icon}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-5 py-4 text-xs text-slate-500">
        v1.2.0 · Demo dataset
      </div>
    </aside>
  );
}

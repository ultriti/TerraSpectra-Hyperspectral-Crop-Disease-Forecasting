import { useCallback, useEffect, useState } from "react";
import Sidebar from "../App_Components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const METRICS = [
  { key: "accuracy", label: "Accuracy", hint: "Correct classifications" },
  { key: "precision", label: "Precision", hint: "Correct stress calls" },
  { key: "recall", label: "Recall", hint: "Stress pixels found" },
  { key: "f1_score", label: "F1-score", hint: "Precision / recall balance" },
];

// Fixed colours per model; unknown models fall back to slate
const MODEL_STYLE = {
  "Random Forest": {
    bar: "bg-amber-400",
    dot: "bg-amber-400",
    text: "text-amber-300",
  },
  "3D-CNN": {
    bar: "bg-emerald-400",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
  },
};
const styleOf = (name) =>
  MODEL_STYLE[name] || {
    bar: "bg-sky-400",
    dot: "bg-sky-400",
    text: "text-sky-300",
  };

const pct = (v) => `${(Number(v) * 100).toFixed(2)}%`;
const clamp = (v) => Math.max(0, Math.min(100, Number(v) * 100));
const cell = (v) => (typeof v === "number" ? Number(v.toFixed(4)) : v);

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 shadow-lg shadow-black/30">
      <header className="border-b border-slate-800 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
        )}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 truncate text-lg font-semibold text-slate-100">
        {value}
      </p>
    </div>
  );
}

function MetricCard({ model, label, hint, value }) {
  const s = styleOf(model);
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
        {model} · {label}
      </div>
      <p className={`mt-3 text-3xl font-bold ${s.text}`}>{pct(value)}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${s.bar}`}
          style={{ width: `${clamp(value)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function PageShell({ children }) {
  return <div className="w-full flex flex-row">{children}</div>;
}

export default function ModelEvaluation() {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/evaluation`);
      if (!res.ok) throw new Error("Unable to load evaluation results.");
      setEvaluation(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PageShell>
        <div className="animate-pulse space-y-6">
          <div className="h-24 rounded-2xl bg-slate-900" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-900" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-900" />
        </div>
      </PageShell>
    );
  }

  if (error || !evaluation) {
    return (
      <PageShell>
        <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-8 text-center">
          <h2 className="text-xl font-semibold text-red-200">
            Evaluation data unavailable
          </h2>
          <p className="mt-2 text-sm text-red-300/80">{error}</p>
          <p className="mt-1 text-sm text-slate-400">
            Check that FastAPI is running and the evaluation CSV exists.
          </p>
          <button
            onClick={load}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
          >
            Retry
          </button>
        </div>
      </PageShell>
    );
  }

  const models = evaluation.models || [];
  const reliability = evaluation.reliability || [];

  // Best model per metric, used to highlight winners
  const best = Object.fromEntries(
    METRICS.map(({ key }) => [
      key,
      Math.max(...models.map((m) => Number(m[key]))),
    ]),
  );

  return (
    <PageShell>
      <div className="sideFrame">
        <Sidebar />
      </div>
      <div className="flex flex-col gap-6 p-5 w-full h-[100vh] overflow-y-auto">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
              TerraSpectra / Phase 04
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              Model Evaluation
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Performance analysis and validation of hyperspectral
              classification models.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-green-800 bg-green-950/60 px-3 py-1.5 text-sm font-medium text-green-300">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Evaluation completed
          </span>
        </header>

        {/* Dataset info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoTile label="Dataset" value={evaluation.dataset} />
          <InfoTile label="Test samples" value={evaluation.test_samples} />
          <InfoTile label="Models evaluated" value={models.length} />
        </div>

        {/* Overview cards */}
        <Section
          title="Performance overview"
          subtitle="Headline metrics per model"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {models.flatMap((m) =>
              METRICS.filter(
                ({ key }) => key === "accuracy" || key === "f1_score",
              ).map(({ key, label, hint }) => (
                <MetricCard
                  key={`${m.name}-${key}`}
                  model={m.name}
                  label={label}
                  hint={hint}
                  value={m[key]}
                />
              )),
            )}
          </div>
        </Section>

        {/* Comparison bars */}
        <Section
          title="Model comparison"
          subtitle={models.map((m) => m.name).join(" vs ")}
        >
          <div className="mb-5 flex flex-wrap gap-4 text-sm text-slate-300">
            {models.map((m) => (
              <span key={m.name} className="inline-flex items-center gap-2">
                <i className={`h-3 w-3 rounded-sm ${styleOf(m.name).dot}`} />
                {m.name}
              </span>
            ))}
          </div>

          <div className="space-y-6">
            {METRICS.map(({ key, label }) => (
              <div
                key={key}
                className="grid gap-2 md:grid-cols-[140px_1fr] md:items-center"
              >
                <p className="text-sm font-semibold text-slate-200">{label}</p>
                <div className="space-y-2">
                  {models.map((m) => (
                    <div key={m.name} className="flex items-center gap-3">
                      <span className="hidden w-28 shrink-0 truncate text-xs text-slate-400 sm:block">
                        {m.name}
                      </span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${styleOf(m.name).bar}`}
                          style={{ width: `${clamp(m[key])}%` }}
                        />
                      </div>
                      <strong className="w-20 shrink-0 text-right text-sm tabular-nums text-slate-100">
                        {pct(m[key])}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Detailed table */}
        <Section
          title="Detailed metrics"
          subtitle="Full performance comparison (best value highlighted)"
        >
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Model</th>
                  {METRICS.map(({ key, label }) => (
                    <th key={key} className="px-4 py-3">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {models.map((m) => (
                  <tr key={m.name} className="transition hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-medium text-slate-100">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${styleOf(m.name).dot}`}
                        />
                        {m.name}
                      </span>
                    </td>
                    {METRICS.map(({ key }) => (
                      <td
                        key={key}
                        className={`px-4 py-3 tabular-nums ${
                          Number(m[key]) === best[key]
                            ? "font-semibold text-green-400"
                            : "text-slate-300"
                        }`}
                      >
                        {pct(m[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Confusion matrices */}
        <Section
          title="Confusion matrices"
          subtitle="Actual versus predicted classifications"
        >
          <div className="flex justify-center rounded-xl border border-slate-800 bg-white p-3">
            <img
              src={`${API_URL}${evaluation.confusion_matrix_url}`}
              alt="Confusion matrices for the evaluated models"
              className="max-h-[480px] w-auto max-w-full object-contain"
            />
          </div>
        </Section>

        {/* Reliability */}
        <Section
          title="Prediction reliability"
          subtitle="Probability quality and class separation"
        >
          {reliability.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-left text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    {Object.keys(reliability[0]).map((k) => (
                      <th key={k} className="px-4 py-3">
                        {k.replaceAll("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reliability.map((row, i) => (
                    <tr key={i} className="transition hover:bg-slate-900/60">
                      {Object.values(row).map((v, j) => (
                        <td
                          key={j}
                          className="px-4 py-3 tabular-nums text-slate-300"
                        >
                          {cell(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
              Reliability metrics have not been saved to the backend yet.
            </div>
          )}
        </Section>

        {/* Disclaimer */}
        <footer className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5">
          <p className="text-sm font-semibold text-amber-300">
            ⚠ Evaluation limitation
          </p>
          <p className="mt-1 text-sm leading-relaxed text-amber-100/70">
            These results are based on a synthetic hyperspectral demo dataset
            and a spatial holdout test set. They do not establish real-world
            crop disease detection performance.
          </p>
        </footer>
      </div>
    </PageShell>
  );
}

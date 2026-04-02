'use client';

import { useState } from 'react';

const EXAMPLES = ['Alameda', 'Hood River', 'Maui', 'Brighton Beach VIC'];

function StatCard({ label, value, unit }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-cyan-300">
        {value}
        <span className="ml-1 text-base text-slate-400">{unit}</span>
      </p>
    </div>
  );
}

export default function Home() {
  const [location, setLocation] = useState('Alameda');
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const fetchForecast = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/forecast?location=${encodeURIComponent(location)}&days=${days}`,
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to fetch forecast.');
      }

      setData(json);
    } catch (err) {
      setData(null);
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const decisionColor = {
    Windsurf: 'text-emerald-300',
    Wingfoil: 'text-sky-300',
    'Stay Home': 'text-amber-300',
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 p-6 md:p-10">
      <header>
        <p className="text-sm uppercase tracking-widest text-cyan-400">Hoon or Home</p>
        <h1 className="mt-2 text-4xl font-bold text-white">Should I send it today?</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Enter your sailing location and compare wind, rain, and temperature to decide whether
          to windsurf, wingfoil, or stay dry at home.
        </p>
      </header>

      <form
        onSubmit={fetchForecast}
        className="grid gap-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-5 md:grid-cols-[2fr_1fr_auto]"
      >
        <label className="flex flex-col gap-2 text-sm text-slate-300">
          Sailing location
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Hood River"
            className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-400 placeholder:text-slate-500 focus:ring-2"
            required
          />
          <span className="text-xs text-slate-500">Try: {EXAMPLES.join(', ')}</span>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-300">
          Forecast window
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-400 focus:ring-2"
          >
            <option value={1}>Next 24h</option>
            <option value={2}>Next 48h</option>
            <option value={3}>Next 72h</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="h-11 self-end rounded-lg bg-cyan-500 px-5 font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Hoon check'}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-rose-700 bg-rose-950/40 p-4 text-rose-200">{error}</div>
      )}

      {data && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
            <p className="text-sm text-slate-400">Location</p>
            <p className="text-2xl font-semibold text-white">
              {data.location.name}, {data.location.admin1 ? `${data.location.admin1}, ` : ''}
              {data.location.country}
            </p>
            <p className={`mt-3 text-3xl font-bold ${decisionColor[data.recommendation.decision]}`}>
              {data.recommendation.decision}
            </p>
            <p className="mt-2 text-slate-300">{data.recommendation.reason}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Max wind" value={data.metrics.maxWindKmh} unit="km/h" />
            <StatCard label="Avg wind" value={data.metrics.avgWindKmh} unit="km/h" />
            <StatCard label="Max temp" value={data.metrics.maxTempC} unit="°C" />
            <StatCard label="Total rain" value={data.metrics.totalRainMm} unit="mm" />
          </div>
        </section>
      )}
    </main>
  );
}

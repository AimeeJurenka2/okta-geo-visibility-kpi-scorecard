type Trend = "up" | "down" | "flat";
type Brand = "okta" | "auth0";

const BRAND_LABEL: Record<Brand, string> = {
  okta: "Okta.com",
  auth0: "Auth0.com",
};

type KpiColumn = {
  key: string;
  label: string;
  source: string;
  unit?: "percent";
};

const kpiColumns: KpiColumn[] = [
  { key: "brandedClicks", label: "Branded Clicks", source: "GSC" },
  { key: "aiAssistantTraffic", label: "AI Traffic", source: "GA4" },
  { key: "hvvRate", label: "HVV Rate", source: "GA4", unit: "percent" },
  { key: "highValueVisits", label: "HVVs", source: "GA4" },
  { key: "formSubmissionRate", label: "HV to Submission Rate", source: "GA4", unit: "percent" },
  { key: "formSubmissions", label: "Submissions", source: "GA4" },
];

// Period-over-period trend/delta aren't tracked for every brand/KPI yet —
// KpiTrendTable renders a column without a delta/trend badge when absent.
const kpiTrend: Record<Brand, Record<string, Trend>> = {
  okta: {
    brandedClicks: "up",
    aiAssistantTraffic: "up",
    hvvRate: "down",
    highValueVisits: "down",
    formSubmissionRate: "up",
    formSubmissions: "up",
  },
  auth0: {
    brandedClicks: "up",
    aiAssistantTraffic: "down",
    hvvRate: "down",
    highValueVisits: "down",
    formSubmissionRate: "down",
    formSubmissions: "down",
  },
};

const kpiValue: Record<Brand, Record<string, number>> = {
  okta: {
    brandedClicks: 8190000,
    aiAssistantTraffic: 16000,
    hvvRate: 29,
    highValueVisits: 664000,
    formSubmissionRate: 3,
    formSubmissions: 21000,
  },
  auth0: {
    brandedClicks: 437000,
    aiAssistantTraffic: 26000,
    hvvRate: 32,
    highValueVisits: 314000,
    formSubmissionRate: 2,
    formSubmissions: 6300,
  },
};

// Period-over-period % change, sign matching kpiTrend.
const kpiDelta: Record<Brand, Record<string, number>> = {
  okta: {
    brandedClicks: 41,
    aiAssistantTraffic: 3,
    hvvRate: -1,
    highValueVisits: -15,
    formSubmissionRate: 20,
    formSubmissions: 1.5,
  },
  auth0: {
    brandedClicks: 15,
    aiAssistantTraffic: -23,
    hvvRate: -6,
    highValueVisits: -26,
    formSubmissionRate: -19,
    formSubmissions: -41,
  },
};

// Visibility is tracked per SEMrush project (segment), not just by domain.
type Segment = "okta-core" | "okta-osai" | "auth0-core" | "auth0-osai";

const SEGMENT_LABEL: Record<Segment, string> = {
  "okta-core": "Okta Workforce",
  "okta-osai": "Okta OSAI",
  "auth0-core": "Auth0 CIAM",
  "auth0-osai": "Auth0 OSAI",
};

const visibilityBaseline: Record<Segment, number> = {
  "okta-core": 50,
  "okta-osai": 15,
  "auth0-core": 32,
  "auth0-osai": 8,
};

const visibilityPercent: Record<Segment, number> = {
  "okta-core": 56,
  "okta-osai": 16,
  "auth0-core": 47,
  "auth0-osai": 8,
};

const visibilityQ3Goal: Record<Segment, number> = {
  "okta-core": 58,
  "okta-osai": 45,
  "auth0-core": 40,
  "auth0-osai": 15,
};

const visibilityQ4Goal: Record<Segment, number> = {
  "okta-core": 75,
  "okta-osai": 50,
  "auth0-core": 50,
  "auth0-osai": 25,
};

const SEGMENTS_BY_BRAND: Record<Brand, Segment[]> = {
  okta: ["okta-core", "okta-osai"],
  auth0: ["auth0-core", "auth0-osai"],
};

function formatCompactCount(value: number): string {
  if (value >= 1_000_000) {
    return `${Math.round((value / 1_000_000) * 100) / 100}M`;
  }
  return `${Math.round((value / 1000) * 10) / 10}k`;
}

function KpiTrendTable({ brand }: { brand: Brand }) {
  return (
    <table
      className="w-full border-collapse overflow-hidden rounded-md border border-gray-300 text-left dark:border-gray-700"
      aria-labelledby={`kpis-heading-${brand}`}
    >
      <thead>
        <tr className="bg-indigo-50 dark:bg-indigo-950/40">
          {kpiColumns.map((kpi) => (
            <th
              key={kpi.key}
              scope="col"
              className="border-b border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200"
            >
              {kpi.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {kpiColumns.map((kpi) => {
            const value = kpiValue[brand][kpi.key];
            const formattedValue = kpi.unit === "percent" ? `${value}%` : formatCompactCount(value);
            const delta = kpiDelta[brand][kpi.key];
            const trend = kpiTrend[brand][kpi.key];
            const arrow = trend === "up" ? "▲" : trend === "down" ? "▼" : "▬";
            return (
              <td key={kpi.key} className="px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formattedValue}</span>
                  {delta !== undefined && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${delta >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                    >
                      <span aria-hidden="true">{arrow}</span>
                      ({delta >= 0 ? "+" : ""}
                      {delta}%)
                    </span>
                  )}
                </div>
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  );
}

function VisibilityTrendTable({ brand }: { brand: Brand }) {
  const segments = SEGMENTS_BY_BRAND[brand];
  return (
    <table
      className="w-full border-collapse overflow-hidden rounded-md border border-gray-300 text-left dark:border-gray-700"
      aria-labelledby={`visibility-heading-${brand}`}
    >
      <thead>
        <tr className="bg-indigo-50 dark:bg-indigo-950/40">
          <th
            scope="col"
            className="border-b border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            Project
          </th>
          <th
            scope="col"
            className="border-b border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            Baseline
          </th>
          <th
            scope="col"
            className="border-b border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            Current
          </th>
          <th
            scope="col"
            className="border-b border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            Q3 Goal
          </th>
          <th
            scope="col"
            className="border-b border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            Q4 Goal
          </th>
        </tr>
      </thead>
      <tbody>
        {segments.map((segment) => (
          <tr key={segment} className="border-b border-gray-200 last:border-0 dark:border-gray-800">
            <th
              scope="row"
              className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900 dark:text-gray-100"
            >
              {SEGMENT_LABEL[segment]}
            </th>
            <td className="px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              {visibilityBaseline[segment]}%
            </td>
            <td className="px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              {visibilityPercent[segment]}%
            </td>
            <td className="px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              {visibilityQ3Goal[segment]}%
            </td>
            <td className="px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              {visibilityQ4Goal[segment]}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Page() {
  return (
    <div className="bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 py-3">
        <header className="mb-2 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">GEO Scorecard</h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Last updated{" "}
            {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <div className="mx-auto mt-1.5 h-1 w-24 rounded-full bg-gradient-to-r from-blue-700 from-0% via-purple-600 via-75% to-orange-500 to-100%" />
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-400">{BRAND_LABEL.okta}</h3>
            <div>
              <h2
                id="visibility-heading-okta"
                className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400"
              >
                Visibility
              </h2>
              <VisibilityTrendTable brand="okta" />
            </div>
            <div>
              <h2
                id="kpis-heading-okta"
                className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400"
              >
                KPIs{" "}
                <span className="font-normal normal-case text-gray-500 dark:text-gray-400">
                  (Last 90 Days vs. Prior 90 Days)
                </span>
              </h2>
              <KpiTrendTable brand="okta" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-400">{BRAND_LABEL.auth0}</h3>
            <div>
              <h2
                id="visibility-heading-auth0"
                className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-400"
              >
                Visibility
              </h2>
              <VisibilityTrendTable brand="auth0" />
            </div>
            <div>
              <h2
                id="kpis-heading-auth0"
                className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-400"
              >
                KPIs{" "}
                <span className="font-normal normal-case text-gray-500 dark:text-gray-400">
                  (Last 90 Days vs. Prior 90 Days)
                </span>
              </h2>
              <KpiTrendTable brand="auth0" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

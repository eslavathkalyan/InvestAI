import { useState } from "react";
import { Building2, LineChart, TrendingUp, ShieldAlert } from "lucide-react";

const TABS = [
  { key: "company", label: "Company", icon: Building2 },
  { key: "financial", label: "Financial", icon: LineChart },
  { key: "market", label: "Market", icon: TrendingUp },
  { key: "risk", label: "Risk", icon: ShieldAlert },
];

const RISK_STYLES = {
  HIGH: "bg-caution/10 text-caution",
  MEDIUM: "bg-gold/10 text-gold",
  LOW: "bg-positive/10 text-positive",
};

// analysis matches the ResearchReport.analysis shape exactly:
// { companyOverview, financial, market, risk } - straight from the
// four research agents, no reshaping in between.
const ReasoningPanel = ({ analysis }) => {
  const [active, setActive] = useState("company");

  return (
    <div className="bg-paper rounded-2xl shadow-card border border-ink/5 overflow-hidden">
      <div className="flex border-b border-ink/5 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
              active === key ? "text-navy border-b-2 border-gold" : "text-ink/50 hover:text-ink"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-5 text-sm">
        {active === "company" && (
          <div className="space-y-3">
            <p className="text-ink/80">{analysis.companyOverview?.overview}</p>
            <div>
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">
                Products
              </p>
              <p className="text-ink/70">{analysis.companyOverview?.products?.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">
                Business model
              </p>
              <p className="text-ink/70">{analysis.companyOverview?.businessModel}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">
                Competitors
              </p>
              <p className="text-ink/70">{analysis.companyOverview?.competitors?.join(", ")}</p>
            </div>
          </div>
        )}

        {active === "financial" && (
          <div className="space-y-3">
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full font-mono ${
                analysis.financial?.dataSource === "alpha_vantage"
                  ? "bg-positive/10 text-positive"
                  : "bg-ink/10 text-ink/60"
              }`}
            >
              {analysis.financial?.dataSource === "alpha_vantage"
                ? "Real market data"
                : "AI estimate"}
            </span>
            <p className="text-ink/80">{analysis.financial?.revenueSummary}</p>
            <p className="text-ink/80">{analysis.financial?.profitability}</p>
            <p className="text-ink/80">{analysis.financial?.growth}</p>
            <p className="text-ink/80">{analysis.financial?.valuation}</p>
            <div className="flex gap-6 pt-1 font-mono text-xs text-ink/60">
              {analysis.financial?.peRatio != null && <span>P/E: {analysis.financial.peRatio}</span>}
              {analysis.financial?.marketCap && <span>Market cap: {analysis.financial.marketCap}</span>}
            </div>
          </div>
        )}

        {active === "market" && (
          <div className="space-y-3">
            <p className="text-ink/80">
              <span className="text-ink/50">Industry: </span>
              {analysis.market?.industry}
            </p>
            <div>
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">
                Trends
              </p>
              <ul className="space-y-1">
                {analysis.market?.trends?.map((t, i) => (
                  <li key={i} className="text-ink/70">
                    • {t}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-ink/80">{analysis.market?.competitivePosition}</p>
          </div>
        )}

        {active === "risk" && (
          <div className="space-y-3">
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full font-mono ${
                RISK_STYLES[analysis.risk?.overallRiskLevel] || RISK_STYLES.MEDIUM
              }`}
            >
              {analysis.risk?.overallRiskLevel} RISK
            </span>
            <div>
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">
                Weaknesses
              </p>
              <ul className="space-y-1">
                {analysis.risk?.weaknesses?.map((w, i) => (
                  <li key={i} className="text-ink/70">
                    • {w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-1.5">
                Threats
              </p>
              <ul className="space-y-1">
                {analysis.risk?.threats?.map((t, i) => (
                  <li key={i} className="text-ink/70">
                    • {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReasoningPanel;

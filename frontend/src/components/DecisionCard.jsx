import { TrendingUp, TrendingDown } from "lucide-react";

const DecisionCard = ({ report }) => {
  const isInvest = report.decision === "INVEST";

  return (
    <div className="bg-paper rounded-2xl shadow-card p-6 border border-ink/5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-ink/40 uppercase tracking-wide font-mono">Company</p>
          <p className="font-display font-semibold text-ink text-xl">{report.company}</p>
        </div>
        <span
          className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full ${
            isInvest ? "bg-positive/10 text-positive" : "bg-caution/10 text-caution"
          }`}
        >
          {isInvest ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {report.decision}
        </span>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-ink/40 mb-1.5">
          <span>Confidence</span>
          <span className="font-mono">{report.confidence}%</span>
        </div>
        <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
          <div
            className={`h-full rounded-full ${isInvest ? "bg-positive" : "bg-caution"}`}
            style={{ width: `${report.confidence}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-ink/70 leading-relaxed mb-5">{report.summary}</p>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-2">
            Why invest
          </p>
          <ul className="space-y-1.5">
            {report.positiveFactors.map((factor, i) => (
              <li key={i} className="text-sm text-ink/80 flex gap-1.5">
                <span className="text-positive shrink-0">✓</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-2">Risks</p>
          <ul className="space-y-1.5">
            {report.risks.map((risk, i) => (
              <li key={i} className="text-sm text-ink/80 flex gap-1.5">
                <span className="text-caution shrink-0">⚠</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DecisionCard;

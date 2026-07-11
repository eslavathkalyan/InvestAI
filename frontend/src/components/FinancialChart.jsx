import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const RISK_TO_SCORE = { LOW: 25, MEDIUM: 60, HIGH: 90 };

const FinancialChart = ({ financial, risk, confidence }) => {
  const data = [
    { name: "Growth", value: financial?.growthScore ?? 0, color: "var(--color-navy)" },
    { name: "Risk", value: RISK_TO_SCORE[risk?.overallRiskLevel] ?? 50, color: "var(--color-caution)" },
    { name: "Confidence", value: confidence ?? 0, color: "var(--color-gold)" },
  ];

  return (
    <div className="bg-paper rounded-2xl shadow-card border border-ink/5 p-5">
      <p className="text-sm font-semibold text-ink mb-1">Score overview</p>
      <p className="text-xs text-ink/40 mb-5 leading-relaxed">
        Growth and risk are the AI&apos;s own numeric self-assessment; confidence is the decision
        agent&apos;s certainty in its call.
      </p>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-md">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-ink)" strokeOpacity={0.06} vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: "var(--color-ink)", fillOpacity: 0.6, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 500 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: "var(--color-ink)", fillOpacity: 0.4, fontFamily: "Plus Jakarta Sans, sans-serif" }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: 12, 
                  border: "1px solid rgba(0,0,0,0.06)", 
                  fontSize: 12,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  backgroundColor: "var(--color-paper)",
                  color: "var(--color-ink)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.05)"
                }}
                formatter={(value) => [`${value}`, "Score"]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;

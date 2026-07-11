import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, CheckCircle, Lightbulb, Compass, Zap } from "lucide-react";
import { getMarketInsights } from "../api/insights";

const MarketInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    try {
      const res = await getMarketInsights();
      setInsights(res.data);
    } catch {
      setError("Failed to fetch market insights. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getSentimentStyles = (sentiment) => {
    switch (sentiment) {
      case "BULLISH":
        return {
          bg: "bg-positive/10 text-positive border-positive/20",
          dot: "bg-positive",
          icon: <TrendingUp className="w-5 h-5" />,
          label: "Bullish Sentiment",
        };
      case "BEARISH":
        return {
          bg: "bg-caution/10 text-caution border-caution/20",
          dot: "bg-caution",
          icon: <TrendingDown className="w-5 h-5" />,
          label: "Bearish Sentiment",
        };
      default:
        return {
          bg: "bg-ink/10 text-ink/70 border-ink/15",
          dot: "bg-ink/40",
          icon: <Compass className="w-5 h-5" />,
          label: "Neutral Sentiment",
        };
    }
  };

  const getSectorStyles = (perf) => {
    switch (perf) {
      case "OUTPERFORMING":
        return "bg-positive/10 text-positive border border-positive/15";
      case "UNDERPERFORMING":
        return "bg-caution/10 text-caution border border-caution/15";
      default:
        return "bg-cream text-ink/60 border border-ink/5";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Market Insights</h1>
          <p className="text-ink/50 text-sm mt-1">AI-generated market pulse and sector analysis</p>
        </div>

        <button
          onClick={() => fetchInsights(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ink/10 bg-paper hover:bg-cream text-sm font-medium text-ink transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && <p className="text-ink/40 text-sm">Analyzing current market trends...</p>}
      {error && <p className="text-caution text-sm mb-6">{error}</p>}

      {!loading && insights && (
        <div className="space-y-6">
          {}
          <div className="grid gap-6 md:grid-cols-3">
            {}
            <div className="bg-paper border border-ink/5 rounded-2xl p-6 shadow-card flex flex-col justify-between">
              <div>
                <span className="text-xxs font-bold uppercase tracking-wider text-ink/40">Market Pulse</span>
                <div className={`mt-3 flex items-center gap-2.5 px-3 py-2 rounded-xl border w-fit ${getSentimentStyles(insights.sentiment).bg}`}>
                  {getSentimentStyles(insights.sentiment).icon}
                  <span className="text-sm font-semibold">{getSentimentStyles(insights.sentiment).label}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center relative">
                <span className="font-display text-5xl font-extrabold text-navy">{insights.sentimentScore}</span>
                <span className="text-[10px] font-bold text-ink/35 mt-1 uppercase tracking-wider">Sentiment Score</span>
                {}
                <div className="w-full bg-cream h-2.5 rounded-full overflow-hidden mt-5">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      insights.sentiment === "BULLISH"
                        ? "bg-positive"
                        : insights.sentiment === "BEARISH"
                        ? "bg-caution"
                        : "bg-gold"
                    }`}
                    style={{ width: `${insights.sentimentScore}%` }}
                  />
                </div>
              </div>
            </div>

            {}
            <div className="md:col-span-2 bg-paper border border-ink/5 rounded-2xl p-6 shadow-card flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-ink flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gold" />
                  Executive Analysis
                </h3>
                <p className="text-sm text-ink/75 leading-relaxed mt-4">{insights.summary}</p>
              </div>
              <div className="border-t border-ink/5 pt-4 mt-6">
                <span className="text-xxs font-bold uppercase tracking-wider text-ink/40">Trending Keywords</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {insights.trendingKeywords?.map((kw) => (
                    <span key={kw} className="text-xxs font-medium bg-cream text-navy/80 rounded-full px-2.5 py-1">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="grid gap-6 md:grid-cols-2">
            {}
            <div className="bg-paper border border-ink/5 rounded-2xl p-6 shadow-card">
              <h4 className="font-display font-semibold text-positive flex items-center gap-1.5 mb-4">
                <CheckCircle className="w-4.5 h-4.5" />
                Key Bullish Drivers
              </h4>
              <ul className="space-y-3">
                {insights.bullishFactors?.map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-sm text-ink/70">
                    <span className="w-1.5 h-1.5 bg-positive rounded-full mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {}
            <div className="bg-paper border border-ink/5 rounded-2xl p-6 shadow-card">
              <h4 className="font-display font-semibold text-caution flex items-center gap-1.5 mb-4">
                <AlertCircle className="w-4.5 h-4.5" />
                Key Risk Factors
              </h4>
              <ul className="space-y-3">
                {insights.bearishFactors?.map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 text-sm text-ink/70">
                    <span className="w-1.5 h-1.5 bg-caution rounded-full mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {}
          <div className="bg-paper border border-ink/5 rounded-2xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-ink/5">
              <h3 className="font-display font-semibold text-ink flex items-center gap-2">
                <Lightbulb className="w-4.5 h-4.5 text-gold" />
                Sector Performance & Outlook
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream/40 border-b border-ink/5 text-xxs font-bold uppercase tracking-wider text-ink/40">
                    <th className="px-6 py-4">Sector</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Sentiment</th>
                    <th className="px-6 py-4">Key Drivers / Drivers Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 text-sm text-ink/80">
                  {insights.sectors?.map((sec) => (
                    <tr key={sec.name} className="hover:bg-cream/25 transition">
                      <td className="px-6 py-4.5 font-semibold text-ink">{sec.name}</td>
                      <td className="px-6 py-4.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSectorStyles(sec.performance)}`}>
                          {sec.performance}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          sec.sentiment === "BULLISH"
                            ? "text-positive"
                            : sec.sentiment === "BEARISH"
                            ? "text-caution"
                            : "text-ink/50"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            sec.sentiment === "BULLISH"
                              ? "bg-positive"
                              : sec.sentiment === "BEARISH"
                              ? "bg-caution"
                              : "bg-ink/30"
                          }`} />
                          {sec.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-xs text-ink/60 leading-relaxed max-w-sm">{sec.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketInsights;

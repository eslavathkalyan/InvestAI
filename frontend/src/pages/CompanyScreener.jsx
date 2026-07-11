import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ArrowUpRight, TrendingUp, TrendingDown, Eye, Sliders } from "lucide-react";
import { getScreenerCompanies } from "../api/screener";

const CompanyScreener = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [maxPE, setMaxPE] = useState(100);
  const [minMarketCap, setMinMarketCap] = useState(0);
  const [onlyDividends, setOnlyDividends] = useState(false);

  useEffect(() => {
    getScreenerCompanies()
      .then((res) => setCompanies(res.data))
      .catch(() => setError("Failed to fetch screener listings."))
      .finally(() => setLoading(false));
  }, []);

  const filteredCompanies = companies.filter((item) => {
    const matchSearch =
      item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ticker.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSector = selectedSector === "All" || item.sector === selectedSector;
    const matchPE = item.peRatio <= maxPE;
    const matchMarketCap = item.marketCap >= minMarketCap;
    const matchDividends = !onlyDividends || item.dividendYield > 0;

    return matchSearch && matchSector && matchPE && matchMarketCap && matchDividends;
  });

  const getSectors = () => {
    const sectors = new Set(companies.map((x) => x.sector));
    return ["All", ...Array.from(sectors)];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Company Screener</h1>
        <p className="text-ink/50 text-sm mt-1">Filter, screen and launch AI research on leading global companies</p>
      </div>

      {loading && <p className="text-ink/40 text-sm">Loading screener details...</p>}
      {error && <p className="text-caution text-sm mb-6">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-col lg:flex-row gap-6">
          {}
          <aside className="w-full lg:w-72 shrink-0 bg-paper border border-ink/5 rounded-2xl p-6 shadow-card h-fit space-y-6">
            <h3 className="font-display font-semibold text-ink flex items-center gap-2 border-b border-ink/5 pb-3">
              <Filter className="w-4.5 h-4.5 text-gold" />
              Screener Filters
            </h3>

            {}
            <div>
              <label className="block text-xs font-semibold text-ink/70 mb-2">Search Stock</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                <input
                  type="text"
                  placeholder="e.g. Apple or TSLA"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-cream/40 border border-ink/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </div>

            {}
            <div>
              <label className="block text-xs font-semibold text-ink/70 mb-1.5">Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full bg-cream/40 border border-ink/10 rounded-xl px-3.5 py-2 text-sm text-ink/80 focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                {getSectors().map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {}
            <div>
              <div className="flex justify-between text-xs font-semibold text-ink/70 mb-1">
                <span>Maximum P/E Ratio</span>
                <span className="font-mono text-gold-dark font-bold">{maxPE}x</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={maxPE}
                onChange={(e) => setMaxPE(Number(e.target.value))}
                className="w-full accent-gold bg-cream"
              />
            </div>

            {}
            <div>
              <div className="flex justify-between text-xs font-semibold text-ink/70 mb-1">
                <span>Min Market Cap</span>
                <span className="font-mono text-gold-dark font-bold">${minMarketCap}B</span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={minMarketCap}
                onChange={(e) => setMinMarketCap(Number(e.target.value))}
                className="w-full accent-gold bg-cream"
              />
            </div>

            {}
            <div className="flex items-center gap-2 pt-2 border-t border-ink/5">
              <input
                type="checkbox"
                id="onlyDividends"
                checked={onlyDividends}
                onChange={(e) => setOnlyDividends(e.target.checked)}
                className="rounded border-ink/10 text-gold focus:ring-gold/30"
              />
              <label htmlFor="onlyDividends" className="text-xs font-medium text-ink/70 cursor-pointer">
                Only show dividend paying
              </label>
            </div>
          </aside>

          {}
          <main className="flex-1 bg-paper border border-ink/5 rounded-2xl shadow-card overflow-hidden">
            {filteredCompanies.length === 0 ? (
              <div className="p-12 text-center text-ink/40">
                No companies match the current filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream/40 border-b border-ink/5 text-xxs font-bold uppercase tracking-wider text-ink/40">
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Sector</th>
                      <th className="px-6 py-4">Market Cap</th>
                      <th className="px-6 py-4">P/E Ratio</th>
                      <th className="px-6 py-4">Div Yield</th>
                      <th className="px-6 py-4">24h Change</th>
                      <th className="px-6 py-4">AI Rating</th>
                      <th className="px-6 py-4 text-right">Research</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5 text-sm text-ink/80">
                    {filteredCompanies.map((item) => (
                      <tr key={item.ticker} className="hover:bg-cream/25 transition">
                        <td className="px-6 py-4.5">
                          <div className="font-semibold text-ink">{item.company}</div>
                          <div className="text-xs text-ink/40 font-mono">{item.ticker}</div>
                        </td>
                        <td className="px-6 py-4.5 text-xs text-ink/65">{item.sector}</td>
                        <td className="px-6 py-4.5 font-mono text-xs font-medium">
                          ${(item.marketCap >= 1000 ? `${(item.marketCap / 1000).toFixed(1)}T` : `${item.marketCap}B`)}
                        </td>
                        <td className="px-6 py-4.5 font-mono text-xs">{item.peRatio}x</td>
                        <td className="px-6 py-4.5 font-mono text-xs">{item.dividendYield}%</td>
                        <td className={`px-6 py-4.5 font-mono text-xs font-semibold ${
                          item.dayChange >= 0 ? "text-positive" : "text-caution"
                        }`}>
                          {item.dayChange >= 0 ? "+" : ""}
                          {item.dayChange}%
                        </td>
                        <td className="px-6 py-4.5">
                          {item.latestReport ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.latestReport.decision === "INVEST"
                                  ? "bg-positive/10 text-positive"
                                  : "bg-caution/10 text-caution"
                              }`}
                            >
                              {item.latestReport.decision} ({item.latestReport.confidence}%)
                            </span>
                          ) : (
                            <span className="text-xxs text-ink/30 italic">No rating</span>
                          )}
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          {item.latestReport ? (
                            <Link
                              to={`/research?reportId=${item.latestReport._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-ink/10 hover:bg-cream/50 text-xs font-semibold text-navy transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Report
                            </Link>
                          ) : (
                            <Link
                              to={`/research?company=${item.company}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-xs font-semibold text-gold-dark transition"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Research
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default CompanyScreener;

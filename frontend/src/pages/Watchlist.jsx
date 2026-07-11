import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Search, ArrowUpRight, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../api/user";
import { getMyReports } from "../api/research";
import { useAuth } from "../context/AuthContext";
import { addNotification } from "../utils/notifications";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [reports, setReports] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([getWatchlist(), getMyReports()])
      .then(([watchlistRes, reportsRes]) => {
        setWatchlist(watchlistRes.data);
        setReports(reportsRes.data);
      })
      .catch(() => setError("Couldn't load your watchlist data. Try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const companyName = inputValue.trim();
    try {
      const res = await addToWatchlist(companyName);
      setWatchlist(res.data);
      addNotification(user?.email, "Watchlist", "Watchlist Updated ⭐", `Added ${companyName} to your watchlist.`);
      setInputValue("");
    } catch {
      setError("Failed to add company to watchlist.");
    }
  };

  const handleRemove = async (company) => {
    try {
      const res = await removeFromWatchlist(company);
      setWatchlist(res.data);
      addNotification(user?.email, "Watchlist", "Watchlist Updated 🗑️", `Removed ${company} from your watchlist.`);
    } catch {
      setError("Failed to remove company from watchlist.");
    }
  };

  const getReportForCompany = (companyName) => {
    return reports.find(
      (r) => r.company.toLowerCase() === companyName.toLowerCase()
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Watchlist</h1>
          <p className="text-ink/50 text-sm mt-1">Monitor stocks and their corresponding AI ratings</p>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. NVIDIA or NVDA"
              className="w-full bg-paper border border-ink/15 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-white text-sm font-medium hover:bg-navy/90 transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
        </form>
      </div>

      {loading && <p className="text-ink/40 text-sm">Loading...</p>}
      {error && <p className="text-caution text-sm mb-4">{error}</p>}

      {!loading && !error && watchlist.length === 0 && (
        <div className="bg-paper rounded-2xl shadow-card p-12 text-center border border-ink/5">
          <p className="text-ink/50 mb-4">Your watchlist is currently empty.</p>
          <p className="text-xs text-ink/45">Add a company above to keep track of its metrics and AI research status.</p>
        </div>
      )}

      {!loading && !error && watchlist.length > 0 && (
        <div className="bg-paper border border-ink/5 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/40 border-b border-ink/5 text-xxs font-bold uppercase tracking-wider text-ink/40">
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">AI Sentiment</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Last Analyzed</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 text-sm text-ink/80">
                {watchlist.map((companyName) => {
                  const matchedReport = getReportForCompany(companyName);

                  return (
                    <tr key={companyName} className="hover:bg-cream/25 transition">
                      <td className="px-6 py-4.5 font-medium text-ink">{companyName}</td>
                      <td className="px-6 py-4.5">
                        {matchedReport ? (
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              matchedReport.decision === "INVEST"
                                ? "bg-positive/10 text-positive"
                                : "bg-caution/10 text-caution"
                            }`}
                          >
                            {matchedReport.decision === "INVEST" ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {matchedReport.decision}
                          </span>
                        ) : (
                          <span className="text-xs text-ink/30 italic">Not Researched</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 font-mono text-xs">
                        {matchedReport ? `${matchedReport.confidence}%` : "—"}
                      </td>
                      <td className="px-6 py-4.5 text-xs text-ink/40">
                        {matchedReport
                          ? new Date(matchedReport.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {matchedReport ? (
                            <Link
                              to={`/research?reportId=${matchedReport._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-ink/10 hover:bg-cream/50 text-xs font-medium text-navy transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Report
                            </Link>
                          ) : (
                            <Link
                              to={`/research?company=${companyName}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-xs font-medium text-gold-dark transition"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Run AI
                            </Link>
                          )}
                          <button
                            onClick={() => handleRemove(companyName)}
                            className="p-1.5 rounded-lg hover:bg-caution/10 text-ink/40 hover:text-caution transition"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;

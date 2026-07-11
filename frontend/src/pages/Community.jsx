import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, TrendingUp, TrendingDown, Eye, Calendar, User } from "lucide-react";
import { getSharedReports } from "../api/research";

const Community = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSharedReports()
      .then((res) => setReports(res.data))
      .catch(() => setError("Failed to fetch community reports."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink flex items-center gap-2">
            <Users className="w-6 h-6 text-gold" />
            Community Insights
          </h1>
          <p className="text-ink/50 text-sm mt-1">Explore shared research reports from other investment analysts</p>
        </div>
      </div>

      {loading && <p className="text-ink/40 text-sm">Loading community feed...</p>}
      {error && <p className="text-caution text-sm mb-6">{error}</p>}

      {!loading && !error && reports.length === 0 && (
        <div className="bg-paper border border-ink/5 rounded-2xl shadow-card p-12 text-center">
          <p className="text-ink/50">No shared reports in the feed yet.</p>
          <p className="text-xs text-ink/40 mt-1">Be the first to share one of your completed AI research reports!</p>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {reports.map((report) => (
            <div key={report._id} className="bg-paper border border-ink/5 rounded-2xl p-6 shadow-card flex flex-col justify-between hover:border-gold/30 hover:shadow-hover transition">
              <div>
                {}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-ink">{report.company}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-ink/40 mt-0.5">
                      <User className="w-3 h-3" />
                      <span>By {report.userId?.name || "Anonymous"}</span>
                    </div>
                  </div>

                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      report.decision === "INVEST"
                        ? "bg-positive/10 text-positive"
                        : "bg-caution/10 text-caution"
                    }`}
                  >
                    {report.decision === "INVEST" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {report.decision}
                  </span>
                </div>

                {}
                <p className="text-sm text-ink/75 leading-relaxed line-clamp-3 mb-6">{report.summary}</p>
              </div>

              {}
              <div className="border-t border-ink/5 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-medium text-ink/45">
                  <span className="font-mono">{report.confidence}% confidence</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Link
                  to={`/research?reportId=${report._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition shadow-card"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Report
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;

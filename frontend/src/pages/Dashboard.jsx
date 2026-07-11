import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { getMyReports } from "../api/research";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    getMyReports()
      .then((res) => setReports(res.data))
      .catch(() => setError("Couldn't load your reports. Try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-ink/50 text-sm mt-1">Your research history</p>
        </div>
        <Link
          to="/research"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 transition"
        >
          <Plus className="w-4 h-4" />
          New research
        </Link>
      </div>

      {loading && <p className="text-ink/40 text-sm">Loading...</p>}
      {error && <p className="text-caution text-sm">{error}</p>}

      {!loading && !error && reports.length === 0 && (
        <div className="bg-paper rounded-2xl shadow-card p-10 text-center">
          <p className="text-ink/60 mb-4">You haven&apos;t researched any companies yet.</p>
          <Link
            to="/research"
            className="inline-block px-5 py-2.5 rounded-lg bg-navy text-white font-medium hover:bg-navy/90 transition"
          >
            Research your first company
          </Link>
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {reports.map((report) => (
            <Link
              key={report._id}
              to={`/research?reportId=${report._id}`}
              className="block bg-paper border border-ink/5 hover:border-gold/30 hover:shadow-hover rounded-2xl p-5 transition text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-semibold text-ink">{report.company}</h3>
                <span
                  className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    report.decision === "INVEST"
                      ? "bg-positive/10 text-positive"
                      : "bg-caution/10 text-caution"
                  }`}
                >
                  {report.decision === "INVEST" ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {report.decision}
                </span>
              </div>
              <p className="text-xs text-ink/60 line-clamp-2 mb-4 leading-relaxed">{report.summary}</p>
              <div className="flex items-center justify-between text-[10px] font-medium text-ink/40">
                <span className="font-mono">{report.confidence}% confidence</span>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

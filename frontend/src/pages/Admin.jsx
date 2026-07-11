import { useEffect, useState } from "react";
import { Users, Clock, ShieldCheck, Trash2 } from "lucide-react";
import * as adminApi from "../api/admin";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ icon: Icon, label, value, colorClass = "text-ink/50" }) => (
  <div className="bg-paper rounded-2xl shadow-card border border-ink/5 p-5">
    <div className="flex items-center gap-2 text-ink/50 mb-2">
      <Icon className={`w-4 h-4 ${colorClass}`} />
      <span className="text-xs uppercase tracking-wide font-medium">{label}</span>
    </div>
    <p className="font-mono text-2xl font-semibold text-ink">{value}</p>
  </div>
);

const StatusBadge = ({ user }) => {
  if (user.isBlocked) {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-caution/20 text-caution font-semibold border border-caution/30">Blocked</span>
    );
  }
  if (!user.isApproved) {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-caution/10 text-caution font-semibold">Pending</span>
    );
  }
  return (
    <span className="text-xs px-2.5 py-1 rounded-full bg-positive/10 text-positive font-semibold">Approved</span>
  );
};

const Admin = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [inspectPortfolio, setInspectPortfolio] = useState([]);
  const [inspectReports, setInspectReports] = useState([]);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectError, setInspectError] = useState("");

  const loadData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAnalytics(),
      ]);
      setUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setLoadError("Couldn't load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAction = async (actionFn, userId) => {
    setActionError("");
    try {
      await actionFn(userId);
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.message || "That action failed.");
    }
  };

  const handleInspectUser = async (user) => {
    setSelectedUser(user);
    setInspectLoading(true);
    setInspectError("");
    setInspectPortfolio([]);
    setInspectReports([]);
    try {
      const [portfolioRes, reportsRes] = await Promise.all([
        adminApi.getUserPortfolio(user._id),
        adminApi.getUserReports(user._id),
      ]);
      setInspectPortfolio(portfolioRes.data);
      setInspectReports(reportsRes.data);
    } catch (err) {
      setInspectError("Failed to load user inspection data.");
    } finally {
      setInspectLoading(false);
    }
  };

  if (loading) return <p className="text-center text-ink/40 text-sm py-16">Loading...</p>;
  if (loadError) return <p className="text-center text-caution text-sm py-16">{loadError}</p>;

  const pendingCount = users.filter((u) => !u.isApproved).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Admin Panel</h1>
          <p className="text-xs text-ink/40 mt-1">Manage waitlist approvals and system access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard icon={Users} label="Total registered users" value={users.length} colorClass="text-signal" />
        <StatCard icon={Clock} label="Pending approvals" value={pendingCount} colorClass="text-caution" />
      </div>

      {actionError && (
        <div className="mb-4 text-sm text-caution bg-caution/10 border border-caution/20 rounded-xl px-4 py-3">
          {actionError}
        </div>
      )}

      <div className="bg-paper rounded-2xl shadow-card border border-ink/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-ink/5 bg-paper/50">
          <h2 className="font-semibold text-sm text-ink">User Registrations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-ink/5 text-xs text-ink/40 uppercase tracking-wider bg-paper/20">
                <th className="px-5 py-3.5 font-semibold">User details</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Access control</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === currentUser?.id;
                return (
                  <tr key={u._id} className="border-b border-ink/5 last:border-0 hover:bg-paper/20 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ink">
                        {u.name}
                        {isSelf && <span className="text-[10px] uppercase font-bold tracking-wider text-navy bg-navy/5 px-1.5 py-0.5 rounded ml-2">You</span>}
                      </div>
                      <div className="text-xs text-ink/40 mt-0.5 font-mono">{u.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge user={u} />
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        {u.isApproved && (
                          <button
                            onClick={() => handleInspectUser(u)}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-ink/10 text-ink/75 hover:bg-ink/5 transition cursor-pointer"
                          >
                            Inspect User
                          </button>
                        )}
                        {!u.isApproved && (
                          <button
                            onClick={() => runAction(adminApi.approveUser, u._id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-navy/95 transition shadow-card cursor-pointer"
                          >
                            Approve Access
                          </button>
                        )}
                        {!isSelf && (
                          <>
                            {u.isBlocked ? (
                              <button
                                onClick={() => runAction(adminApi.unblockUser, u._id)}
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-positive/10 text-positive border border-positive/20 hover:bg-positive/20 transition cursor-pointer"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => runAction(adminApi.blockUser, u._id)}
                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-caution/10 text-caution border border-caution/20 hover:bg-caution/20 transition cursor-pointer"
                              >
                                Block
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${u.name}? This cannot be undone.`)) {
                                  runAction(adminApi.deleteUser, u._id);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-ink/10 text-ink/40 hover:text-caution hover:border-caution/30 transition cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {selectedUser && (
        <div className="mt-8 bg-paper rounded-2xl shadow-card border border-ink/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/5 bg-paper/50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-ink">User Inspection: {selectedUser.name}</h2>
              <p className="text-xs text-ink/40 mt-0.5">{selectedUser.email}</p>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-xs text-ink/40 hover:text-ink font-semibold px-2.5 py-1 rounded bg-ink/5 cursor-pointer"
            >
              Close Details
            </button>
          </div>

          {inspectLoading ? (
            <p className="text-center text-ink/40 text-sm py-10">Fetching portfolio holdings and analysis reports...</p>
          ) : inspectError ? (
            <p className="text-center text-caution text-sm py-10">{inspectError}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {}
              <div>
                <h3 className="font-semibold text-sm text-ink mb-3 flex items-center gap-2">
                  <span>📈</span> Investments & Performance
                </h3>
                
                {inspectPortfolio.length === 0 ? (
                  <div className="bg-ink/5 rounded-xl p-4 text-center text-xs text-ink/40">
                    No active portfolio holdings or investments recorded.
                  </div>
                ) : (
                  <div>
                    <div className="bg-positive/5 border border-positive/10 rounded-xl p-4 mb-4">
                      <div className="text-xs text-ink/40">Total Invested Principal</div>
                      <div className="text-xl font-bold text-ink mt-1 font-mono">
                        ${inspectPortfolio.reduce((acc, item) => acc + (item.shares * item.purchasePrice), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="border border-ink/5 rounded-xl overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-paper/20 border-b border-ink/5 text-ink/40 uppercase text-[10px] tracking-wider">
                            <th className="px-3 py-2">Stock</th>
                            <th className="px-3 py-2 text-right">Shares</th>
                            <th className="px-3 py-2 text-right">Buy Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inspectPortfolio.map((item, idx) => (
                            <tr key={idx} className="border-b border-ink/5 last:border-0 hover:bg-paper/10 transition">
                              <td className="px-3 py-2 font-semibold text-ink">{item.ticker}</td>
                              <td className="px-3 py-2 text-right text-ink/75 font-mono">{item.shares}</td>
                              <td className="px-3 py-2 text-right text-ink/75 font-mono">${item.purchasePrice.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {}
              <div>
                <h3 className="font-semibold text-sm text-ink mb-3 flex items-center gap-2">
                  <span>🔬</span> AI Analyzing & Research Reports
                </h3>

                {inspectReports.length === 0 ? (
                  <div className="bg-ink/5 rounded-xl p-4 text-center text-xs text-ink/40">
                    No AI Research reports generated yet.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {inspectReports.map((report) => (
                      <div key={report._id} className="border border-ink/5 rounded-xl p-3.5 hover:bg-paper/20 transition flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink">{report.ticker}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              report.decision === "INVEST" 
                                ? "bg-positive/10 text-positive" 
                                : "bg-ink/10 text-ink/50"
                            }`}>
                              {report.decision}
                            </span>
                          </div>
                          <div className="text-[10px] text-ink/40 mt-1">
                            Run: {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <a
                          href={`/research?reportId=${report._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-signal hover:underline font-semibold"
                        >
                          View Report ↗
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, PieChart as ChartIcon, Briefcase, RefreshCw, X } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getPortfolio, addPortfolioItem, deletePortfolioItem } from "../api/portfolio";

const COLORS = ["#1A2B4C", "#B5945B", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B", "#06B6D4", "#EC4899"];

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sellHolding, setSellHolding] = useState(null);

  const [company, setCompany] = useState("");
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPortfolioData = () => {
    setLoading(true);
    getPortfolio()
      .then((res) => setPortfolio(res.data))
      .catch(() => setError("Failed to load portfolio data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!company.trim() || !ticker.trim() || !shares || !purchasePrice) return;

    setSubmitting(true);
    try {
      await addPortfolioItem({
        company: company.trim(),
        ticker: ticker.trim().toUpperCase(),
        shares: Number(shares),
        purchasePrice: Number(purchasePrice),
      });
      setShowAddModal(false);
      setCompany("");
      setTicker("");
      setShares("");
      setPurchasePrice("");
      fetchPortfolioData();
    } catch {
      setError("Failed to add transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holding?")) return;
    try {
      await deletePortfolioItem(id);
      fetchPortfolioData();
    } catch {
      setError("Failed to delete holding.");
    }
  };

  const triggerSellConfirm = (item, currentPrice) => {
    setSellHolding({
      id: item._id,
      ticker: item.ticker,
      shares: item.shares,
      currentPrice: currentPrice,
      company: item.company,
    });
  };

  const getCurrentPrice = (tickerStr, buyPrice) => {
    let hash = 0;
    for (let i = 0; i < tickerStr.length; i++) {
      hash += tickerStr.charCodeAt(i);
    }
    
    const variance = ((hash % 40) - 12) / 100;
    return Number((buyPrice * (1 + variance)).toFixed(2));
  };

  const totalCost = portfolio.reduce((acc, item) => acc + item.shares * item.purchasePrice, 0);
  const currentValue = portfolio.reduce((acc, item) => {
    const currentPrice = getCurrentPrice(item.ticker, item.purchasePrice);
    return acc + item.shares * currentPrice;
  }, 0);
  const totalProfitLoss = currentValue - totalCost;
  const profitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

  const chartData = portfolio.reduce((acc, item) => {
    const curVal = item.shares * getCurrentPrice(item.ticker, item.purchasePrice);
    const existing = acc.find((x) => x.name === item.ticker);
    if (existing) {
      existing.value += curVal;
    } else {
      acc.push({ name: item.ticker, value: curVal });
    }
    return acc;
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Portfolio</h1>
          <p className="text-ink/50 text-sm mt-1">Track and manage your asset allocations and returns</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-navy text-white text-sm font-medium hover:bg-navy/90 transition shadow-card"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {error && <p className="text-caution text-sm mb-4 bg-caution/10 border border-caution/20 rounded-xl px-4 py-3">{error}</p>}

      {}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="bg-paper border border-ink/5 rounded-2xl shadow-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-ink/40">Total Invested</span>
            <h3 className="font-display text-xl font-bold text-ink mt-1">{formatCurrency(totalCost)}</h3>
          </div>
          <div className="p-3 bg-navy/5 rounded-xl text-navy">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-paper border border-ink/5 rounded-2xl shadow-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-ink/40">Current Value</span>
            <h3 className="font-display text-xl font-bold text-ink mt-1">{formatCurrency(currentValue)}</h3>
          </div>
          <div className="p-3 bg-gold/10 rounded-xl text-gold-dark">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-paper border border-ink/5 rounded-2xl shadow-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xxs font-bold uppercase tracking-wider text-ink/40">Total Return</span>
            <h3
              className={`font-display text-xl font-bold mt-1 flex items-center gap-1 ${
                totalProfitLoss >= 0 ? "text-positive" : "text-caution"
              }`}
            >
              {totalProfitLoss >= 0 ? "+" : ""}
              {formatCurrency(totalProfitLoss)}
              <span className="text-xs font-mono font-medium">
                ({totalProfitLoss >= 0 ? "+" : ""}
                {profitLossPercentage.toFixed(2)}%)
              </span>
            </h3>
          </div>
          <div
            className={`p-3 rounded-xl ${
              totalProfitLoss >= 0 ? "bg-positive/10 text-positive" : "bg-caution/10 text-caution"
            }`}
          >
            {totalProfitLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {loading && <p className="text-ink/40 text-sm">Loading portfolio...</p>}

      {!loading && portfolio.length === 0 && (
        <div className="bg-paper border border-ink/5 rounded-2xl shadow-card p-12 text-center">
          <p className="text-ink/50 mb-4">No transactions recorded yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-block px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-medium hover:bg-navy/90 transition shadow-card"
          >
            Add your first transaction
          </button>
        </div>
      )}

      {!loading && portfolio.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {}
          <div className="bg-paper border border-ink/5 rounded-2xl shadow-card p-6 flex flex-col items-center">
            <h3 className="font-display font-semibold text-ink self-start mb-4 flex items-center gap-2">
              <ChartIcon className="w-4 h-4 text-gold" />
              Asset Allocation
            </h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {}
          <div className="lg:col-span-2 bg-paper border border-ink/5 rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream/40 border-b border-ink/5 text-xxs font-bold uppercase tracking-wider text-ink/40">
                    <th className="px-6 py-4">Holding</th>
                    <th className="px-6 py-4">Shares</th>
                    <th className="px-6 py-4">Buy Price</th>
                    <th className="px-6 py-4">Current</th>
                    <th className="px-6 py-4">Market Value</th>
                    <th className="px-6 py-4 text-right">Return</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 text-sm text-ink/80">
                  {portfolio.map((item) => {
                    const currentPrice = getCurrentPrice(item.ticker, item.purchasePrice);
                    const cost = item.shares * item.purchasePrice;
                    const value = item.shares * currentPrice;
                    const pnl = value - cost;
                    const pnlPercent = (pnl / cost) * 100;

                    return (
                      <tr key={item._id} className="hover:bg-cream/25 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-ink">{item.ticker}</div>
                          <div className="text-xs text-ink/40 truncate max-w-[120px]">{item.company}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{item.shares}</td>
                        <td className="px-6 py-4 font-mono text-xs">{formatCurrency(item.purchasePrice)}</td>
                        <td className="px-6 py-4 font-mono text-xs">{formatCurrency(currentPrice)}</td>
                        <td className="px-6 py-4 font-mono text-xs font-semibold">{formatCurrency(value)}</td>
                        <td className={`px-6 py-4 text-right font-mono text-xs font-semibold ${
                          pnl >= 0 ? "text-positive" : "text-caution"
                        }`}>
                          <div>{pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}</div>
                          <div className="text-[10px] font-medium opacity-80">
                            {pnl >= 0 ? "+" : ""}{pnlPercent.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => triggerSellConfirm(item, currentPrice)}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-positive text-white hover:bg-positive/90 shadow-sm transition-all duration-200 cursor-pointer"
                            title="Sell stock and refund to wallet"
                          >
                            Sell
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-paper border border-ink/5 rounded-2xl p-6 shadow-card relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-ink/5 text-ink/50"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display font-semibold text-ink text-lg mb-1">Add Stock Transaction</h3>
            <p className="text-xs text-ink/50 mb-6">Enter stock purchase info to record holdings</p>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Company Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Tesla"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Ticker</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. TSLA"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Shares</label>
                  <input
                    required
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    placeholder="10"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Purchase Price</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="$185.50"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="w-full py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition shadow-card mt-2 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}

      {}
      {sellHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-paper border border-ink/5 rounded-2xl p-6 shadow-card relative">
            <button
              onClick={() => setSellHolding(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-ink/5 text-ink/50"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display font-semibold text-ink text-lg mb-2">Confirm Stock Sale</h3>
            <p className="text-sm text-ink/75 mb-6 leading-relaxed">
              Are you sure you want to sell <span className="font-bold text-ink">{sellHolding.shares}</span> shares of <span className="font-bold text-ink">{sellHolding.ticker}</span> for <span className="font-semibold text-positive">{formatCurrency(sellHolding.shares * sellHolding.currentPrice)}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSellHolding(null)}
                className="flex-1 py-2.5 rounded-xl border border-ink/10 text-ink/70 text-xs font-bold uppercase tracking-wider hover:bg-ink/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-sell"
                onClick={async () => {
                  const { id, currentPrice } = sellHolding;
                  setSellHolding(null);
                  try {
                    await deletePortfolioItem(id, { sell: true, sellPrice: currentPrice });
                    fetchPortfolioData();
                  } catch (err) {
                    console.error("Sell failed:", err);
                    setError(err.response?.data?.message || err.message || "Failed to sell stock.");
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-positive text-white text-xs font-bold uppercase tracking-wider hover:bg-positive/90 shadow-sm transition cursor-pointer"
              >
                Confirm Sell
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Globe, X, Bot } from "lucide-react";
import ResearchRoom from "../components/ResearchRoom";
import DecisionCard from "../components/DecisionCard";
import ReasoningPanel from "../components/ReasoningPanel";
import FinancialChart from "../components/FinancialChart";
import AgentSelector from "../components/AgentSelector";
import { streamResearch } from "../api/streamResearch";
import { getReportById, shareReport } from "../api/research";
import { useAuth } from "../context/AuthContext";
import { getWalletBalance } from "../api/wallet";
import { addPortfolioItem } from "../api/portfolio";
import { addNotification } from "../utils/notifications";

const SUBSTEP_LABELS = {
  financialAgent: "Financial",
  marketAgent: "Market",
  riskAgent: "Risk",
};

const PROVIDER_META = {
  gemini: { label: "Gemini 2.5", color: "from-blue-500 to-purple-500" },
  openai: { label: "GPT-4o Mini", color: "from-emerald-500 to-teal-500" },
  claude: { label: "Claude 3.5", color: "from-orange-400 to-rose-500" },
};

const Research = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const company = searchParams.get("company");
  const reportId = searchParams.get("reportId");
  const { user } = useAuth();

  const [stage, setStage] = useState("idle");
  const [label, setLabel] = useState("Waiting to start...");
  const [completedSubsteps, setCompletedSubsteps] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loadingReport, setLoadingReport] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("gemini");

  const [showInvestModal, setShowInvestModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [sharesInput, setSharesInput] = useState("10");
  const [investPrice] = useState(150);
  const [investLoading, setInvestLoading] = useState(false);
  const [investError, setInvestError] = useState("");
  const [investSuccess, setInvestSuccess] = useState("");

  const handleOpenInvestModal = async () => {
    setInvestError("");
    setInvestSuccess("");
    try {
      const res = await getWalletBalance();
      setWalletBalance(res.data.balance);
      setShowInvestModal(true);
    } catch (err) {
      setError("Failed to fetch current wallet balance.");
    }
  };

  const handleConfirmInvestment = async (e) => {
    e.preventDefault();
    setInvestError("");
    setInvestSuccess("");

    const shares = Number(sharesInput);
    if (!shares || isNaN(shares) || shares <= 0) {
      setInvestError("Please enter a valid number of shares.");
      return;
    }

    const totalCost = shares * investPrice;
    if (walletBalance < totalCost) {
      setInvestError(`Insufficient wallet balance. Total cost is ₹${totalCost.toLocaleString()}, but your balance is ₹${walletBalance.toLocaleString()}.`);
      return;
    }

    setInvestLoading(true);
    try {
      await addPortfolioItem({
        company: report.company,
        ticker: report.ticker || "TKR",
        shares,
        purchasePrice: investPrice,
        deductFromWallet: true,
      });

      addNotification(user?.email, "Investment", "Investment Confirmed 📈", `Invested ₹${totalCost.toLocaleString()} in ${report.company} (${shares} shares).`);
      setInvestSuccess(`Investment of ₹${totalCost.toLocaleString()} in ${report.company} completed successfully!`);
      const newBal = await getWalletBalance();
      setWalletBalance(newBal.data.balance);
      setTimeout(() => {
        setShowInvestModal(false);
        setSharesInput("10");
        setInvestSuccess("");
      }, 2000);
    } catch (err) {
      setInvestError(err.response?.data?.message || "Failed to complete investment transaction.");
    } finally {
      setInvestLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      setLoadingReport(true);
      setError("");
      setReport(null);
      setStage("done");
      getReportById(reportId)
        .then((res) => {
          setReport(res.data);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Failed to load the saved report.");
        })
        .finally(() => {
          setLoadingReport(false);
        });
      return;
    }

    if (!company) {
      setStage("idle");
      setReport(null);
      setCompletedSubsteps([]);
      setError("");
      return;
    }

    setStage("company");
    setLabel("Reading company reports");
    setCompletedSubsteps([]);
    setReport(null);
    setError("");

    addNotification(user?.email, "Research", "Research Started 🔍", `Started AI research on ${company}.`);

    const controller = new AbortController();

    streamResearch(company, {
      signal: controller.signal,
      provider: selectedProvider,
      onEvent: (type, data) => {
        if (type === "progress") {
          setStage(data.stage);
          setLabel(data.label);
        } else if (type === "substep") {
          setCompletedSubsteps((prev) => [...prev, data.node]);
        } else if (type === "done") {
          setStage("done");
          setReport(data);
          addNotification(user?.email, "Research", "Research Completed 📊", `AI research report for ${data.company} is ready with ${data.decision} recommendation (${data.confidence}% confidence).`);
        } else if (type === "error") {
          setError(data.message);
        }
      },
    }).catch((err) => {
      if (err.name !== "AbortError") setError(err.message);
    });

    return () => controller.abort();
  }, [company, reportId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSearchParams({ company: inputValue.trim() });
  };

  const handleShareToggle = async () => {
    if (!report) return;
    try {
      const res = await shareReport(report._id, !report.isShared);
      setReport(res.data);
    } catch (err) {
      setError("Failed to update report share status.");
    }
  };

  const isOwner =
    report &&
    (report.userId === user?.id ||
      report.userId?._id === user?.id ||
      !report.userId);

  const getHeaderTitle = () => {
    if (stage === "done" && report) return report.company;
    if (company) return `Researching ${company}...`;
    if (reportId) return "AI Research Report";
    return "AI Investment Research";
  };

  const reportProvider = report?.provider || "gemini";
  const providerMeta = PROVIDER_META[reportProvider] || PROVIDER_META.gemini;

  if (loadingReport) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-ink/40 text-sm">Loading report details...</p>
      </div>
    );
  }

  if (!company && !reportId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center gap-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">Research a company</h1>
          <p className="text-ink/60 max-w-sm">
            Enter a company name and your chosen AI agent will research it end to end.
          </p>
        </div>

        {/* Agent Selector */}
        <div className="w-full max-w-lg">
          <AgentSelector selected={selectedProvider} onSelect={setSelectedProvider} />
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            autoFocus
            id="company-search-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. Tesla"
            className="w-full bg-paper border border-ink/15 rounded-full pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </form>

        {/* Active agent hint */}
        <p className="text-[11px] text-ink/35 -mt-3">
          Powered by <span className="font-semibold text-ink/50">{PROVIDER_META[selectedProvider]?.label || "Gemini 2.5"}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-ink/5 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-bold text-ink">
            {getHeaderTitle()}
          </h1>

          {/* Agent badge — shown on running and completed reports */}
          {(stage !== "idle") && (
            <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${providerMeta.color} text-white shadow-sm`}>
              <Bot className="w-3 h-3" />
              {providerMeta.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {stage === "done" && report && isOwner && (
            <button
              id="share-report-btn"
              onClick={handleShareToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                report.isShared
                  ? "bg-positive/10 text-positive border-positive/20 hover:bg-positive/15"
                  : "bg-paper text-ink/60 border-ink/10 hover:bg-cream"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              {report.isShared ? "Shared with Community" : "Share with Community"}
            </button>
          )}

          {stage === "done" && report && (
            <button
              id="invest-btn"
              onClick={handleOpenInvestModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/95 transition shadow-card cursor-pointer"
            >
              <span>💰</span>
              Invest
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="space-y-6">
          <div className="text-sm text-caution bg-caution/10 border border-caution/20 rounded-xl px-4 py-3">
            <p className="font-semibold">{error}</p>
          </div>
          <div className="w-full max-w-sm mx-auto p-6 bg-paper border border-ink/10 rounded-2xl shadow-card text-center">
            <h3 className="font-display font-semibold text-ink mb-1 text-sm">Try another company</h3>
            <p className="text-xs text-ink/50 mb-4">Enter a valid company name or stock symbol to research.</p>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              <input
                autoFocus
                id="company-search-retry"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. Tesla or AAPL"
                className="w-full bg-paper border border-ink/15 rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </form>
          </div>
        </div>
      )}

      {stage !== "done" && !error && (
        <div className="space-y-4">
          <div className="h-[420px] rounded-2xl overflow-hidden bg-cream border border-ink/5">
            <ResearchRoom stage={stage} label={label} />
          </div>

          <div className="flex items-center justify-center gap-6">
            {Object.entries(SUBSTEP_LABELS).map(([node, name]) => (
              <div key={node} className="flex items-center gap-1.5 text-xs">
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    completedSubsteps.includes(node) ? "bg-positive" : "bg-ink/15"
                  }`}
                />
                <span className={completedSubsteps.includes(node) ? "text-ink/70" : "text-ink/30"}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === "done" && report && (
        <div className="space-y-5">
          <DecisionCard report={report} />
          <FinancialChart
            financial={report.analysis.financial}
            risk={report.analysis.risk}
            confidence={report.confidence}
          />
          <ReasoningPanel analysis={report.analysis} />
        </div>
      )}

      {/* Invest Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-paper border border-ink/5 rounded-2xl p-6 shadow-card relative">
            <button
              id="close-invest-modal"
              disabled={investLoading}
              onClick={() => setShowInvestModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-ink/5 text-ink/50"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display font-semibold text-ink text-lg mb-1">Confirm Investment</h3>
            <p className="text-xs text-ink/50 mb-6">Invest in {report?.company} using your wallet funds</p>

            {investError && (
              <div className="mb-4 text-xs text-caution bg-caution/10 border border-caution/20 rounded-xl px-4 py-3">
                {investError}
              </div>
            )}

            {investSuccess && (
              <div className="mb-4 text-xs text-positive bg-positive/10 border border-positive/20 rounded-xl px-4 py-3">
                {investSuccess}
              </div>
            )}

            <form onSubmit={handleConfirmInvestment} className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-cream/30 border border-ink/5 rounded-xl text-xs">
                <div>
                  <span className="text-ink/40 font-medium block">Current Balance</span>
                  <span className="font-bold text-ink text-sm font-mono">₹{walletBalance.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-ink/40 font-medium block">Ticker / Company</span>
                  <span className="font-bold text-ink uppercase">{report?.ticker || "TKR"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Mock Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/40">₹</span>
                    <input
                      disabled
                      type="text"
                      value={investPrice.toFixed(2)}
                      className="w-full bg-cream/40 border border-ink/10 rounded-xl pl-6 pr-3 py-2 text-sm text-ink/50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Shares to Buy</label>
                  <input
                    id="shares-input"
                    required
                    type="number"
                    min="1"
                    value={sharesInput}
                    onChange={(e) => setSharesInput(e.target.value)}
                    className="w-full bg-paper border border-ink/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>
              </div>

              <div className="border-t border-ink/5 pt-3 flex justify-between items-center text-xs">
                <span className="text-ink/50 font-medium">Estimated Cost:</span>
                <span className="text-base font-bold text-navy font-mono">
                  ₹{(Number(sharesInput) * investPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                id="confirm-invest-btn"
                disabled={investLoading}
                type="submit"
                className="w-full py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition shadow-card mt-2 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {investLoading ? "Processing..." : "Confirm Investment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Research;

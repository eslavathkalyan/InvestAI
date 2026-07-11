import { useEffect, useState } from "react";
import { CreditCard, Wallet as WalletIcon, ArrowUpRight, DollarSign, X, CheckCircle, ShieldAlert, Activity, Lock, Loader } from "lucide-react";
import * as walletApi from "../api/wallet";
import { useAuth } from "../context/AuthContext";
import { addNotification } from "../utils/notifications";

const Wallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [amountInput, setAmountInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payStatus, setPayStatus] = useState("idle"); 
  const [paymentStage, setPaymentStage] = useState("contacting"); 

  const [activeTab, setActiveTab] = useState("deposit"); 
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [holderName, setHolderName] = useState("");
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const fetchBalance = async () => {
    try {
      const res = await walletApi.getWalletBalance();
      setBalance(res.data.balance);
    } catch (err) {
      setError("Failed to load wallet balance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleOpenPayment = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const amt = Number(amountInput);
    if (!amt || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    setPayStatus("idle");
    setShowPayModal(true);
  };

  const handleVerifyAccount = (e) => {
    e.preventDefault();
    if (!bankAccount || !ifsc) {
      setError("Please enter both Account Number and IFSC Code.");
      return;
    }
    setError("");
    setVerifyingAccount(true);
    setAccountVerified(false);
    setHolderName("");

    setTimeout(() => {
      setVerifyingAccount(false);
      setAccountVerified(true);
      setHolderName("Eslavath Kalyan");
      setSuccess("Bank account verified successfully.");
    }, 2000);
  };

  const handleWithdrawFunds = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setWithdrawSuccess("");

    const amt = Number(withdrawAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount to withdraw.");
      return;
    }

    if (balance < amt) {
      setError("Insufficient wallet balance for this withdrawal.");
      return;
    }

    if (!accountVerified || !holderName) {
      setError("Please verify the bank account details before withdrawing.");
      return;
    }

    setWithdrawing(true);
    try {
      const res = await walletApi.withdrawWalletBalance(amt, bankAccount, ifsc);
      setBalance(res.data.balance);
      addNotification(user?.email, "Wallet", "Funds Withdrawn 🏦", `Withdrew ₹${amt.toLocaleString()} to bank account ending in ...${bankAccount.slice(-4)}.`);
      setWithdrawSuccess(`₹${amt.toLocaleString()} successfully withdrawn to account ending in ...${bankAccount.slice(-4)}.`);
      setSuccess("");
      setWithdrawAmount("");
      setBankAccount("");
      setIfsc("");
      setHolderName("");
      setAccountVerified(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to withdraw funds.");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleQuickSelect = (amt) => {
    setAmountInput(amt.toString());
  };

  const handleMockPaymentSuccess = async () => {
    setSubmitting(true);
    setPayStatus("paying");
    setPaymentStage("contacting");

    setTimeout(() => {
      setPaymentStage("tunnel");
    }, 1000);

    setTimeout(() => {
      setPaymentStage("authorizing");
    }, 2000);

    setTimeout(async () => {
      try {
        const amt = Number(amountInput);
        const res = await walletApi.addWalletBalance(amt);
        setBalance(res.data.balance);
        addNotification(user?.email, "Wallet", "Funds Deposited 💰", `Added ₹${amt.toLocaleString()} to your wallet.`);
        setSuccess(`Successfully added ₹${amt.toLocaleString()} to your wallet balance.`);
        setAmountInput("");
        setPayStatus("success");
        setTimeout(() => {
          setShowPayModal(false);
          setPayStatus("idle");
        }, 2000);
      } catch (err) {
        setPayStatus("error");
        setError("Simulated payment completed, but balance update failed.");
      } finally {
        setSubmitting(false);
      }
    }, 3200);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-ink">My Wallet</h1>
        <p className="text-ink/50 text-xs mt-1">Manage your funds and simulated investment balances</p>
      </div>

      {error && (
        <div className="mb-6 text-sm text-caution bg-caution/10 border border-caution/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 text-sm text-positive bg-positive/10 border border-positive/20 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {}
        <div className="md:col-span-1 bg-navy text-white rounded-2xl shadow-card p-5 flex flex-col justify-between min-h-[150px]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-white/60">Wallet Balance</span>
            <WalletIcon className="w-5 h-5 text-gold" />
          </div>
          <div>
            {loading ? (
              <div className="h-8 w-24 bg-white/20 animate-pulse rounded" />
            ) : (
              <h2 className="text-2xl font-bold font-mono text-white">
                ₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            )}
            <p className="text-[10px] text-white/40 mt-1">Simulated INR balance for paper trading</p>
          </div>
        </div>

        {}
        <div className="md:col-span-2 bg-paper border border-ink/5 rounded-2xl shadow-card overflow-hidden flex flex-col">
          {}
          <div className="flex border-b border-ink/5 bg-cream/20">
            <button
              onClick={() => { setActiveTab("deposit"); setError(""); setSuccess(""); }}
              className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition ${
                activeTab === "deposit"
                  ? "border-gold text-gold bg-paper"
                  : "border-transparent text-ink/40 hover:text-ink/60"
              }`}
            >
              Deposit Funds
            </button>
            <button
              onClick={() => { setActiveTab("withdraw"); setError(""); setSuccess(""); }}
              className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition ${
                activeTab === "withdraw"
                  ? "border-gold text-gold bg-paper"
                  : "border-transparent text-ink/40 hover:text-ink/60"
              }`}
            >
              Withdraw Funds
            </button>
          </div>

          <div className="p-6">
            {activeTab === "deposit" && (
              <div>
                <h3 className="font-semibold text-sm text-ink mb-4">Add Funds to Wallet</h3>
                <form onSubmit={handleOpenPayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 mb-1.5">Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink/40 font-mono">₹</span>
                      <input
                        required
                        type="number"
                        min="1"
                        placeholder="Enter amount to add"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="w-full bg-paper border border-ink/15 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickSelect(amt)}
                        className="px-4 py-2 rounded-lg border border-ink/10 hover:border-gold hover:bg-gold/5 text-xs text-ink/80 font-medium transition cursor-pointer"
                      >
                        + ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition shadow-card flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Add Money
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === "withdraw" && (
              <div>
                <h3 className="font-semibold text-sm text-ink mb-4">Withdraw Funds to Bank Account</h3>
                {withdrawSuccess && (
                  <div className="mb-4 flex items-center gap-2 text-xs text-positive bg-positive/10 border border-positive/20 rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{withdrawSuccess}</span>
                  </div>
                )}
                <form onSubmit={handleWithdrawFunds} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink/70 mb-1.5">IFSC Code</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. SBIN0001234"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink/70 mb-1.5">Account Number</label>
                      <div className="flex gap-2">
                        <input
                          required
                          type="text"
                          placeholder="Bank account number"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          className="flex-1 bg-paper border border-ink/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyAccount}
                          disabled={verifyingAccount || !bankAccount || !ifsc}
                          className="px-4 py-2 rounded-xl bg-navy text-white text-xs font-semibold hover:bg-navy/90 disabled:opacity-50 transition shrink-0 cursor-pointer"
                        >
                          {verifyingAccount ? "Verifying..." : "Verify"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink/70 mb-1.5">Account Holder Name</label>
                    <div className="relative">
                      <input
                        disabled
                        type="text"
                        placeholder="Click Verify above to find Holder Name"
                        value={holderName}
                        className="w-full bg-cream/40 border border-ink/10 rounded-xl px-4 py-2.5 text-sm text-ink/65 cursor-not-allowed font-medium"
                      />
                      {accountVerified && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#10b981] font-bold bg-[#10b981]/10 px-2 py-0.5 rounded flex items-center gap-1">
                          ✓ Verified Account
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink/70 mb-1.5">Withdraw Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink/40 font-mono">₹</span>
                      <input
                        required
                        type="number"
                        min="1"
                        placeholder="Enter amount to withdraw"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-paper border border-ink/15 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={withdrawing || !accountVerified}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition shadow-card flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {withdrawing ? "Processing IMPS/NEFT..." : "Withdraw Funds"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#111624] border border-white/5 rounded-2xl overflow-hidden shadow-2xl text-white">
            {}
            <div className="bg-[#1b2138] px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#3399FF] flex items-center justify-center font-bold text-white text-xs">R</div>
                <div>
                  <h4 className="font-semibold text-xs text-white/90">Razorpay Secure</h4>
                  <p className="text-[9px] text-[#3399FF] font-medium uppercase tracking-wider">Test Mode Gateway</p>
                </div>
              </div>
              <button
                disabled={submitting}
                onClick={() => setShowPayModal(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-white/40 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-center py-2 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-white/50 block font-medium">Paying to InvestAI</span>
                <span className="text-xl font-bold font-mono mt-1 block">
                  ₹{Number(amountInput).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {}
              <div className="bg-[#0e2c26]/60 border border-[#10b981]/20 rounded-xl p-3.5 flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0 animate-pulse" />
                <div>
                  <p className="text-[11px] font-semibold text-[#10b981]">Gateway is Working</p>
                  <p className="text-[10px] text-white/60 leading-relaxed mt-0.5">
                    The Razorpay payment gateway integration is working. Click the simulate button below to complete the test payment.
                  </p>
                </div>
              </div>

              {payStatus === "paying" && (
                <div className="text-center py-6 space-y-6">
                  {}
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5 animate-pulse" />
                    <div className="absolute inset-2 rounded-full border-4 border-dashed border-[#3399FF] animate-spin" />
                    {paymentStage === "contacting" && <CreditCard className="w-8 h-8 text-[#3399FF] animate-bounce" />}
                    {paymentStage === "tunnel" && <Lock className="w-8 h-8 text-gold animate-pulse" />}
                    {paymentStage === "authorizing" && <Activity className="w-8 h-8 text-[#10b981] animate-pulse" />}
                  </div>
                  
                  {}
                  <div className="max-w-xs mx-auto space-y-3 bg-white/5 border border-white/5 rounded-xl p-4 text-left">
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center border font-bold ${
                        paymentStage === "tunnel" || paymentStage === "authorizing"
                          ? "border-[#10b981] bg-[#10b981] text-[#111624] text-[9px]" 
                          : "border-[#3399FF] text-[#3399FF] text-[9px]"
                      }`}>
                        {paymentStage !== "contacting" ? "✓" : "1"}
                      </span>
                      <span className={paymentStage === "contacting" ? "text-white font-semibold" : "text-white/40"}>
                        Contacting Razorpay Gateway...
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center border font-bold ${
                        paymentStage === "authorizing" 
                          ? "border-[#10b981] bg-[#10b981] text-[#111624] text-[9px]" 
                          : paymentStage === "tunnel"
                            ? "border-[#3399FF] text-[#3399FF] text-[9px]" 
                            : "border-white/20 text-white/40 text-[9px]"
                      }`}>
                        {paymentStage === "authorizing" ? "✓" : "2"}
                      </span>
                      <span className={paymentStage === "tunnel" ? "text-white font-semibold" : "text-white/40"}>
                        Securing transaction tunnel...
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center border font-bold ${
                        paymentStage === "authorizing" 
                          ? "border-[#3399FF] text-[#3399FF] text-[9px]" 
                          : "border-white/20 text-white/40 text-[9px]"
                      }`}>
                        3
                      </span>
                      <span className={paymentStage === "authorizing" ? "text-white font-semibold animate-pulse" : "text-white/40"}>
                        Authorizing mock payment...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {payStatus === "success" && (
                <div className="text-center py-6 space-y-4">
                  {}
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#10b981]/15 border-2 border-[#10b981]/40 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 rounded-full border-4 border-[#10b981] animate-ping opacity-10" />
                    <CheckCircle className="w-10 h-10 text-[#10b981] animate-bounce" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Payment Authorized!</p>
                    <p className="text-xs text-white/50 mt-1 font-mono">Simulated Razorpay success</p>
                  </div>
                </div>
              )}

              {payStatus === "idle" && (
                <div className="space-y-3">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Payment Options</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-white/50" />
                        <span className="text-xs font-medium">Cards, UPI & Netbanking</span>
                      </div>
                      <span className="text-[10px] font-semibold text-white/40 uppercase bg-white/10 px-1.5 py-0.5 rounded">Enabled</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={handleMockPaymentSuccess}
                      className="flex-1 bg-[#3399FF] hover:bg-[#2288ee] text-white text-xs font-semibold py-2.5 rounded-lg transition text-center cursor-pointer shadow-lg"
                    >
                      Complete Payment
                    </button>
                    <button
                      onClick={() => setShowPayModal(false)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold py-2.5 rounded-lg border border-white/10 transition text-center cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;

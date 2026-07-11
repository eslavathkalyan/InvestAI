import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { verifyOtp, resendOtp } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const infoMsg = searchParams.get("info") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [message, setMessage] = useState(infoMsg || "Enter the 6-digit OTP code sent to your email.");
  const [resendTimer, setResendTimer] = useState(60); 
  const [resending, setResending] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setStatus("idle");
    setMessage("Sending a new verification code...");

    try {
      const res = await resendOtp(email);
      setStatus("idle");
      setMessage(res.data.message || "A new OTP code has been sent to your email.");
      setResendTimer(60);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setStatus("error");
      setMessage("Please fill in both email and OTP fields.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await verifyOtp(email, otp);
      if (res.data.token) {
        login(res.data.token, res.data.user);
        navigate("/dashboard");
        return;
      }
      setStatus("success");
      setMessage(res.data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "OTP verification failed. Please check the code and try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-paper rounded-2xl shadow-card p-8 border border-ink/5">
        {status === "success" ? (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-positive mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-ink mb-2">Account Verified</h1>
            <p className="text-ink/60 text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full px-5 py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 shadow-card transition text-center cursor-pointer"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div>
            <h1 className="font-display text-2xl font-bold text-ink mb-1">Verify your account</h1>
            <p className="text-ink/50 text-sm mb-6">Enter your verification details to activate your account</p>

            {status === "error" && (
              <div className="mb-5 text-sm text-caution bg-caution/10 border border-caution/20 rounded-xl px-4 py-3 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {status !== "error" && message && (
              <div className="mb-5 text-sm text-navy/70 bg-navy/5 border border-navy/10 rounded-xl px-4 py-3">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition bg-paper text-ink"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-ink">One-Time Password (OTP)</label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || resending}
                    className="text-xs font-semibold text-signal hover:underline disabled:text-ink/30 disabled:no-underline transition cursor-pointer"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm tracking-[0.25em] text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition bg-paper text-ink"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-navy text-white rounded-xl py-3 text-sm font-semibold hover:bg-navy/90 disabled:opacity-50 transition shadow-card cursor-pointer mt-2"
              >
                {status === "loading" ? "Verifying..." : "Verify Account"}
              </button>
            </form>

            <p className="text-sm text-ink/50 mt-6 text-center">
              Back to{" "}
              <Link to="/login" className="text-signal font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
  
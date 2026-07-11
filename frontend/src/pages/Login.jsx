import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const passwordInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      const res = await loginUser({ email, password });
      if (res.status === 202 && res.data.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}&info=${encodeURIComponent(res.data.message)}&isLogin=true`);
        return;
      }
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-paper rounded-2xl shadow-card p-8 border border-ink/5">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Welcome back</h1>
        <p className="text-ink/50 text-sm mb-6">Log in to continue your research</p>

        {error && (
          <div className="mb-4 text-sm text-caution bg-caution/10 border border-caution/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-4 text-sm text-navy/70 bg-navy/5 border border-navy/10 rounded-lg px-3 py-2">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition bg-paper text-ink"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-ink">Password</label>
              <Link to="/forgot-password" className="text-xs text-signal hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              ref={passwordInputRef}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition bg-paper text-ink"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-navy text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-navy/90 disabled:opacity-50 transition cursor-pointer"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>



        <p className="text-sm text-ink/50 mt-6 text-center">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-signal font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

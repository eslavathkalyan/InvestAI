import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await forgotPassword(email);
    } finally {

      setSent(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-paper rounded-2xl shadow-card p-8">
        {sent ? (
          <>
            <h1 className="font-display text-xl font-semibold text-ink mb-2">Check your email</h1>
            <p className="text-ink/60 text-sm">
              If an account exists for <span className="font-medium">{email}</span>, a reset link
              has been sent. It expires in 1 hour.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold text-ink mb-1">
              Reset your password
            </h1>
            <p className="text-ink/50 mb-6">
              Enter your email and we&apos;ll send you a reset link
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-navy text-white rounded-lg py-2.5 font-medium hover:bg-navy/90 disabled:opacity-50 transition"
              >
                {submitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <p className="text-sm text-ink/50 mt-6 text-center">
          <Link to="/login" className="text-signal font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

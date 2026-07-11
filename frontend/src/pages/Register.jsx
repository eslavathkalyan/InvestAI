import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { registerUser } from "../api/auth";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await registerUser(form);
      // The backend won't let this user log in until they click the
      // verification link it just emailed them, so there's no token
      // to store yet - just confirm the email was sent.
      setRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-paper rounded-2xl shadow-card p-8 text-center border border-ink/5">
          <MailCheck className="w-12 h-12 text-positive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-ink mb-2">Check your email</h1>
          <p className="text-ink/60 text-sm mb-6 leading-relaxed">
            We sent a 6-digit One-Time Password (OTP) to <span className="font-semibold text-ink">{form.email}</span>.
            Please enter this code to verify your email and activate your account.
          </p>
          <Link
            to={`/verify-email?email=${encodeURIComponent(form.email)}`}
            className="inline-block w-full px-5 py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 shadow-card transition text-center cursor-pointer"
          >
            Verify Account with OTP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-paper rounded-2xl shadow-card p-8">
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Create your account</h1>
        <p className="text-ink/50 mb-6">Start researching companies with AI</p>

        {error && (
          <div className="mb-4 text-sm text-caution bg-caution/10 border border-caution/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Name</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-navy text-white rounded-lg py-2.5 font-medium hover:bg-navy/90 disabled:opacity-50 transition"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-ink/50 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-signal font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

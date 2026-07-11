import { Link, Navigate } from "react-router-dom";
import { Brain, ShieldAlert, LineChart, Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SplineModel from "../components/SplineModel";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Research",
    description: "A dedicated agent reads through what a company actually does before anything else runs.",
  },
  {
    icon: LineChart,
    title: "Financial Intelligence",
    description: "Real market data where it's available, clearly labeled reasoning where it isn't.",
  },
  {
    icon: ShieldAlert,
    title: "Risk Analysis",
    description: "Specific weaknesses and threats, not generic disclaimers restated for every company.",
  },
  {
    icon: Target,
    title: "Investment Decision",
    description: "One clear call - INVEST or PASS - with a confidence score and the reasoning behind it.",
  },
];

const Home = () => {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div>
      {}
      <section className="relative overflow-hidden border-b border-ink/5 bg-paper/50 min-h-[80vh] flex items-center">
        {}
        <SplineModel />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 w-full pointer-events-none">
          <div className="max-w-xl pointer-events-none">
            <span className="font-mono text-xs tracking-widest text-gold uppercase font-bold pointer-events-none">
              AI Investment Research
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-ink mt-3 mb-5 leading-tight pointer-events-none">
              Your AI Investment Research Analyst
            </h1>
            <p className="text-ink/70 text-base md:text-lg mb-8 max-w-md leading-relaxed pointer-events-none">
              Research any company instantly. Five specialized agents study the
              business, financials, market, and risks — then commit to a call.
            </p>
            <div className="flex gap-3 pointer-events-auto">
              <Link
                to={user ? "/research" : "/register"}
                className="px-6 py-3.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 shadow-card transition"
              >
                {user ? "Start researching" : "Get started"}
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-xl border border-ink/15 text-ink text-sm font-semibold hover:bg-paper/85 transition"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="bg-paper border-y border-ink/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title}>
              <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-navy" />
              </div>
              <h3 className="font-display font-semibold text-ink mb-1.5">{title}</h3>
              <p className="text-sm text-ink/60 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

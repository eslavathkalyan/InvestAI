import { Link } from "react-router-dom";

// Several nav items (Portfolio, Watchlist, Market Insights, Company
// Screener, Community) are part of the navbar spec but aren't part
// of the core AI research flow this assignment is scoped around.
// Rather than leave them as dead links or fake the feature, they
// render this shared placeholder - honest about what exists today.
const ComingSoon = ({ title }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="font-mono text-xs tracking-widest text-gold uppercase mb-3">
        Coming soon
      </span>
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-2">
        {title}
      </h1>
      <p className="text-ink/60 max-w-sm mb-6">
        This part of InvestAI isn't built yet. The current focus is the AI
        research pipeline - try that instead.
      </p>
      <Link
        to="/research"
        className="px-5 py-2.5 rounded-lg bg-navy text-white font-medium hover:bg-navy/90 transition"
      >
        Go to AI Research
      </Link>
    </div>
  );
};

export default ComingSoon;

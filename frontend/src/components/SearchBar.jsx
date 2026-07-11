import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    navigate(`/research?company=${encodeURIComponent(trimmed)}`);
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search companies or ask AI..."
        className="w-full bg-cream border border-ink/10 rounded-full pl-9 pr-4 py-2 text-sm
                   placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-gold/40
                   focus:border-gold/40 transition"
      />
    </form>
  );
};

export default SearchBar;

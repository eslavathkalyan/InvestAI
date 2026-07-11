import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  if (!user) return null;

  const initial = user.name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ink/5 transition"
      >
        <span className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-sm font-display font-semibold">
          {initial}
        </span>
        <ChevronDown className="w-4 h-4 text-ink/50" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-paper rounded-xl shadow-card border border-ink/5 py-1.5 z-50">
          <div className="px-3.5 py-2 border-b border-ink/5 mb-1">
            <p className="text-sm font-medium text-ink truncate">{user.name}</p>
            <p className="text-xs text-ink/50 truncate">{user.email}</p>
          </div>

          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-3.5 py-2 text-sm text-ink/80 hover:bg-cream transition"
          >
            My Reports
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-3.5 py-2 text-sm text-ink/80 hover:bg-cream transition"
          >
            Research History
          </Link>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="block px-3.5 py-2 text-sm text-ink/80 hover:bg-cream transition"
          >
            Settings
          </Link>

          {user.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="block px-3.5 py-2 text-sm text-gold font-medium hover:bg-cream transition"
            >
              Admin Panel
            </Link>
          )}

          <div className="border-t border-ink/5 mt-1 pt-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3.5 py-2 text-sm text-caution hover:bg-cream transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

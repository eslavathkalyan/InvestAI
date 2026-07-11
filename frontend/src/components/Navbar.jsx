import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell, Bookmark, Menu, X, Sun, Moon } from "lucide-react";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import { useAuth } from "../context/AuthContext";
import { getNotifications, clearNotifications, markNotificationsRead } from "../utils/notifications";

const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "AI Research", to: "/research" },
  { label: "Watchlist", to: "/watchlist" },
  { label: "Market Insights", to: "/market-insights" },
  { label: "Company Screener", to: "/company-screener" },
  { label: "Community", to: "/community" },
  { label: "My Wallet", to: "/wallet" },
  { label: "Contact Us", to: "/contact" },
];

const PRIMARY_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "AI Research", to: "/research" },
  { label: "Company Screener", to: "/company-screener" },
];

const DROPDOWN_LINKS = [
  { label: "Watchlist", to: "/watchlist" },
  { label: "Market Insights", to: "/market-insights" },
  { label: "Community", to: "/community" },
  { label: "My Wallet", to: "/wallet" },
  { label: "Contact Us", to: "/contact" },
];

const navLinkClasses = ({ isActive }) =>
  `px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
    isActive
      ? "text-white bg-navy dark:text-navy dark:bg-white shadow-xs"
      : "text-ink/50 hover:text-ink hover:bg-ink/5 dark:text-dark-text/60 dark:hover:text-dark-text dark:hover:bg-white/10"
  }`;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    
    setNotifications(getNotifications(user?.email));

    const handleUpdate = () => {
      setNotifications(getNotifications(user?.email));
    };

    window.addEventListener("investai-notifications-update", handleUpdate);
    return () => {
      window.removeEventListener("investai-notifications-update", handleUpdate);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      markNotificationsRead(user?.email);
    }
  };
  const visibleLinks = user?.role === "admin"
    ? [{ label: "Admin Panel", to: "/admin" }]
    : NAV_LINKS;

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md border-b border-ink/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-sans font-extrabold text-lg shrink-0">
          <svg className="w-5.5 h-5.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          <span className="text-ink tracking-tight font-extrabold text-lg">
            Invest<span className="text-gold">AI</span>
          </span>
        </Link>

        {}
        <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
          {user?.role === "admin" ? (
            <NavLink to="/admin" className={navLinkClasses}>
              Admin Panel
            </NavLink>
          ) : (
            <>
              {PRIMARY_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClasses}>
                  {link.label}
                </NavLink>
              ))}

              {}
              <div
                className="relative"
                onMouseEnter={() => setMoreOpen(true)}
                onMouseLeave={() => setMoreOpen(false)}
              >
                <button
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                    moreOpen || DROPDOWN_LINKS.some(link => window.location.pathname === link.to)
                      ? "text-white bg-navy dark:text-navy dark:bg-white shadow-xs"
                      : "text-ink/50 hover:text-ink hover:bg-ink/5 dark:text-dark-text/60 dark:hover:text-dark-text dark:hover:bg-white/10"
                  }`}
                >
                  More
                  <span className="text-[8px] transition-transform duration-200 inline-block" style={{ transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </button>

                {moreOpen && (
                  <div className="absolute left-0 mt-1 w-48 bg-paper rounded-2xl shadow-2xl border border-ink/10 py-2.5 z-50 animate-scaleIn">
                    {DROPDOWN_LINKS.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-cream/20 transition-all ${
                            isActive
                              ? "text-navy dark:text-gold bg-cream/10"
                              : "text-ink/65 hover:text-ink dark:text-dark-text/75 dark:hover:text-dark-text"
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {user?.role !== "admin" && (
          <div className="flex-1 hidden md:flex justify-center">
            <SearchBar />
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto lg:ml-0">
          {user?.role !== "admin" && (
            <div className="relative">
              <button
                onClick={handleNotifClick}
                className="p-2 rounded-lg hover:bg-ink/5 hover:scale-105 active:scale-95 transition-all relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-ink/60" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-caution rounded-full animate-pulse shadow-sm" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-paper rounded-2xl shadow-2xl border border-ink/10 overflow-hidden z-50 animate-scaleIn">
                  <div className="bg-cream/20 px-4 py-3.5 border-b border-ink/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-ink uppercase tracking-wider">Notifications</span>
                    <button
                      onClick={() => clearNotifications(user?.email)}
                      className="text-[10px] text-ink/40 hover:text-caution hover:bg-caution/5 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto divide-y divide-ink/5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-ink/40 text-center py-10 font-medium">No notifications yet 🔔</p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 hover:bg-cream/10 border-l-4 border-l-transparent hover:border-l-navy dark:hover:border-l-gold hover:pl-3.5 transition-all duration-200 text-left relative ${
                            item.isUnread ? "bg-navy/3 border-l-navy/20 dark:bg-gold/3 dark:border-l-gold/30" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[9px] font-bold text-navy dark:text-gold uppercase bg-navy/10 dark:bg-gold/10 px-2 py-0.5 rounded-md">
                              {item.category}
                            </span>
                            <span className="text-[9px] text-ink/40 font-semibold">{item.time}</span>
                          </div>
                          <h5 className="font-semibold text-ink text-xs leading-snug">
                            {item.title}
                          </h5>
                          <p className="text-ink/65 text-[10px] leading-relaxed mt-1">
                            {item.desc}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user?.role !== "admin" && (
            <Link
              to="/dashboard"
              className="p-2 rounded-lg hover:bg-ink/5 transition"
              aria-label="Saved reports"
            >
              <Bookmark className="w-5 h-5 text-ink/60" />
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-ink/5 transition text-ink/60 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <UserMenu />
          ) : (
            <Link
              to="/login"
              className="ml-1 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium hover:bg-navy/90 transition"
            >
              Log in
            </Link>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2 rounded-lg hover:bg-ink/5 transition"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-ink/5 px-4 py-4 space-y-3">
          {user?.role !== "admin" && <SearchBar />}
          <nav className="flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={navLinkClasses}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;

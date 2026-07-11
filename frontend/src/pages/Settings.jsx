import { useState } from "react";
import { User, Shield, Sliders, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api/user";

const Settings = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form States
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Preference States
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfile({
        name,
        ...(password ? { password } : {}),
      });

      // Update auth context state by reloading or using token
      if (res.data?.user) {
        const token = localStorage.getItem("token");
        // re-save same token to trigger context sync or manually update user
        localStorage.setItem("user", JSON.stringify(res.data.user));
        // Force reload page to sync authentication context cleanly
        setSuccess("Profile updated successfully!");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceSave = (e) => {
    e.preventDefault();
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setSuccess("Preferences saved successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <p className="text-ink/50 text-sm mt-1">Manage your account preferences and configurations</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-3 md:pb-0">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition w-full text-left whitespace-nowrap ${
                activeTab === "profile"
                  ? "bg-navy text-white shadow-card"
                  : "text-ink/60 hover:text-ink hover:bg-cream/60"
              }`}
            >
              <User className="w-4 h-4" />
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition w-full text-left whitespace-nowrap ${
                activeTab === "preferences"
                  ? "bg-navy text-white shadow-card"
                  : "text-ink/60 hover:text-ink hover:bg-cream/60"
              }`}
            >
              <Sliders className="w-4 h-4" />
              System Preferences
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition w-full text-left whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-navy text-white shadow-card"
                  : "text-ink/60 hover:text-ink hover:bg-cream/60"
              }`}
            >
              <Shield className="w-4 h-4" />
              Developer Keys
            </button>
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 bg-paper border border-ink/5 rounded-2xl p-6 sm:p-8 shadow-card">
          {success && (
            <div className="mb-6 flex items-center gap-2.5 text-sm text-positive bg-positive/10 border border-positive/20 rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-2.5 text-sm text-caution bg-caution/10 border border-caution/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <h3 className="font-display font-semibold text-ink mb-1">Profile Information</h3>
                <p className="text-xs text-ink/50">Update your account name and security passwords</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1.5">Email Address</label>
                  <input
                    disabled
                    type="email"
                    value={user?.email || ""}
                    className="w-full bg-cream/40 border border-ink/10 rounded-xl px-4 py-2.5 text-sm text-ink/50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1.5">Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>

                <div className="border-t border-ink/5 pt-4">
                  <h4 className="text-xs font-semibold text-ink/70 mb-3">Change Password</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs text-ink/65 mb-1">New Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink/65 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-medium hover:bg-navy/90 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}

          {activeTab === "preferences" && (
            <form onSubmit={handlePreferenceSave} className="space-y-6">
              <div>
                <h3 className="font-display font-semibold text-ink mb-1">System Preferences</h3>
                <p className="text-xs text-ink/50">Personalize styling and AI confidence settings</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1.5">Visual Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition text-center ${
                        theme === "light"
                          ? "border-gold bg-gold/5 text-navy font-semibold"
                          : "border-ink/10 hover:bg-cream/40 text-ink/65"
                      }`}
                    >
                      Light Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition text-center ${
                        theme === "dark"
                          ? "border-gold bg-gold/5 text-navy font-semibold"
                          : "border-ink/10 hover:bg-cream/40 text-ink/65"
                      }`}
                    >
                      Dark Mode (Glassmorphic)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1.5">
                    Default AI Confidence Threshold ({confidenceThreshold}%)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full accent-gold bg-cream"
                  />
                  <p className="text-xxs text-ink/40 mt-1">
                    Reports with confidence ratings below this mark will flag caution warnings.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-navy text-white text-sm font-medium hover:bg-navy/90 transition"
              >
                Save Preferences
              </button>
            </form>
          )}

          {activeTab === "security" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display font-semibold text-ink mb-1">Developer Keys & AI Settings</h3>
                <p className="text-xs text-ink/50">Manage default servers and swappable model configurations</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1.5">LLM Model Provider</label>
                  <select
                    disabled
                    value={import.meta.env.VITE_LLM_PROVIDER || "gemini"}
                    className="w-full bg-cream/40 border border-ink/10 rounded-xl px-4 py-2.5 text-sm text-ink/60 cursor-not-allowed"
                  >
                    <option value="gemini">Gemini (Active Studio API)</option>
                    <option value="openai">OpenAI (GPT-4-mini)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1.5">Financial Core API</label>
                  <input
                    disabled
                    type="text"
                    value="Alpha Vantage Core Integration (Connected)"
                    className="w-full bg-cream/40 border border-ink/10 rounded-xl px-4 py-2.5 text-sm text-ink/50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="bg-cream/40 border border-ink/5 rounded-xl p-4 text-xs text-ink/60">
                <h4 className="font-semibold mb-1 text-navy">Deployment Note</h4>
                These keys and settings are loaded from the backend environment variables (`.env`). To override provider configs globally, modify files in [backend/.env](file:///c:/Users/eslav/Downloads/investai-project/investai/backend/.env).
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;

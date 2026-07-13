import { useEffect, useState } from "react";
import axios from "../api/axios";

// SVG icons for each provider
const GeminiIcon = () => (
  <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gem-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4285F4"/>
        <stop offset="50%" stopColor="#9B72CB"/>
        <stop offset="100%" stopColor="#D96570"/>
      </linearGradient>
    </defs>
    <path d="M14 2C14 2 8 8 8 14C8 20 14 26 14 26C14 26 20 20 20 14C20 8 14 2 14 2Z" fill="url(#gem-grad)"/>
    <path d="M2 14C2 14 8 8 14 8C20 8 26 14 26 14C26 14 20 20 14 20C8 20 2 14 2 14Z" fill="url(#gem-grad)" opacity="0.55"/>
  </svg>
);

const OpenAIIcon = () => (
  <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12" fill="#10a37f" opacity="0.12"/>
    <path d="M20.5 10.5C21.2 9.1 21 7.3 19.9 6.2C18.8 5.1 17 4.9 15.6 5.6C15 4.7 14 4 12.8 4C11 4 9.5 5.3 9.4 7.1C8 7.5 6.9 8.7 6.8 10.2C5.4 10.8 4.5 12.2 4.5 13.7C4.5 15.5 5.7 17.1 7.5 17.5C7.5 19.3 8.9 20.8 10.7 20.8C11.3 20.8 11.9 20.6 12.4 20.3C12.9 21.2 13.8 21.8 14.9 21.8C16.5 21.8 17.9 20.7 18.1 19.1C19.5 18.9 20.7 17.9 21.1 16.5C22.2 16 23 14.9 23 13.6C23 12 22 10.6 20.5 10.5Z" fill="#10a37f" opacity="0.85"/>
    <circle cx="14" cy="14" r="2.5" fill="white"/>
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12" fill="#D97757" opacity="0.15"/>
    <path d="M8 10L14 7L20 10L20 18L14 21L8 18Z" fill="#D97757" opacity="0.85"/>
    <path d="M14 7L14 21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 10L20 18" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    <path d="M20 10L8 18" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const ICON_MAP = {
  gemini: GeminiIcon,
  openai: OpenAIIcon,
  claude: ClaudeIcon,
};

const GRADIENT_MAP = {
  gemini: "from-blue-500/10 via-purple-500/10 to-pink-500/10",
  openai: "from-emerald-500/10 to-teal-500/10",
  claude: "from-orange-400/10 to-rose-400/10",
};

const RING_MAP = {
  gemini: "ring-blue-500/50",
  openai: "ring-emerald-500/50",
  claude: "ring-orange-400/50",
};

const TAG_COLOR_MAP = {
  gemini: "bg-blue-500/15 text-blue-600",
  openai: "bg-emerald-500/15 text-emerald-700",
  claude: "bg-orange-400/15 text-orange-600",
};

/**
 * AgentSelector — a card-picker for choosing the AI provider
 * @param {string} selected - currently selected provider id
 * @param {function} onSelect - callback when a card is clicked
 */
const AgentSelector = ({ selected, onSelect }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/research/agents")
      .then((res) => setAgents(res.data))
      .catch(() =>
        // Fallback if endpoint fails
        setAgents([
          { id: "gemini", name: "Gemini 2.5 Flash", provider: "Google", tag: "Fast & Smart", description: "Google's latest multimodal model.", icon: "gemini", available: true, isDefault: true },
          { id: "openai", name: "GPT-4o Mini", provider: "OpenAI", tag: "Reliable", description: "OpenAI's efficient GPT-4o variant.", icon: "openai", available: false, isDefault: false },
          { id: "claude", name: "Claude 3.5 Sonnet", provider: "Anthropic", tag: "Deep Reasoning", description: "Anthropic's Claude with strong reasoning.", icon: "claude", available: false, isDefault: false },
        ])
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 justify-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-40 rounded-2xl bg-ink/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-ink/40 uppercase tracking-widest mb-3 text-center">
        Choose AI Agent
      </p>
      <div className="grid grid-cols-3 gap-3">
        {agents.map((agent) => {
          const Icon = ICON_MAP[agent.icon] || GeminiIcon;
          const isSelected = selected === agent.id;
          const isDisabled = !agent.available;

          return (
            <div key={agent.id} className="relative group">
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onSelect(agent.id)}
                title={isDisabled ? `No API key configured for ${agent.provider}` : agent.description}
                className={[
                  "w-full relative flex flex-col items-start gap-2 p-3.5 rounded-2xl border text-left transition-all duration-200",
                  `bg-gradient-to-br ${GRADIENT_MAP[agent.icon]}`,
                  isSelected
                    ? `ring-2 ${RING_MAP[agent.icon]} border-transparent shadow-lg scale-[1.02]`
                    : "border-ink/10 hover:border-ink/20 hover:shadow-md hover:scale-[1.01]",
                  isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                {/* Header row */}
                <div className="flex items-center justify-between w-full">
                  <Icon />
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-positive flex items-center justify-center shadow-sm">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                  {isDisabled && (
                    <span className="text-[9px] font-bold text-ink/30 bg-ink/5 px-1.5 py-0.5 rounded-full border border-ink/10">
                      No Key
                    </span>
                  )}
                </div>

                {/* Name + provider */}
                <div>
                  <p className="text-xs font-bold text-ink leading-tight">{agent.name}</p>
                  <p className="text-[10px] text-ink/40 font-medium">{agent.provider}</p>
                </div>

                {/* Tag */}
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${TAG_COLOR_MAP[agent.icon]}`}>
                  {agent.tag}
                </span>
              </button>

              {/* Tooltip for disabled */}
              {isDisabled && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-44 text-center">
                  <div className="bg-navy text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg">
                    Add <span className="font-mono font-bold">{agent.provider.toUpperCase()}_API_KEY</span> to backend .env to enable
                  </div>
                  <div className="w-2 h-2 bg-navy rotate-45 mx-auto -mt-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentSelector;

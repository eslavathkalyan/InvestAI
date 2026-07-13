import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";

/**
 * Returns an LLM instance for the given provider.
 * Falls back to process.env.LLM_PROVIDER, then to "gemini".
 * @param {string} [provider] - "gemini" | "openai" | "claude"
 */
const getLLM = (provider) => {
  const resolved = (provider || process.env.LLM_PROVIDER || "gemini").toLowerCase();

  if (resolved === "openai") {
    return new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.3,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  if (resolved === "claude" || resolved === "anthropic") {
    return new ChatAnthropic({
      model: "claude-3-5-sonnet-20240620",
      temperature: 0.3,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  // Default: Gemini
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.3,
    apiKey: process.env.GOOGLE_API_KEY,
  });
};

/**
 * Returns metadata about all supported AI agents,
 * including whether their API key is configured.
 */
export const getAvailableAgents = () => {
  return [
    {
      id: "gemini",
      name: "Gemini 2.5 Flash",
      provider: "Google",
      tag: "Fast & Smart",
      description: "Google's latest multimodal model. Excellent at financial reasoning.",
      icon: "gemini",
      available: !!process.env.GOOGLE_API_KEY,
      isDefault: true,
    },
    {
      id: "openai",
      name: "GPT-4o Mini",
      provider: "OpenAI",
      tag: "Reliable",
      description: "OpenAI's efficient GPT-4o variant. Great at structured analysis.",
      icon: "openai",
      available: !!process.env.OPENAI_API_KEY,
      isDefault: false,
    },
    {
      id: "claude",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      tag: "Deep Reasoning",
      description: "Anthropic's Claude with strong analytical and reasoning capabilities.",
      icon: "claude",
      available: !!process.env.ANTHROPIC_API_KEY,
      isDefault: false,
    },
  ];
};

export default getLLM;

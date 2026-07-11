import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";

const getLLM = () => {
  const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase();

  if (provider === "openai") {
    return new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.3,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  if (provider === "claude" || provider === "anthropic") {
    return new ChatAnthropic({
      model: "claude-3-5-sonnet-20240620",
      temperature: 0.3,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.3,
    apiKey: process.env.GOOGLE_API_KEY,
  });
};

export default getLLM;

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

// Every agent calls this instead of constructing ChatOpenAI or
// ChatGoogleGenerativeAI directly. That means switching providers,
// for the whole app or just testing, is a one-line env var change
// instead of an edit in five separate agent files.
//
// Gemini is the default on purpose: Google AI Studio's free tier
// needs no credit card and has no expiry date, so this project runs
// at zero cost out of the box. Set LLM_PROVIDER=openai in .env to
// use OpenAI instead (useful if you already have OpenAI credits, or
// want to compare output quality between the two).
const getLLM = () => {
  const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase();

  if (provider === "openai") {
    return new ChatOpenAI({
      model: "gpt-5.4-mini",
      temperature: 0.3,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.3,
    apiKey: process.env.GOOGLE_API_KEY,
  });
};

export default getLLM;

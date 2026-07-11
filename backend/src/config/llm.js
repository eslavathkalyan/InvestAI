import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

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

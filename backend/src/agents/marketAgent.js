import { z } from "zod";
import getLLM from "../config/llm.js";

const marketSchema = z.object({
  industry: z.string().describe("The industry or sector this company operates in"),
  trends: z.array(z.string()).describe("Key trends currently affecting this industry"),
  competitivePosition: z
    .string()
    .describe("How this company is positioned relative to its competitors"),
});

const runMarketAgent = async (state) => {
  const llm = getLLM().withStructuredOutput(marketSchema, {
    name: "MarketAnalysis",
  });

  const result = await llm.invoke([
    {
      role: "system",
      content:
        "You are a market analyst. Focus on industry-level dynamics and " +
        "competitive positioning -- leave financial metrics and specific " +
        "risks to the other analysts on the team.",
    },
    {
      role: "user",
      content: `Company: ${state.company}\nBusiness context: ${
        state.companyOverview?.overview ?? "unknown"
      }\nKnown competitors: ${
        (state.companyOverview?.competitors ?? []).join(", ") || "unknown"
      }\n\nAnalyze the industry this company operates in, current trends affecting it, and how the company is positioned against its competitors.`,
    },
  ]);

  return { market: result };
};

export default runMarketAgent;

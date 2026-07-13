import { z } from "zod";
import getLLM from "../config/llm.js";

const riskSchema = z.object({
  weaknesses: z.array(z.string()).describe("Internal weaknesses of the company"),
  threats: z.array(z.string()).describe("External threats the company faces"),
  overallRiskLevel: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .describe("Overall risk level considering all factors"),
});

const runRiskAgent = async (state) => {
  const llm = getLLM(state.provider).withStructuredOutput(riskSchema, { name: "RiskAnalysis" });

  const result = await llm.invoke([
    {
      role: "system",
      content:
        "You are a risk analyst. Be specific to this company -- avoid " +
        "generic filler like 'market volatility' unless you explain why " +
        "it specifically applies here.",
    },
    {
      role: "user",
      content: `Company: ${state.company}\nBusiness context: ${
        state.companyOverview?.overview ?? "unknown"
      }\n\nIdentify this company's key internal weaknesses and external threats, then rate its overall risk level.`,
    },
  ]);

  return { risk: result };
};

export default runRiskAgent;

import { z } from "zod";
import getLLM from "../config/llm.js";

const decisionSchema = z.object({
  decision: z.enum(["INVEST", "PASS"]),
  confidence: z.number().min(0).max(100).describe("Confidence in this decision, 0-100"),
  summary: z.string().describe("A 2-4 sentence investment thesis explaining the decision"),
  positiveFactors: z.array(z.string()).describe("The strongest reasons in favor of investing"),
  risks: z.array(z.string()).describe("The strongest reasons for caution"),
});

const runDecisionAgent = async (state) => {
  const llm = getLLM().withStructuredOutput(decisionSchema, {
    name: "InvestmentDecision",
  });

  const result = await llm.invoke([
    {
      role: "system",
      content:
        "You are the lead analyst making the final investment call. Weigh " +
        "the research below and decide INVEST or PASS -- don't hedge by " +
        "avoiding a clear call. Confidence should reflect genuine certainty; " +
        "do not default to a 'safe-looking' number in the low 70s.",
    },
    {
      role: "user",
      content: `
Company: ${state.company}

Business overview: ${JSON.stringify(state.companyOverview)}

Financial analysis: ${JSON.stringify(state.financial)}

Market analysis: ${JSON.stringify(state.market)}

Risk analysis: ${JSON.stringify(state.risk)}

Based on all of the above, make a final INVEST or PASS decision.
      `.trim(),
    },
  ]);

  return { decision: result };
};

export default runDecisionAgent;

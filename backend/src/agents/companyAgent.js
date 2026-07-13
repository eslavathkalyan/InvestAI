import { z } from "zod";
import getLLM from "../config/llm.js";

const companySchema = z.object({
  overview: z
    .string()
    .describe("A 2-3 sentence plain-English summary of what the company does"),
  products: z.array(z.string()).describe("The company's main products or services"),
  businessModel: z.string().describe("How the company actually makes money"),
  competitors: z.array(z.string()).describe("The company's main competitors"),
});

const runCompanyAgent = async (state) => {
  const llm = getLLM(state.provider).withStructuredOutput(companySchema, {
    name: "CompanyOverview",
  });

  const result = await llm.invoke([
    {
      role: "system",
      content:
        "You are a financial analyst doing initial company research. " +
        "Be factual and concise. If you are not confident about a specific " +
        "detail, say so in plain language rather than inventing specifics.",
    },
    {
      role: "user",
      content: `Research the company "${state.company}". Explain what it does, its main products or services, how it makes money, and who its main competitors are.`,
    },
  ]);

  return { companyOverview: result };
};

export default runCompanyAgent;

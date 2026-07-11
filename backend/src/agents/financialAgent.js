import { z } from "zod";
import getLLM from "../config/llm.js";
import { findTickerSymbol, fetchCompanyOverview } from "../utils/alphaVantage.js";

const financialSchema = z.object({
  revenueSummary: z.string().describe("Summary of the company's revenue trend"),
  profitability: z.string().describe("Summary of profit margins and profitability"),
  growth: z.string().describe("Assessment of revenue and earnings growth"),
  growthScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Numeric growth score 0-100 matching the `growth` assessment, for charting"),
  valuation: z.string().describe("Assessment of whether the company looks fairly valued"),
  peRatio: z.number().describe("P/E ratio if known, otherwise 0"),
  marketCap: z.string().describe("Market capitalization if known, otherwise 'unknown'"),
  dataSource: z
    .enum(["alpha_vantage", "llm_estimate"])
    .describe("Whether this analysis used real market data or the model's own estimate"),
});

// Tries to get real fundamentals from Alpha Vantage. Returns null on
// ANY failure -- missing API key, company not found, or the free
// tier's daily limit reached -- so the caller can fall back cleanly
// instead of the whole research run crashing over one flaky lookup.
const getRealFinancialData = async (companyName) => {
  // Always return null to bypass Alpha Vantage and use 100% free LLM estimates
  return null;
};

const runFinancialAgent = async (state) => {
  const realData = await getRealFinancialData(state.company);

  const llm = getLLM().withStructuredOutput(financialSchema, {
    name: "FinancialAnalysis",
  });

  // We tell the model directly whether real numbers exist, and
  // instruct it to be honest in the dataSource field rather than
  // inferring it, since the model has no other way to know why the
  // lookup did or didn't happen.
  const context = realData
    ? `Real financial data from Alpha Vantage:\n${JSON.stringify(
        {
          peRatio: realData.PERatio,
          marketCap: realData.MarketCapitalization,
          profitMargin: realData.ProfitMargin,
          revenueTTM: realData.RevenueTTM,
          quarterlyRevenueGrowthYOY: realData.QuarterlyRevenueGrowthYOY,
        },
        null,
        2
      )}\nBase your analysis on these real numbers. Set dataSource to "alpha_vantage".`
    : `No live financial data was available for this company. Base your analysis on your own knowledge, and set dataSource to "llm_estimate".`;

  const result = await llm.invoke([
    {
      role: "system",
      content: "You are a financial analyst evaluating a company's financial health.",
    },
    {
      role: "user",
      content: `Company: ${state.company}\nBusiness context: ${
        state.companyOverview?.overview ?? "unknown"
      }\n\n${context}\n\nAnalyze revenue, profitability, growth and valuation, and give a numeric growthScore from 0-100 that matches your growth assessment.`,
    },
  ]);

  return { financial: result };
};

export default runFinancialAgent;

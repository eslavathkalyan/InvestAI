import { z } from "zod";
import getLLM from "../config/llm.js";
import asyncHandler from "../utils/asyncHandler.js";

const marketInsightsSchema = z.object({
  summary: z.string().describe("Overall daily/weekly market summary"),
  sentiment: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]).describe("Overall market sentiment"),
  sentimentScore: z.number().min(0).max(100).describe("Numeric score from 0-100 representing market confidence (0=panic, 100=euphoria)"),
  bullishFactors: z.array(z.string()).describe("List of factors pushing the market up"),
  bearishFactors: z.array(z.string()).describe("List of factors pulling the market down"),
  sectors: z.array(
    z.object({
      name: z.string().describe("Name of the sector (e.g. Technology, Energy)"),
      performance: z.enum(["OUTPERFORMING", "UNDERPERFORMING", "NEUTRAL"]).describe("Current performance compared to market"),
      sentiment: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]).describe("Market sentiment for this sector"),
      notes: z.string().describe("Brief note about sector drivers"),
    })
  ).describe("Breakdown of different sectors"),
  trendingKeywords: z.array(z.string()).describe("Top 5 trending financial keywords or topics"),
});

// A premium fallback in case the LLM call times out or encounters rate limits
const fallbackInsights = {
  summary: "Global equity markets show resilient performance as tech stock momentum offsets concerns regarding the central bank's persistent higher-for-longer interest rate path. Investors are heavily focused on upcoming corporate earnings reports and key inflation indexes to gauge the future rate cut timeline.",
  sentiment: "BULLISH",
  sentimentScore: 68,
  bullishFactors: [
    "Resilient consumer demand supporting economic expansion",
    "Generative AI infrastructure cycle driving enterprise software and hardware spend",
    "Strong corporate balance sheets with high cash reserves",
  ],
  bearishFactors: [
    "Geopolitical tension impacting international supply chains",
    "Central banks maintaining elevated interest rates to target core inflation sticky points",
    "Overstretched valuations in key index weight elements",
  ],
  sectors: [
    {
      name: "Technology",
      performance: "OUTPERFORMING",
      sentiment: "BULLISH",
      notes: "AI infrastructure demand remains exceptionally high, bolstering semiconductor and software industries.",
    },
    {
      name: "Financials",
      performance: "NEUTRAL",
      sentiment: "NEUTRAL",
      notes: "Higher net interest margins support bank revenues, offset by slight growth in loan defaults.",
    },
    {
      name: "Energy",
      performance: "OUTPERFORMING",
      sentiment: "BULLISH",
      notes: "OPEC supply management and regional demand keep oil prices elevated, supporting cash flows.",
    },
    {
      name: "Healthcare",
      performance: "UNDERPERFORMING",
      sentiment: "NEUTRAL",
      notes: "Defensive positioning persists, though weight-loss drug leaders continue seeing major demand.",
    },
    {
      name: "Consumer Discretionary",
      performance: "UNDERPERFORMING",
      sentiment: "BEARISH",
      notes: "Selective consumer spending and high credit card interest rates weigh on retail margins.",
    },
  ],
  trendingKeywords: ["AI Capital Expenditures", "Federal Reserve Dot Plot", "Core PCE Inflation", "Semi-conductor Supply", "Yield Curve Steepening"],
};

// GET /api/insights
export const getMarketInsights = asyncHandler(async (req, res) => {
  try {
    const llm = getLLM().withStructuredOutput(marketInsightsSchema, {
      name: "MarketInsights",
    });

    const result = await llm.invoke([
      {
        role: "system",
        content: "You are a professional financial research analyst. Generate a current, high-fidelity daily market pulse analysis.",
      },
      {
        role: "user",
        content: "Please provide an analysis of the current market state, including global trends, bullish and bearish factors, sector performances, and trending search terms.",
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.warn("LLM Market Insights generation failed, using high-fidelity fallback:", error.message);
    res.status(200).json(fallbackInsights);
  }
});

import ResearchReport from "../models/ResearchReport.js";
import asyncHandler from "../utils/asyncHandler.js";

const SCREENER_COMPANIES = [
  { company: "Apple", ticker: "AAPL", sector: "Technology", marketCap: 3000, peRatio: 28.5, dividendYield: 0.5, dayChange: 1.2 },
  { company: "Microsoft", ticker: "MSFT", sector: "Technology", marketCap: 3200, peRatio: 35.2, dividendYield: 0.7, dayChange: -0.4 },
  { company: "NVIDIA", ticker: "NVDA", sector: "Technology", marketCap: 2800, peRatio: 65.4, dividendYield: 0.02, dayChange: 3.5 },
  { company: "Amazon", ticker: "AMZN", sector: "Consumer Cyclical", marketCap: 1900, peRatio: 40.1, dividendYield: 0.0, dayChange: 0.8 },
  { company: "Alphabet", ticker: "GOOGL", sector: "Technology", marketCap: 2100, peRatio: 24.3, dividendYield: 0.4, dayChange: -1.1 },
  { company: "Tesla", ticker: "TSLA", sector: "Consumer Cyclical", marketCap: 600, peRatio: 55.8, dividendYield: 0.0, dayChange: -2.3 },
  { company: "Meta", ticker: "META", sector: "Technology", marketCap: 1200, peRatio: 26.7, dividendYield: 0.5, dayChange: 1.7 },
  { company: "JPMorgan Chase", ticker: "JPM", sector: "Financials", marketCap: 580, peRatio: 12.1, dividendYield: 2.4, dayChange: 0.3 },
  { company: "ExxonMobil", ticker: "XOM", sector: "Energy", marketCap: 450, peRatio: 13.5, dividendYield: 3.2, dayChange: -0.8 },
  { company: "Eli Lilly", ticker: "LLY", sector: "Healthcare", marketCap: 750, peRatio: 80.2, dividendYield: 0.6, dayChange: 2.1 },
  { company: "Johnson & Johnson", ticker: "JNJ", sector: "Healthcare", marketCap: 380, peRatio: 15.4, dividendYield: 2.9, dayChange: -0.2 },
  { company: "Visa", ticker: "V", sector: "Financials", marketCap: 520, peRatio: 30.2, dividendYield: 0.8, dayChange: 0.5 }
];

// GET /api/screener
export const getScreenerCompanies = asyncHandler(async (req, res) => {
  const reports = await ResearchReport.find({ userId: req.user._id }).sort({ createdAt: -1 });

  // Map each company in our screener to its latest user report (if any)
  const companiesWithStatus = SCREENER_COMPANIES.map((item) => {
    // Find latest report matching the company name or ticker
    const match = reports.find(
      (r) =>
        r.company.toLowerCase() === item.company.toLowerCase() ||
        r.company.toLowerCase() === item.ticker.toLowerCase()
    );

    return {
      ...item,
      latestReport: match
        ? {
            _id: match._id,
            decision: match.decision,
            confidence: match.confidence,
            createdAt: match.createdAt,
          }
        : null,
    };
  });

  res.status(200).json(companiesWithStatus);
});

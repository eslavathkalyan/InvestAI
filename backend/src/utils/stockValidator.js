import getLLM from "../config/llm.js";
import { z } from "zod";

const validationSchema = z.object({
  isValid: z.boolean().describe("true if this is a real, publicly traded company on a major global stock exchange, false otherwise"),
  explanation: z.string().describe("Brief explanation of why it is valid or invalid")
});

const COMMON_STOCKS = new Set([
  // Tickers
  "AAPL", "TSLA", "MSFT", "GOOG", "GOOGL", "AMZN", "NVDA", "META", "NFLX", "AMD", 
  "INTC", "PYPL", "ADBE", "QCOM", "TXN", "AMAT", "MU", "AMGN", "HON", "SBUX", 
  "COST", "CHTR", "GILD", "CMCSA", "FISV", "MDLZ", "REGN", "INTU", "VRTX", "ADP", 
  "ISRG", "TMUS", "MELI", "BKNG", "JD", "KDP", "ADSK", "LMT", "EXC", "BIIB", 
  "WBA", "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "WIPRO", "SBIN", 
  "TATAMOTORS", "COALINDIA", "BHARTIARTL", "NIFTY", "SENSEX", "SPY", "VOO", "QQQ",
  // Names
  "APPLE", "TESLA", "MICROSOFT", "GOOGLE", "ALPHABET", "AMAZON", "NVIDIA", "FACEBOOK", 
  "NETFLIX", "INTEL", "PAYPAL", "ADOBE", "QUALCOMM", "STARBUCKS", "COSTCO", "COMCAST", 
  "INFOSYS", "RELIANCE INDUSTRIES", "TATA CONSULTANCY SERVICES", "TATA MOTORS",
  "COAL INDIA", "BHARTI AIRTEL"
]);

const isGibberish = (str) => {
  const clean = str.toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length < 3) return false;
  
  // If word is longer than 5 chars and has no vowels, it's gibberish
  if (clean.length > 5 && !/[aeiouy]/.test(clean)) {
    return true;
  }
  
  // Repeating consecutive letters like "aaaaa" or "qweqweqwe"
  if (/(.)\1\1\1/.test(clean)) {
    return true;
  }
  
  return false;
};

const normalizeName = (name) => {
  return name
    .toUpperCase()
    .replace(/\b(INC|CORP|LTD|CO|PLC|GMBH|HOLDINGS|GROUP|LIMITED|CORPORATION|INCORPORATED)\b\.?/g, "")
    .replace(/[^A-Z0-9\s]/g, "")
    .trim();
};

const queryYahooFinance = async (query) => {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=0`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.quotes || [];
  } catch (err) {
    console.error("Yahoo Finance query failed:", err);
    return null;
  }
};

const queryAlphaVantage = async (query) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return { status: "no_key" };

  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
    query
  )}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data?.Note || data?.Information) {
      return { status: "rate_limited" };
    }
    if (data?.Error || data?.["Error Message"]) {
      return { status: "error" };
    }

    const matches = data?.bestMatches || [];
    return { status: "success", count: matches.length };
  } catch (err) {
    console.error("Alpha Vantage validation error:", err);
    return { status: "network_error" };
  }
};

export const validateStockMarketPresence = async (companyName) => {
  if (!companyName || !companyName.trim()) {
    return { isValid: false, message: "Please enter a valid company name or ticker symbol." };
  }

  const query = companyName.trim();
  const normalized = normalizeName(query);

  // 1. Local Gibberish check
  if (isGibberish(query)) {
    return {
      isValid: false,
      message: `"${query}" does not appear to be a valid company name or ticker symbol. Please check the spelling or change the company name to get a valid research result.`
    };
  }

  // 2. Query Yahoo Finance search API (no rate limits, no keys, highly accurate)
  const yahooQuotes = await queryYahooFinance(query);
  if (yahooQuotes !== null) {
    if (yahooQuotes.length === 0) {
      return {
        isValid: false,
        message: `"${query}" was not found in the stock market registry. Please check the spelling or change the company name/ticker symbol to get a valid research result.`
      };
    } else {
      // It has matches, return valid!
      return { isValid: true, message: "Valid stock" };
    }
  }

  // 3. Fallback to local registry if Yahoo Finance is down
  if (COMMON_STOCKS.has(normalized)) {
    return { isValid: true, message: "Valid stock" };
  }
  for (const item of COMMON_STOCKS) {
    if (normalized.includes(item) || item.includes(normalized)) {
      return { isValid: true, message: "Valid stock" };
    }
  }

  // 4. Live Alpha Vantage check (as secondary fallback)
  const avResult = await queryAlphaVantage(query);
  if (avResult.status === "success") {
    if (avResult.count > 0) {
      return { isValid: true, message: "Valid stock" };
    } else {
      return {
        isValid: false,
        message: `"${query}" was not found in the stock market registry. Please check the spelling or change the company name/ticker symbol to get a valid research result.`
      };
    }
  }

  // 5. LLM structured audit fallback
  try {
    const llm = getLLM().withStructuredOutput(validationSchema, {
      name: "StockValidation"
    });

    const result = await llm.invoke([
      {
        role: "system",
        content: "You are an expert stock market registry auditor. Your job is to verify if a user-supplied name or ticker symbol refers to a real, publicly traded company on any major global stock exchange. Return isValid=false if the name is a general noun, gibberish letters, fake/non-existent company, or a private entity that is not publicly traded. Be strict."
      },
      {
        role: "user",
        content: `Is "${query}" a real publicly traded company?`
      }
    ]);

    return {
      isValid: result.isValid,
      message: result.isValid 
        ? "Valid stock" 
        : `"${query}" does not appear to be a valid publicly traded stock. Please change the company name or ticker symbol to get a valid research result.`
    };
  } catch (error) {
    console.error("LLM Stock validation failed, defaulting to valid:", error);
    return { isValid: true, message: "Valid stock" };
  }
};

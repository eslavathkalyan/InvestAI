const BASE_URL = "https://www.alphavantage.co/query";

// Alpha Vantage's fundamental data endpoints need a ticker (e.g.
// "TSLA"), not a free-text company name, so this has to run before
// we can fetch any real financials.
export const findTickerSymbol = async (companyName) => {
  const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(
    companyName
  )}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  const bestMatch = data?.bestMatches?.[0];
  if (!bestMatch) {
    throw new Error(`No ticker symbol found for "${companyName}"`);
  }

  return bestMatch["1. symbol"];
};

// Fetches company fundamentals (P/E ratio, market cap, margins,
// revenue growth, etc.) for a given ticker.
export const fetchCompanyOverview = async (ticker) => {
  const url = `${BASE_URL}?function=OVERVIEW&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  // Alpha Vantage returns HTTP 200 even when the free tier's daily
  // limit is hit -- it just replaces the real payload with a "Note"
  // or "Information" field instead of returning a 429. So checking
  // response.ok is not enough; we have to check the payload itself
  // actually contains company data.
  if (!data || !data.Symbol) {
    throw new Error(
      "Alpha Vantage did not return usable data (rate limit reached, or unknown symbol)"
    );
  }

  return data;
};

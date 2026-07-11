const BASE_URL = "https://www.alphavantage.co/query";

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

export const fetchCompanyOverview = async (ticker) => {
  const url = `${BASE_URL}?function=OVERVIEW&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data || !data.Symbol) {
    throw new Error(
      "Alpha Vantage did not return usable data (rate limit reached, or unknown symbol)"
    );
  }

  return data;
};

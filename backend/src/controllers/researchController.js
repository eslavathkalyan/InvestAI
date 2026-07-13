import ResearchReport from "../models/ResearchReport.js";
import { runResearch, streamResearch } from "../agents/researchGraph.js";
import { getAvailableAgents } from "../config/llm.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validateStockMarketPresence } from "../utils/stockValidator.js";
import { runPythonSentimentAnalysis } from "../utils/pythonService.js";

const VALID_PROVIDERS = ["gemini", "openai", "claude"];

const saveReportFromState = (userId, state) => {
  let ticker = state.company.trim().toUpperCase();
  if (ticker.length > 5 || ticker.includes(" ")) {
    const words = ticker.split(/[\s\-]+/);
    if (words.length > 1) {
      ticker = words.map(w => w[0]).join("").substring(0, 4);
    } else {
      ticker = ticker.substring(0, 4);
    }
    ticker = ticker.replace(/[^A-Z]/g, "");
    if (!ticker) ticker = "TKR";
  }

  return ResearchReport.create({
    userId,
    company: state.company,
    ticker,
    provider: state.provider || "gemini",
    decision: state.decision.decision,
    confidence: state.decision.confidence,
    summary: state.decision.summary,
    positiveFactors: state.decision.positiveFactors,
    risks: state.decision.risks,
    analysis: {
      companyOverview: state.companyOverview,
      financial: state.financial,
      market: state.market,
      risk: state.risk,
      sentimentAnalysis: state.sentimentAnalysis || null,
    },
  });
};

const getAgents = asyncHandler(async (req, res) => {
  const agents = getAvailableAgents();
  res.status(200).json(agents);
});

const createResearch = asyncHandler(async (req, res) => {
  const { company, provider } = req.body;

  if (!company || !company.trim()) {
    return res.status(400).json({ message: "Please provide a company name" });
  }

  const resolvedProvider = VALID_PROVIDERS.includes(provider) ? provider : "gemini";

  const validation = await validateStockMarketPresence(company.trim());
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  // Run LangGraph and Python Sentiment script in parallel
  const [result, sentiment] = await Promise.all([
    runResearch(company.trim(), resolvedProvider),
    runPythonSentimentAnalysis(company.trim())
  ]);

  result.sentimentAnalysis = sentiment;
  const report = await saveReportFromState(req.user._id, result);

  res.status(201).json(report);
});

const streamResearchHandler = asyncHandler(async (req, res) => {
  const company = req.query.company?.trim();
  const provider = VALID_PROVIDERS.includes(req.query.provider) ? req.query.provider : "gemini";

  if (!company) {
    return res.status(400).json({ message: "Please provide a company name" });
  }

  const validation = await validateStockMarketPresence(company);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    let finalState = null;

    // Start Python sentiment analysis in parallel with LangGraph stream
    const sentimentPromise = runPythonSentimentAnalysis(company);

    for await (const event of streamResearch(company, provider)) {
      if (event.type === "result") {
        finalState = event.state;
      } else {
        send(event.type, event);
      }
    }

    const sentiment = await sentimentPromise;
    finalState.sentimentAnalysis = sentiment;

    const report = await saveReportFromState(req.user._id, finalState);
    send("done", report);
  } catch (error) {
    send("error", { message: error.message });
  } finally {
    res.end();
  }
});

const getMyReports = asyncHandler(async (req, res) => {
  const reports = await ResearchReport.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json(reports);
});

const getReportById = asyncHandler(async (req, res) => {
  const report = await ResearchReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  if (
    report.userId.toString() !== req.user._id.toString() &&
    !report.isShared &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "You do not have access to this report" });
  }

  res.status(200).json(report);
});

const shareReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isShared } = req.body;

  const report = await ResearchReport.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { isShared: !!isShared },
    { new: true }
  );

  if (!report) {
    return res.status(404).json({ message: "Report not found or unauthorized" });
  }

  res.status(200).json(report);
});

const getSharedReports = asyncHandler(async (req, res) => {
  const reports = await ResearchReport.find({ isShared: true })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(reports);
});

export { getAgents, createResearch, streamResearchHandler, getMyReports, getReportById, shareReport, getSharedReports };

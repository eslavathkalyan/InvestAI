import ResearchReport from "../models/ResearchReport.js";
import { runResearch, streamResearch } from "../agents/researchGraph.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validateStockMarketPresence } from "../utils/stockValidator.js";

// Both createResearch and streamResearchHandler end up with the same
// shape of finished state (from runResearch, or from accumulating
// streamResearch's chunks) and need to save it the same way. Pulled
// out once here instead of duplicating this field mapping twice.
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
    },
  });
};

// POST /api/research
// Runs the full 5-agent pipeline for a company and saves the result
// against the logged-in user, so it shows up in their history. Used
// by anything that just wants the final answer, with no interest in
// live progress.
const createResearch = asyncHandler(async (req, res) => {
  const { company } = req.body;

  if (!company || !company.trim()) {
    return res.status(400).json({ message: "Please provide a company name" });
  }

  const validation = await validateStockMarketPresence(company.trim());
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  const result = await runResearch(company.trim());
  const report = await saveReportFromState(req.user._id, result);

  res.status(201).json(report);
});

// GET /api/research/stream?company=Tesla
// Same pipeline, but streamed as Server-Sent Events so the 3D
// research page can show real progress instead of a fake timer.
//
// Note: this deliberately is NOT consumed with the browser's native
// EventSource on the frontend, because EventSource can't send a
// custom Authorization header, and every other request in this app
// authenticates that way. The frontend instead reads this response
// manually via fetch() + a stream reader, which does support the
// header - see frontend/src/api/streamResearch.js. Because of that,
// this route needs no special auth handling: `protect` (applied to
// the whole router below) works exactly like it does for any other
// route here.
const streamResearchHandler = asyncHandler(async (req, res) => {
  const company = req.query.company?.trim();

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

    for await (const event of streamResearch(company)) {
      if (event.type === "result") {
        finalState = event.state;
      } else {
        send(event.type, event);
      }
    }

    const report = await saveReportFromState(req.user._id, finalState);
    send("done", report);
  } catch (error) {
    send("error", { message: error.message });
  } finally {
    res.end();
  }
});

// GET /api/research
// The logged-in user's saved reports, most recent first.
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await ResearchReport.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json(reports);
});

// GET /api/research/:id
// A single report. Scoped to userId OR public if isShared is true.
const getReportById = asyncHandler(async (req, res) => {
  const report = await ResearchReport.findById(req.params.id);

  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  // Allow viewing if the report belongs to the user OR if it is shared with the community OR if the user is an admin
  if (
    report.userId.toString() !== req.user._id.toString() &&
    !report.isShared &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "You do not have access to this report" });
  }

  res.status(200).json(report);
});

// PUT /api/research/:id/share
// Toggles whether a research report is shared publicly in the community feed.
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

// GET /api/research/community/shared
// Retrieve all public reports from the community feed.
const getSharedReports = asyncHandler(async (req, res) => {
  const reports = await ResearchReport.find({ isShared: true })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(reports);
});

export { createResearch, streamResearchHandler, getMyReports, getReportById, shareReport, getSharedReports };

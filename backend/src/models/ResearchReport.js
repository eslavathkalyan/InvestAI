import mongoose from "mongoose";

const researchReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    ticker: {
      type: String,
      trim: true,
    },
    decision: {
      type: String,
      enum: ["INVEST", "PASS"],
      required: true,
    },
    confidence: {
      type: Number, 
      required: true,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
      required: true,
    },
    positiveFactors: {
      type: [String],
      default: [],
    },
    risks: {
      type: [String],
      default: [],
    },

    analysis: {
      companyOverview: { type: mongoose.Schema.Types.Mixed, default: {} },
      financial: { type: mongoose.Schema.Types.Mixed, default: {} },
      market: { type: mongoose.Schema.Types.Mixed, default: {} },
      risk: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    isShared: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

researchReportSchema.post("save", async function (doc) {
  try {
    const { query: pgQuery } = await import("../config/postgres.js");
    await pgQuery(
      `INSERT INTO reports (id, user_id, company, ticker, decision, confidence, summary) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (id) DO UPDATE SET 
       user_id = EXCLUDED.user_id,
       company = EXCLUDED.company,
       ticker = EXCLUDED.ticker,
       decision = EXCLUDED.decision,
       confidence = EXCLUDED.confidence,
       summary = EXCLUDED.summary`,
      [
        doc._id.toString(),
        doc.userId.toString(),
        doc.company,
        doc.ticker || null,
        doc.decision,
        doc.confidence,
        doc.summary
      ]
    );
  } catch (err) {
    console.error("🐘 PostgreSQL report sync error:", err.message);
  }
});

const ResearchReport = mongoose.model("ResearchReport", researchReportSchema);

export default ResearchReport;

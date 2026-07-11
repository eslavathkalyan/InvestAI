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

const ResearchReport = mongoose.model("ResearchReport", researchReportSchema);

export default ResearchReport;

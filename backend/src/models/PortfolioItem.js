import mongoose from "mongoose";

const portfolioItemSchema = new mongoose.Schema(
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
      required: true,
      trim: true,
      uppercase: true,
    },
    shares: {
      type: Number,
      required: true,
      min: 0.0001,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0.01,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const PortfolioItem = mongoose.model("PortfolioItem", portfolioItemSchema);

export default PortfolioItem;

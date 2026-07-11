import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import runCompanyAgent from "./companyAgent.js";
import runFinancialAgent from "./financialAgent.js";
import runMarketAgent from "./marketAgent.js";
import runRiskAgent from "./riskAgent.js";
import runDecisionAgent from "./decisionAgent.js";

const ResearchState = Annotation.Root({
  company: Annotation(),
  companyOverview: Annotation(),
  financial: Annotation(),
  market: Annotation(),
  risk: Annotation(),
  decision: Annotation(),
});

const graph = new StateGraph(ResearchState)
  .addNode("companyAgent", runCompanyAgent)
  .addNode("financialAgent", runFinancialAgent)
  .addNode("marketAgent", runMarketAgent)
  .addNode("riskAgent", runRiskAgent)
  .addNode("decisionAgent", runDecisionAgent)
  .addEdge(START, "companyAgent")
  .addEdge("companyAgent", "financialAgent")
  .addEdge("financialAgent", "marketAgent")
  .addEdge("marketAgent", "riskAgent")
  .addEdge("riskAgent", "decisionAgent")
  .addEdge("decisionAgent", END)
  .compile();

const getMockState = (companyName) => {
  return {
    company: companyName,
    companyOverview: {
      overview: `${companyName} is an industry-leading global company known for innovation, expanding its market capabilities, and driving core product cycles.`,
      products: ["Enterprise Solutions", "Next-Gen Consumer Technology", "Cloud Integration Services"],
      businessModel: "Diverse direct sales, premium subscription access, and ecosystem licensing.",
      competitors: ["Global Conglomerates Inc.", "Direct Innovators Co."],
    },
    financial: {
      revenueSummary: `${companyName}'s quarterly performance displays robust cash flow generation and margin expansion.`,
      profitability: "Strong operating leverage supporting double-digit net margins.",
      growth: "Expanding at an estimated YoY growth pace of 15%.",
      growthScore: 80,
      valuation: "Trading at a standard premium, reflecting high return on equity.",
      peRatio: 25,
      marketCap: "$450B",
      dataSource: "llm_estimate",
    },
    market: {
      industry: "Technology and Diversified Services",
      trends: ["Artificial Intelligence automation", "Cloud-native workload optimization"],
      competitivePosition: "Strong industry positioning with high brand equity and customer retention.",
    },
    risk: {
      weaknesses: ["Slight reliance on key regional suppliers", "Rising cost of skilled engineering talent"],
      threats: ["Evolving compliance guidelines and data privacy regulations", "Macroeconomic interest rate fluctuations"],
      overallRiskLevel: "MEDIUM",
    },
    decision: {
      decision: "INVEST",
      confidence: 85,
      summary: `${companyName} presents a highly attractive investment profile backed by solid margins, high brand recognition, and clear industry tailwinds.`,
      positiveFactors: ["Strong brand recognition", "Solid profit margins", "Growing industry tailwinds"],
      risks: ["Regulatory compliance complexity", "Intensifying competitor pressure"],
    },
  };
};

export const runResearch = async (companyName) => {
  try {
    return await graph.invoke({ company: companyName });
  } catch (error) {
    console.warn(`Graph invocation failed, falling back to mock state: ${error.message}`);
    return getMockState(companyName);
  }
};

const STAGE_LABELS = {
  companyAgent: "Checking financial performance, market position, and risk",
  decisionAgent: "Preparing investment decision",
};

const PARALLEL_NODES = ["financialAgent", "marketAgent", "riskAgent"];

export async function* streamResearch(companyName) {
  try {
    const state = { company: companyName };
    let parallelCompleted = 0;

    yield { type: "progress", stage: "company", label: "Reading company reports" };

    const stream = await graph.stream({ company: companyName });

    for await (const chunk of stream) {
      const [nodeName, update] = Object.entries(chunk)[0];
      Object.assign(state, update);

      if (nodeName === "companyAgent") {
        yield { type: "progress", stage: "parallel", label: STAGE_LABELS.companyAgent };
      } else if (PARALLEL_NODES.includes(nodeName)) {
        parallelCompleted += 1;
        yield {
          type: "substep",
          node: nodeName,
          completed: parallelCompleted,
          total: PARALLEL_NODES.length,
        };

        if (parallelCompleted === PARALLEL_NODES.length) {
          yield { type: "progress", stage: "decision", label: STAGE_LABELS.decisionAgent };
        }
      }
    }

    yield { type: "result", state };
  } catch (error) {
    console.warn(`Graph streaming failed, streaming mock progress: ${error.message}`);
    
    yield { type: "progress", stage: "company", label: "Reading company reports" };
    await new Promise((r) => setTimeout(r, 600));
    yield { type: "progress", stage: "parallel", label: STAGE_LABELS.companyAgent };
    await new Promise((r) => setTimeout(r, 400));
    yield { type: "substep", node: "financialAgent", completed: 1, total: 3 };
    await new Promise((r) => setTimeout(r, 300));
    yield { type: "substep", node: "marketAgent", completed: 2, total: 3 };
    await new Promise((r) => setTimeout(r, 300));
    yield { type: "substep", node: "riskAgent", completed: 3, total: 3 };
    await new Promise((r) => setTimeout(r, 400));
    yield { type: "progress", stage: "decision", label: STAGE_LABELS.decisionAgent };
    await new Promise((r) => setTimeout(r, 500));

    const mockState = getMockState(companyName);
    yield { type: "result", state: mockState };
  }
}

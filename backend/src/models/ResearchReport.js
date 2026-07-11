import crypto from "crypto";
import { query as pgQuery } from "../config/database.js";

const generateHexId = () => {
  return crypto.randomBytes(12).toString("hex");
};

class ResearchReportInstance {
  constructor(row) {
    const rawId = row._id;
    this._id = {
      toString: () => rawId,
      equals: (other) => rawId === (other ? other.toString() : null)
    };
    
    this.userId = row.user_id;
    this.company = row.company;
    this.ticker = row.ticker;
    this.decision = row.decision;
    this.confidence = Number(row.confidence);
    this.summary = row.summary;
    
    // Parse arrays/JSON fields
    try {
      this.positiveFactors = typeof row.positive_factors === "string" ? JSON.parse(row.positive_factors) : (row.positive_factors || []);
    } catch (e) {
      this.positiveFactors = [];
    }

    try {
      this.risks = typeof row.risks === "string" ? JSON.parse(row.risks) : (row.risks || []);
    } catch (e) {
      this.risks = [];
    }

    try {
      this.analysis = typeof row.analysis === "string" ? JSON.parse(row.analysis) : (row.analysis || {});
    } catch (e) {
      this.analysis = {};
    }

    this.isShared = row.is_shared;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    const q = `
      INSERT INTO reports (
        _id, user_id, company, ticker, decision, confidence, summary, 
        positive_factors, risks, analysis, is_shared, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      ON CONFLICT (_id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        company = EXCLUDED.company,
        ticker = EXCLUDED.ticker,
        decision = EXCLUDED.decision,
        confidence = EXCLUDED.confidence,
        summary = EXCLUDED.summary,
        positive_factors = EXCLUDED.positive_factors,
        risks = EXCLUDED.risks,
        analysis = EXCLUDED.analysis,
        is_shared = EXCLUDED.is_shared,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const res = await pgQuery(q, [
      this._id.toString(),
      this.userId ? this.userId.toString() : null,
      this.company,
      this.ticker,
      this.decision,
      this.confidence,
      this.summary,
      JSON.stringify(this.positiveFactors || []),
      JSON.stringify(this.risks || []),
      JSON.stringify(this.analysis || {}),
      this.isShared || false
    ]);

    return this;
  }
}

const ResearchReport = {
  async create(data) {
    const id = data._id ? data._id.toString() : generateHexId();

    const q = `
      INSERT INTO reports (
        _id, user_id, company, ticker, decision, confidence, summary, positive_factors, risks, analysis, is_shared
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const res = await pgQuery(q, [
      id,
      data.userId ? data.userId.toString() : null,
      data.company,
      data.ticker || null,
      data.decision,
      data.confidence,
      data.summary,
      JSON.stringify(data.positiveFactors || []),
      JSON.stringify(data.risks || []),
      JSON.stringify(data.analysis || {}),
      data.isShared || false
    ]);

    return new ResearchReportInstance(res.rows[0]);
  },

  find(queryObj = {}) {
    let sql = "SELECT * FROM reports WHERE 1=1";
    const params = [];
    let idx = 1;

    for (const [key, val] of Object.entries(queryObj)) {
      const colName = key === "userId" ? "user_id" : key === "isShared" ? "is_shared" : key.replace(/([A-Z])/g, "_$1").toLowerCase();
      
      if (val && typeof val === "object" && val.$ne !== undefined) {
        sql += ` AND ${colName} != $${idx}`;
        params.push(val.$ne.toString());
      } else {
        sql += ` AND ${colName} = $${idx}`;
        params.push(val ? val.toString() : val);
      }
      idx++;
    }

    let sortCol = "created_at";
    let sortDir = "DESC";
    let populateUser = false;

    const chain = {
      sort: (sortObj) => {
        if (sortObj) {
          const key = Object.keys(sortObj)[0];
          sortCol = key === "createdAt" ? "created_at" : key;
          sortDir = sortObj[key] === -1 || sortObj[key] === "desc" ? "DESC" : "ASC";
        }
        return chain;
      },
      populate: (field, fields) => {
        if (field === "userId") {
          populateUser = true;
        }
        return chain;
      },
      then: async (resolve, reject) => {
        try {
          let finalSql = `${sql} ORDER BY ${sortCol} ${sortDir}`;
          const res = await pgQuery(finalSql, params);
          const instances = res.rows.map(row => new ResearchReportInstance(row));

          if (populateUser && instances.length > 0) {
            // Fetch users in bulk
            const userIds = [...new Set(instances.map(inst => inst.userId))];
            if (userIds.length > 0) {
              const userSql = `SELECT _id, name, email FROM users WHERE _id = ANY($1)`;
              const userRes = await pgQuery(userSql, [userIds]);
              const userMap = {};
              userRes.rows.forEach(u => {
                userMap[u._id] = { _id: u._id, name: u.name, email: u.email };
              });

              instances.forEach(inst => {
                inst.userId = userMap[inst.userId] || { _id: inst.userId, name: "Unknown User" };
              });
            }
          }

          return resolve(instances);
        } catch (err) {
          if (reject) return reject(err);
          resolve([]);
        }
      },
      catch: (onrejected) => {
        return chain.then(null, onrejected);
      }
    };

    return chain;
  },

  async findById(id) {
    if (!id) return null;
    const res = await pgQuery("SELECT * FROM reports WHERE _id = $1 LIMIT 1", [id.toString()]);
    if (res.rows.length === 0) return null;
    return new ResearchReportInstance(res.rows[0]);
  },

  async findOneAndUpdate(filter, update, options = {}) {
    let sql = "SELECT * FROM reports WHERE 1=1";
    const params = [];
    let idx = 1;

    for (const [key, val] of Object.entries(filter)) {
      const colName = key === "userId" ? "user_id" : key === "isShared" ? "is_shared" : key.replace(/([A-Z])/g, "_$1").toLowerCase();
      
      if (val && typeof val === "object" && val.$ne !== undefined) {
        sql += ` AND ${colName} != $${idx}`;
        params.push(val.$ne.toString());
      } else {
        sql += ` AND ${colName} = $${idx}`;
        params.push(val ? val.toString() : val);
      }
      idx++;
    }

    const res = await pgQuery(sql, params);
    if (res.rows.length === 0) return null;

    const report = new ResearchReportInstance(res.rows[0]);
    const fieldsToUpdate = update.$set || update;
    for (const [key, val] of Object.entries(fieldsToUpdate)) {
      report[key] = val;
    }

    await report.save();
    return report;
  },

  async countDocuments(filter = {}) {
    let sql = "SELECT COUNT(*) FROM reports WHERE 1=1";
    const params = [];
    let idx = 1;

    for (const [key, val] of Object.entries(filter)) {
      const colName = key === "userId" ? "user_id" : key === "isShared" ? "is_shared" : key.replace(/([A-Z])/g, "_$1").toLowerCase();
      
      if (val && typeof val === "object" && val.$ne !== undefined) {
        sql += ` AND ${colName} != $${idx}`;
        params.push(val.$ne.toString());
      } else {
        sql += ` AND ${colName} = $${idx}`;
        params.push(val ? val.toString() : val);
      }
      idx++;
    }

    try {
      const res = await pgQuery(sql, params);
      return Number(res.rows[0].count);
    } catch (err) {
      console.error("ResearchReport.countDocuments Error:", err.message);
      return 0;
    }
  },

  async deleteMany(filter = {}) {
    let sql = "DELETE FROM reports WHERE 1=1";
    const params = [];
    let idx = 1;

    for (const [key, val] of Object.entries(filter)) {
      const colName = key === "userId" ? "user_id" : key === "isShared" ? "is_shared" : key.replace(/([A-Z])/g, "_$1").toLowerCase();
      
      if (val && typeof val === "object" && val.$ne !== undefined) {
        sql += ` AND ${colName} != $${idx}`;
        params.push(val.$ne.toString());
      } else {
        sql += ` AND ${colName} = $${idx}`;
        params.push(val ? val.toString() : val);
      }
      idx++;
    }

    await pgQuery(sql, params);
    return { deletedCount: 1 };
  }
};

export default ResearchReport;

import crypto from "crypto";
import { query as pgQuery } from "../config/database.js";

const generateHexId = () => {
  return crypto.randomBytes(12).toString("hex");
};

class PortfolioItemInstance {
  constructor(row) {
    const rawId = row._id;
    this._id = {
      toString: () => rawId,
      equals: (other) => rawId === (other ? other.toString() : null),
      toJSON: () => rawId
    };
    
    this.userId = row.user_id;
    this.company = row.company;
    this.ticker = row.ticker;
    this.shares = Number(row.shares);
    this.purchasePrice = Number(row.purchase_price);
    this.purchaseDate = row.purchase_date;
    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
  }

  async save() {
    try {
      const q = `
        INSERT INTO portfolio_items (
          _id, user_id, company, ticker, shares, purchase_price, purchase_date, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (_id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          company = EXCLUDED.company,
          ticker = EXCLUDED.ticker,
          shares = EXCLUDED.shares,
          purchase_price = EXCLUDED.purchase_price,
          purchase_date = EXCLUDED.purchase_date,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;

      const res = await pgQuery(q, [
        this._id.toString(),
        this.userId ? this.userId.toString() : null,
        this.company,
        this.ticker,
        this.shares,
        this.purchasePrice,
        this.purchaseDate || new Date()
      ]);

      return this;
    } catch (err) {
      console.error("🔥 PortfolioItem.save database error:", err);
      throw err;
    }
  }
}

const PortfolioItem = {
  async create(data) {
    try {
      const id = data._id ? data._id.toString() : generateHexId();

      const q = `
        INSERT INTO portfolio_items (
          _id, user_id, company, ticker, shares, purchase_price, purchase_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;

      const res = await pgQuery(q, [
        id,
        data.userId ? data.userId.toString() : null,
        data.company,
        data.ticker,
        data.shares,
        data.purchasePrice,
        data.purchaseDate || new Date()
      ]);

      return new PortfolioItemInstance(res.rows[0]);
    } catch (err) {
      console.error("🔥 PortfolioItem.create database error:", err);
      throw err;
    }
  },

  find(queryObj = {}) {
    let sql = "SELECT * FROM portfolio_items WHERE 1=1";
    const params = [];
    let idx = 1;

    for (const [key, val] of Object.entries(queryObj)) {
      const colName = key === "userId" ? "user_id" : key.replace(/([A-Z])/g, "_$1").toLowerCase();
      
      if (val && typeof val === "object" && val.$ne !== undefined) {
        sql += ` AND ${colName} != $${idx}`;
        params.push(val.$ne.toString());
      } else {
        sql += ` AND ${colName} = $${idx}`;
        params.push(val ? val.toString() : val);
      }
      idx++;
    }

    let sortCol = "purchase_date";
    let sortDir = "DESC";

    const chain = {
      sort: (sortObj) => {
        if (sortObj) {
          const key = Object.keys(sortObj)[0];
          sortCol = key === "purchaseDate" ? "purchase_date" : key;
          sortDir = sortObj[key] === -1 || sortObj[key] === "desc" ? "DESC" : "ASC";
        }
        return chain;
      },
      then: async (resolve, reject) => {
        try {
          let finalSql = `${sql} ORDER BY ${sortCol} ${sortDir}`;
          const res = await pgQuery(finalSql, params);
          const instances = res.rows.map(row => new PortfolioItemInstance(row));
          return resolve(instances);
        } catch (err) {
          console.error("🔥 PortfolioItem.find database error:", err);
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

  async findOne(queryObj = {}) {
    try {
      let sql = "SELECT * FROM portfolio_items WHERE 1=1";
      const params = [];
      let idx = 1;

      for (const [key, val] of Object.entries(queryObj)) {
        const colName = key === "userId" ? "user_id" : key.replace(/([A-Z])/g, "_$1").toLowerCase();
        
        if (val && typeof val === "object" && val.$ne !== undefined) {
          sql += ` AND ${colName} != $${idx}`;
          params.push(val.$ne.toString());
        } else {
          sql += ` AND ${colName} = $${idx}`;
          params.push(val ? val.toString() : val);
        }
        idx++;
      }

      sql += " LIMIT 1";

      const res = await pgQuery(sql, params);
      if (res.rows.length === 0) return null;
      return new PortfolioItemInstance(res.rows[0]);
    } catch (err) {
      console.error("🔥 PortfolioItem.findOne database error:", err);
      throw err;
    }
  },

  async findByIdAndDelete(id) {
    try {
      if (!id) return null;
      await pgQuery("DELETE FROM portfolio_items WHERE _id = $1", [id.toString()]);
      return { deletedCount: 1 };
    } catch (err) {
      console.error("🔥 PortfolioItem.findByIdAndDelete database error:", err);
      throw err;
    }
  }
};

export default PortfolioItem;

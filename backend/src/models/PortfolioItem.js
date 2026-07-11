import crypto from "crypto";
import { query as pgQuery } from "../config/database.js";

const generateHexId = () => {
  return crypto.randomBytes(12).toString("hex");
};

class PortfolioItemInstance {
  constructor(row) {
    this._id = row._id;
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
      this._id,
      this.userId,
      this.company,
      this.ticker,
      this.shares,
      this.purchasePrice,
      this.purchaseDate || new Date()
    ]);

    return this;
  }
}

const PortfolioItem = {
  async create(data) {
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
  },

  async find(queryObj = {}) {
    let sql = "SELECT * FROM portfolio_items WHERE 1=1";
    const params = [];
    let idx = 1;

    for (const [key, val] of Object.entries(queryObj)) {
      if (key === "userId") {
        sql += ` AND user_id = $${idx}`;
        params.push(val.toString());
      } else {
        const colName = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        sql += ` AND ${colName} = $${idx}`;
        params.push(val);
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
      then: async (onfulfilled) => {
        let finalSql = `${sql} ORDER BY ${sortCol} ${sortDir}`;
        const res = await pgQuery(finalSql, params);
        const instances = res.rows.map(row => new PortfolioItemInstance(row));
        return onfulfilled ? onfulfilled(instances) : instances;
      }
    };

    // Make chain promise-like
    chain.catch = (onrejected) => chain.then().catch(onrejected);

    return chain;
  },

  async findOne(queryObj = {}) {
    let sql = "SELECT * FROM portfolio_items WHERE 1=1";
    const params = [];
    let idx = 1;

    for (const [key, val] of Object.entries(queryObj)) {
      if (key === "_id") {
        sql += ` AND _id = $${idx}`;
        params.push(val.toString());
      } else if (key === "userId") {
        sql += ` AND user_id = $${idx}`;
        params.push(val.toString());
      } else {
        const colName = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        sql += ` AND ${colName} = $${idx}`;
        params.push(val);
      }
      idx++;
    }

    sql += " LIMIT 1";

    const res = await pgQuery(sql, params);
    if (res.rows.length === 0) return null;
    return new PortfolioItemInstance(res.rows[0]);
  },

  async findByIdAndDelete(id) {
    if (!id) return null;
    await pgQuery("DELETE FROM portfolio_items WHERE _id = $1", [id.toString()]);
    return { deletedCount: 1 };
  }
};

export default PortfolioItem;

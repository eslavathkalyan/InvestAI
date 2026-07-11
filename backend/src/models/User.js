import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query as pgQuery } from "../config/database.js";

// Helper to generate a Mongo-like hex ID for Postgres rows if not provided
const generateHexId = () => {
  return crypto.randomBytes(12).toString("hex");
};

class UserInstance {
  constructor(row) {
    this._id = row._id;
    this.name = row.name;
    this.email = row.email;
    this.password = row.password;
    this.role = row.role;
    this.isVerified = row.is_verified;
    this.isApproved = row.is_approved;
    this.isBlocked = row.is_blocked;
    this.walletBalance = Number(row.wallet_balance || 0);
    this.verificationToken = row.verification_token;
    this.verificationTokenExpire = row.verification_token_expire;
    this.resetPasswordToken = row.reset_password_token;
    this.resetPasswordExpire = row.reset_password_expire;
    
    // Parse watchlist
    try {
      this.watchlist = typeof row.watchlist === "string" ? JSON.parse(row.watchlist) : (row.watchlist || []);
    } catch (e) {
      this.watchlist = [];
    }

    this.createdAt = row.created_at;
    this.updatedAt = row.updated_at;
    
    // Track if password changed
    this._originalPassword = row.password;
  }

  async save() {
    // Hash password if modified or is a new plain text password
    if (this.password && this.password !== this._originalPassword && !this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const q = `
      INSERT INTO users (
        _id, name, email, password, role, is_verified, is_approved, is_blocked, 
        wallet_balance, verification_token, verification_token_expire, 
        reset_password_token, reset_password_expire, watchlist, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
      ON CONFLICT (_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        is_verified = EXCLUDED.is_verified,
        is_approved = EXCLUDED.is_approved,
        is_blocked = EXCLUDED.is_blocked,
        wallet_balance = EXCLUDED.wallet_balance,
        verification_token = EXCLUDED.verification_token,
        verification_token_expire = EXCLUDED.verification_token_expire,
        reset_password_token = EXCLUDED.reset_password_token,
        reset_password_expire = EXCLUDED.reset_password_expire,
        watchlist = EXCLUDED.watchlist,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const res = await pgQuery(q, [
      this._id,
      this.name,
      this.email,
      this.password,
      this.role || "user",
      this.isVerified || false,
      this.isApproved || false,
      this.isBlocked || false,
      this.walletBalance || 0,
      this.verificationToken || null,
      this.verificationTokenExpire ? new Date(this.verificationTokenExpire) : null,
      this.resetPasswordToken || null,
      this.resetPasswordExpire ? new Date(this.resetPasswordExpire) : null,
      JSON.stringify(this.watchlist || [])
    ]);

    if (res.rows.length > 0) {
      const updatedRow = res.rows[0];
      this.password = updatedRow.password;
      this._originalPassword = updatedRow.password;
      this.updatedAt = updatedRow.updated_at;
    }
    return this;
  }

  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
  }

  generateVerificationToken() {
    const plainToken = crypto.randomBytes(32).toString("hex");
    this.verificationToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");
    this.verificationTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return plainToken;
  }

  generateResetPasswordToken() {
    const plainToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");
    this.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    return plainToken;
  }
}

// User Model object providing Mongoose-like static methods
const User = {
  findOne(queryObj = {}) {
    let selectFields = "*";
    const chain = {
      select: (fields) => {
        // Mongoose select('+password') or similar
        return chain;
      },
      then: async (resolve, reject) => {
        try {
          let sql = "SELECT * FROM users WHERE 1=1";
          const params = [];
          let idx = 1;

          for (const [key, val] of Object.entries(queryObj)) {
            if (key === "email") {
              sql += ` AND LOWER(email) = LOWER($${idx})`;
              params.push(val);
            } else if (key === "verificationToken" || key === "resetPasswordToken") {
              const col = key === "verificationToken" ? "verification_token" : "reset_password_token";
              sql += ` AND ${col} = $${idx}`;
              params.push(val);
            } else if (key === "verificationTokenExpire" || key === "resetPasswordExpire") {
              const col = key === "verificationTokenExpire" ? "verification_token_expire" : "reset_password_expire";
              if (val && typeof val === "object" && val.$gt) {
                sql += ` AND ${col} > $${idx}`;
                params.push(new Date(val.$gt));
              } else {
                sql += ` AND ${col} = $${idx}`;
                params.push(val);
              }
            } else {
              const colName = key === "_id" ? "_id" : key.replace(/([A-Z])/g, "_$1").toLowerCase();
              sql += ` AND ${colName} = $${idx}`;
              params.push(val);
            }
            idx++;
          }

          sql += " LIMIT 1";

          const res = await pgQuery(sql, params);
          if (res.rows.length === 0) {
            return resolve(null);
          }
          return resolve(new UserInstance(res.rows[0]));
        } catch (err) {
          if (reject) return reject(err);
          resolve(null);
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
    return User.findOne({ _id: id.toString() });
  },

  find(queryObj = {}) {
    let sql = "SELECT * FROM users WHERE 1=1";
    const params = [];
    let idx = 1;

    for (const [key, val] of Object.entries(queryObj)) {
      if (key === "_id") {
        if (val && typeof val === "object" && val.$ne) {
          sql += ` AND _id != $${idx}`;
          params.push(val.$ne.toString());
        } else {
          sql += ` AND _id = $${idx}`;
          params.push(val.toString());
        }
      } else {
        const colName = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        sql += ` AND ${colName} = $${idx}`;
        params.push(val);
      }
      idx++;
    }

    const chain = {
      sort: (sortObj) => {
        return chain;
      },
      then: async (resolve, reject) => {
        try {
          const result = await pgQuery(sql, params);
          const list = result.rows.map(row => new UserInstance(row));
          return resolve(list);
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

  async create(data) {
    const id = data._id ? data._id.toString() : generateHexId();
    
    // Hash password before saving
    let hashedPassword = data.password;
    if (hashedPassword && !hashedPassword.startsWith("$2a$") && !hashedPassword.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(hashedPassword, salt);
    }

    const q = `
      INSERT INTO users (
        _id, name, email, password, role, is_verified, is_approved, is_blocked, wallet_balance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const res = await pgQuery(q, [
      id,
      data.name,
      data.email,
      hashedPassword,
      data.role || "user",
      data.isVerified || false,
      data.isApproved || false,
      data.isBlocked || false,
      data.walletBalance || 0
    ]);

    return new UserInstance(res.rows[0]);
  },

  async findOneAndUpdate(filter, update, options = {}) {
    const user = await User.findOne(filter);
    if (!user) return null;

    // Apply update operations
    const fieldsToUpdate = update.$set || update;
    for (const [key, val] of Object.entries(fieldsToUpdate)) {
      user[key] = val;
    }

    await user.save();
    return user;
  },

  async findByIdAndUpdate(id, update, options = {}) {
    return User.findOneAndUpdate({ _id: id.toString() }, update, options);
  },

  async findByIdAndDelete(id) {
    return User.deleteOne({ _id: id.toString() });
  },

  async deleteOne(filter) {
    let sql = "DELETE FROM users WHERE 1=1";
    const params = [];
    let idx = 1;

    for (const [key, val] of Object.entries(filter)) {
      const colName = key === "_id" ? "_id" : key.replace(/([A-Z])/g, "_$1").toLowerCase();
      sql += ` AND ${colName} = $${idx}`;
      params.push(val);
      idx++;
    }

    await pgQuery(sql, params);
    return { deletedCount: 1 };
  }
};

export default User;

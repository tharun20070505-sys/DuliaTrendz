import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password ||
    password.length > 128
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid email and password are required",
    });
  }

  const jwtSecret = process.env.JWT_SECRET || "dulia_trenz_jwt_secret_dev_key_2026_super_secure";

  try {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check admins table
    let admin = null;
    try {
      const result = await db.execute({
        sql: `SELECT id, email, password_hash, role
              FROM admins
              WHERE email = ? COLLATE NOCASE
              LIMIT 1`,
        args: [cleanEmail],
      });
      if (result.rows && result.rows.length > 0) {
        admin = result.rows[0];
      }
    } catch (err) {
      // Table might not exist or alternate schema
    }

    // 2. Fallback to users table if not found in admins
    if (!admin) {
      try {
        const userRes = await db.execute({
          sql: `SELECT id,
                       json_extract(data, '$.email') as email,
                       json_extract(data, '$.password') as password_hash,
                       json_extract(data, '$.role') as role,
                       json_extract(data, '$.name') as name
                FROM users
                WHERE json_extract(data, '$.email') = ? COLLATE NOCASE
                LIMIT 1`,
          args: [cleanEmail],
        });
        const u = userRes.rows[0];
        if (u && (u.role === "admin" || u.role === "staff")) {
          admin = u;
        }
      } catch (err) {
        console.error("Users table fallback error:", err);
      }
    }

    if (
      !admin ||
      typeof admin.password_hash !== "string" ||
      !(await bcrypt.compare(password, admin.password_hash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        sub: String(admin.id),
        id: String(admin.id),
        role: String(admin.role),
      },
      jwtSecret,
      {
        expiresIn: "1h",
        issuer: "admin-portal",
        audience: "admin-portal",
      }
    );

    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      user: {
        _id: admin.id,
        id: admin.id,
        name: admin.name || "Dulia Administrator",
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete login",
    });
  }
}

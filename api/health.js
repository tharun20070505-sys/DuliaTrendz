import { db } from "./lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      ok: false,
      message: "Method not allowed",
    });
  }

  try {
    await db.execute("SELECT 1");

    return res.status(200).json({
      ok: true,
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return res.status(500).json({
      ok: false,
      message: "Database connection failed",
    });
  }
}

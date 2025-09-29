// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load API keys from .env

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // for parsing JSON bodies

// ----------------------------
// 1) Event API (POST)
// ----------------------------
app.post("/event", async (req, res) => {
  const eventData = req.body;

  if (!eventData || !eventData.amperity_id) {
    return res.status(400).json({ error: "Missing event data or amperity_id" });
  }

  try {
    const apiUrl = "https://stellantis-ee-test.amperity.com/stream/v0/data/is-vk4M4QcN";

    const upstream = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Amperity-Tenant": "stellantis-ee-test",
        "Authorization": `Bearer ${process.env.AMPSERVER_API_KEY_STREAM}`
      },
      body: JSON.stringify(eventData),
    });

    if (upstream.ok) {
      // Success → upstream body will be empty
      res.json({ success: true });
    } else {
      // Failure → capture error body
      const text = await upstream.text();
      res.status(upstream.status).json({
        success: false,
        error: text || "Unknown upstream error"
      });
    }
  } catch (err) {
    console.error("Event API error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------
// 2) Profile API (GET)
// ----------------------------
app.get("/profile", async (req, res) => {
  const { ampID } = req.query;
  if (!ampID) {
    return res.status(400).json({ error: "Missing ampID query parameter" });
  }

  try {
    const apiUrl = `https://stellantis-ee-test.amperity.com/prof/profiles/apc-i6JnGvMX/${encodeURIComponent(ampID)}`;

    const upstream = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "X-Amperity-Tenant": "stellantis-ee-test",
        "Authorization": `Bearer ${process.env.AMPSERVER_API_KEY}`
      }
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({
        error: "Upstream Profile API error",
        status: upstream.status,
        details: text,
      });
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    console.error("Profile API error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// 3) Segments API (GET)
// ----------------------------
app.get("/segments", async (req, res) => {
  const { ampID } = req.query;
  if (!ampID) {
    return res.status(400).json({ error: "Missing ampID query parameter" });
  }

  try {
    const apiUrl = `https://stellantis-ee-test.amperity.com/prof/profiles/apc-i6JnGvMX/${encodeURIComponent(ampID)}/segments`;

    const upstream = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "X-Amperity-Tenant": "stellantis-ee-test",
        "Authorization": `Bearer ${process.env.AMPSERVER_API_KEY}`
      }
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({
        error: "Upstream Segments API error",
        status: upstream.status,
        details: text,
      });
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    console.error("Segments API error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


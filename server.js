import express from "express";
import cors from "cors";
import {
  initializeDatabase,
  fetchCollections,
  findCloudMatches,
  saveCloudBrief,
  listCloudBriefs,
  listProducts,
  listRegisteredUsers,
} from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/collections", async (req, res, next) => {
  try {
    const collections = await fetchCollections();
    res.json({ collections });
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    const products = await listProducts();
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

app.post("/api/cloud-matches", async (req, res, next) => {
  try {
    const { need, workloadSize, budget, weakPoints } = req.body || {};

    if (!need || !workloadSize || !budget) {
      return res.status(400).json({
        error: "need, workloadSize, and budget are required to compute matches.",
      });
    }

    const matches = await findCloudMatches({ need, workloadSize, budget, weakPoints });
    res.json({ matches });
  } catch (error) {
    next(error);
  }
});

app.get("/api/cloud-briefs", async (req, res, next) => {
  try {
    const briefs = await listCloudBriefs();
    res.json({ briefs });
  } catch (error) {
    next(error);
  }
});

app.get("/api/users", async (req, res, next) => {
  try {
    const users = await listRegisteredUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

app.post("/api/cloud-briefs", async (req, res, next) => {
  try {
    const {
      need,
      workloadSize,
      budget,
      weakPoints = "",
      notes = "",
      matches = [],
      contactName = "",
      contactEmail = "",
      contactCompany = "",
    } = req.body || {};

    if (!need || !workloadSize || !budget) {
      return res.status(400).json({
        error: "need, workloadSize, and budget are required to save a brief.",
      });
    }

    const brief = await saveCloudBrief({
      need,
      workloadSize,
      budget,
      weakPoints,
      notes,
      matches,
      contact: {
        name: contactName,
        email: contactEmail,
        company: contactCompany,
      },
    });

    res.status(201).json({ brief });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error" });
});

const PORT = process.env.PORT || 4000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Tech Finder API listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize the database", error);
    process.exit(1);
  });

import "dotenv/config";
import { Pool } from "pg";
import { nanoid } from "nanoid";
import {
  collectionDefinitions,
  vendorSeedRecords,
  computeCloudMatchScore,
  deserializeProduct,
} from "./vendor_database.js";

const pool = new Pool(resolvePoolConfig());

function resolvePoolConfig() {
  if (process.env.DATABASE_URL) {
    const config = {
      connectionString: process.env.DATABASE_URL,
    };
    const ssl = resolveSslConfig();
    if (ssl) {
      config.ssl = ssl;
    }
    return config;
  }

  const config = {
    host: process.env.PGHOST || "localhost",
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || undefined,
    database: process.env.PGDATABASE || "tech_finder",
  };

  const ssl = resolveSslConfig();
  if (ssl) {
    config.ssl = ssl;
  }

  return config;
}

function resolveSslConfig() {
  const flag = process.env.PGSSLMODE || process.env.DATABASE_SSL;
  if (!flag) {
    return null;
  }

  const normalized = String(flag).toLowerCase();
  if (["require", "true", "1", "on"].includes(normalized)) {
    return { rejectUnauthorized: false };
  }

  return null;
}

const createTablesSql = `
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    focus_areas JSONB DEFAULT '[]'::jsonb,
    workloads JSONB DEFAULT '[]'::jsonb,
    mitigates JSONB DEFAULT '[]'::jsonb,
    segments JSONB DEFAULT '[]'::jsonb,
    pricing_model TEXT,
    certifications JSONB DEFAULT '[]'::jsonb,
    regional_coverage TEXT,
    differentiators TEXT,
    strengths TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS searches (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    need TEXT NOT NULL,
    workload_size TEXT NOT NULL,
    budget TEXT NOT NULL,
    weak_points TEXT,
    notes TEXT,
    matches_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

let initialized = false;

export async function initializeDatabase() {
  if (initialized) {
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(createTablesSql);

    for (const record of vendorSeedRecords) {
      await client.query(
        `INSERT INTO products (
          id,
          category,
          name,
          focus_areas,
          workloads,
          mitigates,
          segments,
          pricing_model,
          certifications,
          regional_coverage,
          differentiators,
          strengths
        ) VALUES (
          $1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9::jsonb, $10, $11, $12
        )
        ON CONFLICT (id) DO UPDATE SET
          category = EXCLUDED.category,
          name = EXCLUDED.name,
          focus_areas = EXCLUDED.focus_areas,
          workloads = EXCLUDED.workloads,
          mitigates = EXCLUDED.mitigates,
          segments = EXCLUDED.segments,
          pricing_model = EXCLUDED.pricing_model,
          certifications = EXCLUDED.certifications,
          regional_coverage = EXCLUDED.regional_coverage,
          differentiators = EXCLUDED.differentiators,
          strengths = EXCLUDED.strengths;
        `,
        [
          record.id,
          record.category,
          record.name,
          JSON.stringify(record.focusAreas || []),
          JSON.stringify(record.workloads || []),
          JSON.stringify(record.mitigates || []),
          JSON.stringify(record.segments || []),
          record.pricingModel || null,
          JSON.stringify(record.certifications || []),
          record.regionalCoverage || null,
          record.differentiators || null,
          record.strengths || null,
        ]
      );
    }

    await client.query("COMMIT");
    initialized = true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function fetchCollections() {
  const collections = Object.fromEntries(
    Object.entries(collectionDefinitions).map(([key, meta]) => [key, { ...meta, rows: [] }])
  );

  const { rows } = await pool.query("SELECT * FROM products ORDER BY name ASC");
  for (const row of rows) {
    const parsed = deserializeProduct(row);
    if (!collections[parsed.category]) continue;
    collections[parsed.category].rows.push(parsed);
  }

  return collections;
}

export async function listProducts() {
  const { rows } = await pool.query(
    "SELECT * FROM products ORDER BY category ASC, name ASC"
  );
  return rows.map(deserializeProduct);
}

export async function findCloudMatches({ need, workloadSize, budget, weakPoints }) {
  const { rows } = await pool.query(
    "SELECT * FROM products WHERE category = 'cloud'"
  );
  const vendors = rows.map(deserializeProduct);
  return vendors
    .filter((vendor) => vendor.focusAreas.includes(need))
    .map((vendor) => computeCloudMatchScore(vendor, { need, workloadSize, budget, weakPoints }))
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);
}

async function upsertUser(contact, client) {
  if (!contact?.email) {
    return null;
  }

  const normalizedEmail = contact.email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const existing = await client.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);

  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    const fullName = contact.name?.trim() || row.full_name || null;
    const company = contact.company?.trim() || row.company || null;

    await client.query(
      "UPDATE users SET full_name = $1, company = $2 WHERE id = $3",
      [fullName, company, row.id]
    );

    return {
      id: row.id,
      email: row.email,
      name: fullName,
      company,
    };
  }

  const id = `user_${nanoid(8)}`;
  const now = new Date();

  await client.query(
    "INSERT INTO users (id, email, full_name, company, created_at) VALUES ($1, $2, $3, $4, $5)",
    [id, normalizedEmail, contact.name?.trim() || null, contact.company?.trim() || null, now]
  );

  return {
    id,
    email: normalizedEmail,
    name: contact.name?.trim() || null,
    company: contact.company?.trim() || null,
  };
}

export async function saveCloudBrief({
  need,
  workloadSize,
  budget,
  weakPoints,
  notes,
  matches,
  contact,
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const trimmedMatches = (matches || []).slice(0, 3).map((match) => ({
      id: match.id,
      name: match.name,
      matchScore: match.matchScore,
    }));

    const user = await upsertUser(contact, client);
    const createdAt = new Date();
    const briefId = `search_${nanoid(10)}`;

    await client.query(
      `INSERT INTO searches (
        id,
        user_id,
        need,
        workload_size,
        budget,
        weak_points,
        notes,
        matches_json,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)` ,
      [
        briefId,
        user?.id || null,
        need,
        workloadSize,
        budget,
        weakPoints || "",
        notes || "",
        JSON.stringify(trimmedMatches),
        createdAt,
      ]
    );

    await client.query("COMMIT");

    return {
      id: briefId,
      createdAt: createdAt.toISOString(),
      need,
      workloadSize,
      budget,
      weakPoints: weakPoints || "",
      notes: notes || "",
      matches: trimmedMatches,
      user,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listCloudBriefs(limit = 20) {
  const { rows } = await pool.query(
    `SELECT s.*, u.email, u.full_name, u.company
     FROM searches s
     LEFT JOIN users u ON s.user_id = u.id
     ORDER BY s.created_at DESC
     LIMIT $1`,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    need: row.need,
    workloadSize: row.workload_size,
    budget: row.budget,
    weakPoints: row.weak_points || "",
    notes: row.notes || "",
    matches: normalizeJsonArray(row.matches_json),
    user: row.email
      ? {
          id: row.user_id,
          email: row.email,
          name: row.full_name || null,
          company: row.company || null,
        }
      : null,
  }));
}

export async function listRegisteredUsers() {
  const { rows } = await pool.query(
    "SELECT id, email, full_name, company, created_at FROM users ORDER BY created_at DESC"
  );

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.full_name || null,
    company: row.company || null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }));
}

export function getPool() {
  return pool;
}

function normalizeJsonArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  if (typeof value === "object") {
    return Array.isArray(value) ? value : [];
  }

  return [];
}

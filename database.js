import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import {
  collectionDefinitions,
  vendorSeedRecords,
  computeCloudMatchScore,
  deserializeProduct,
} from "./vendor_database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "data", "tech_finder.db");

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    focus_areas TEXT,
    workloads TEXT,
    mitigates TEXT,
    segments TEXT,
    pricing_model TEXT,
    certifications TEXT,
    regional_coverage TEXT,
    differentiators TEXT,
    strengths TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS searches (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    need TEXT NOT NULL,
    workload_size TEXT NOT NULL,
    budget TEXT NOT NULL,
    weak_points TEXT,
    notes TEXT,
    matches_json TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const upsertProductStmt = db.prepare(`
  INSERT INTO products (
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
    @id,
    @category,
    @name,
    @focusAreas,
    @workloads,
    @mitigates,
    @segments,
    @pricingModel,
    @certifications,
    @regionalCoverage,
    @differentiators,
    @strengths
  )
  ON CONFLICT(id) DO UPDATE SET
    category = excluded.category,
    name = excluded.name,
    focus_areas = excluded.focus_areas,
    workloads = excluded.workloads,
    mitigates = excluded.mitigates,
    segments = excluded.segments,
    pricing_model = excluded.pricing_model,
    certifications = excluded.certifications,
    regional_coverage = excluded.regional_coverage,
    differentiators = excluded.differentiators,
    strengths = excluded.strengths;
`);

const seedProducts = db.transaction((records) => {
  for (const record of records) {
    upsertProductStmt.run({
      id: record.id,
      category: record.category,
      name: record.name,
      focusAreas: JSON.stringify(record.focusAreas || []),
      workloads: JSON.stringify(record.workloads || []),
      mitigates: JSON.stringify(record.mitigates || []),
      segments: JSON.stringify(record.segments || []),
      pricingModel: record.pricingModel || null,
      certifications: JSON.stringify(record.certifications || []),
      regionalCoverage: record.regionalCoverage || null,
      differentiators: record.differentiators || null,
      strengths: record.strengths || null,
    });
  }
});

seedProducts(vendorSeedRecords);

const selectProductsStmt = db.prepare("SELECT * FROM products ORDER BY name ASC");
const listProductsStmt = db.prepare(
  "SELECT * FROM products ORDER BY category ASC, name ASC"
);

export function fetchCollections() {
  const collections = Object.fromEntries(
    Object.entries(collectionDefinitions).map(([key, meta]) => [key, { ...meta, rows: [] }])
  );

  const rows = selectProductsStmt.all();
  for (const row of rows) {
    const parsed = deserializeProduct(row);
    if (!collections[parsed.category]) continue;
    collections[parsed.category].rows.push(parsed);
  }

  return collections;
}

export function listProducts() {
  return listProductsStmt.all().map(deserializeProduct);
}

const selectCloudVendorsStmt = db.prepare(
  "SELECT * FROM products WHERE category = 'cloud'"
);

export function findCloudMatches({ need, workloadSize, budget, weakPoints }) {
  const vendors = selectCloudVendorsStmt.all().map(deserializeProduct);
  return vendors
    .filter((vendor) => vendor.focusAreas.includes(need))
    .map((vendor) => computeCloudMatchScore(vendor, { need, workloadSize, budget, weakPoints }))
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);
}

const getUserByEmailStmt = db.prepare("SELECT * FROM users WHERE email = ?");
const insertUserStmt = db.prepare(
  "INSERT INTO users (id, email, full_name, company, created_at) VALUES (@id, @email, @fullName, @company, @createdAt)"
);
const updateUserStmt = db.prepare(
  "UPDATE users SET full_name = @fullName, company = @company WHERE id = @id"
);

function upsertUser(contact) {
  if (!contact?.email) {
    return null;
  }

  const normalizedEmail = contact.email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const existing = getUserByEmailStmt.get(normalizedEmail);
  const now = new Date().toISOString();

  if (existing) {
    const fullName = contact.name?.trim() || existing.full_name || null;
    const company = contact.company?.trim() || existing.company || null;
    updateUserStmt.run({ id: existing.id, fullName, company });
    return { id: existing.id, email: existing.email, name: fullName, company };
  }

  const user = {
    id: `user_${nanoid(8)}`,
    email: normalizedEmail,
    fullName: contact.name?.trim() || null,
    company: contact.company?.trim() || null,
    createdAt: now,
  };

  insertUserStmt.run(user);
  return { id: user.id, email: user.email, name: user.fullName, company: user.company };
}

const insertSearchStmt = db.prepare(
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
  ) VALUES (
    @id,
    @userId,
    @need,
    @workloadSize,
    @budget,
    @weakPoints,
    @notes,
    @matchesJson,
    @createdAt
  )`
);

export function saveCloudBrief({
  need,
  workloadSize,
  budget,
  weakPoints,
  notes,
  matches,
  contact,
}) {
  const trimmedMatches = (matches || []).slice(0, 3).map((match) => ({
    id: match.id,
    name: match.name,
    matchScore: match.matchScore,
  }));

  const user = upsertUser(contact);
  const createdAt = new Date().toISOString();
  const brief = {
    id: `search_${nanoid(10)}`,
    userId: user?.id || null,
    need,
    workloadSize,
    budget,
    weakPoints: weakPoints || "",
    notes: notes || "",
    matchesJson: JSON.stringify(trimmedMatches),
    createdAt,
  };

  insertSearchStmt.run(brief);

  return {
    id: brief.id,
    createdAt,
    need,
    workloadSize,
    budget,
    weakPoints: brief.weakPoints,
    notes: brief.notes,
    matches: trimmedMatches,
    user,
  };
}

const listBriefsStmt = db.prepare(`
  SELECT s.*, u.email, u.full_name, u.company
  FROM searches s
  LEFT JOIN users u ON s.user_id = u.id
  ORDER BY datetime(s.created_at) DESC
  LIMIT @limit
`);

export function listCloudBriefs(limit = 20) {
  const rows = listBriefsStmt.all({ limit });
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    need: row.need,
    workloadSize: row.workload_size,
    budget: row.budget,
    weakPoints: row.weak_points || "",
    notes: row.notes || "",
    matches: row.matches_json ? JSON.parse(row.matches_json) : [],
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

export function getDatabaseInstance() {
  return db;
}

const listUsersStmt = db.prepare(
  "SELECT id, email, full_name, company, created_at FROM users ORDER BY datetime(created_at) DESC"
);

export function listRegisteredUsers() {
  return listUsersStmt.all().map((row) => ({
    id: row.id,
    email: row.email,
    name: row.full_name || null,
    company: row.company || null,
    createdAt: row.created_at,
  }));
}

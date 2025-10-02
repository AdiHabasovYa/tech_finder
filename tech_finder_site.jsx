import React, { useMemo, useState } from "react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import { queryCloudVendors, vendorCollections } from "./vendor_database";

const globalStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: "Poppins", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    background: #f2f7ff;
    color: #0b2447;
  }

  .tf-hero,
  .tf-page {
    min-height: 100vh;
    background: linear-gradient(120deg, #c1f6d6 0%, #b8dff7 55%, #a9c5ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
  }

  .tf-hero__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.75rem;
    text-align: center;
  }

  .tf-hero__logo {
    width: 110px;
    height: 110px;
    object-fit: contain;
    border-radius: 24px;
    filter: drop-shadow(0 14px 28px rgba(28, 60, 135, 0.28));
  }

  .tf-hero__title {
    margin: 0;
    font-size: clamp(2.8rem, 6vw, 4rem);
    text-transform: uppercase;
    letter-spacing: 0.35em;
    color: #1c3c87;
    font-weight: 600;
  }

  .tf-hero__cta {
    width: min(28rem, 90vw);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    padding: 1.1rem 2.4rem;
    font-size: clamp(1.4rem, 4vw, 1.9rem);
    color: #3c69c9;
    box-shadow: 0 22px 48px rgba(60, 105, 201, 0.22);
    font-weight: 500;
    pointer-events: none;
  }

  .tf-hero__nav {
    display: flex;
    flex-wrap: wrap;
    gap: 2.5rem;
    justify-content: center;
    font-size: 1.05rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #1c8a8c;
    font-weight: 500;
  }

  .tf-hero__nav a {
    color: inherit;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    padding-bottom: 0.35rem;
    transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  }

  .tf-hero__nav a:hover {
    color: #106e70;
    border-color: #106e70;
    transform: translateY(-2px);
  }

  .tf-page__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
    width: 100%;
    max-width: 960px;
  }

  .tf-heading {
    margin: 0;
    font-size: clamp(2.6rem, 5vw, 3.6rem);
    color: #0f766e;
    font-weight: 600;
  }

  .tf-subheading {
    margin: 0;
    font-size: 1.1rem;
    color: #253a7c;
    max-width: 640px;
  }

  .tf-choice-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.85rem;
  }

  .tf-chip {
    padding: 0.65rem 1.8rem;
    border-radius: 12px;
    border: 1px solid rgba(15, 118, 110, 0.45);
    background: rgba(255, 255, 255, 0.75);
    color: #0f766e;
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  .tf-chip:hover {
    background: rgba(15, 118, 110, 0.12);
    transform: translateY(-1px);
  }

  .tf-chip.is-active {
    background: #0f766e;
    color: #ffffff;
    border-color: #0d5d58;
    box-shadow: 0 16px 32px rgba(15, 118, 110, 0.32);
  }

  .tf-form-card {
    width: min(100%, 820px);
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(14px);
    border-radius: 20px;
    padding: 2.4rem;
    box-shadow: 0 22px 48px rgba(15, 118, 110, 0.24);
  }

  .tf-form-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .tf-label {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    text-align: left;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #1d2a6b;
    font-weight: 600;
  }

  .tf-label select,
  .tf-label textarea {
    border: 1px solid rgba(37, 58, 124, 0.22);
    border-radius: 12px;
    padding: 0.75rem 0.9rem;
    font-size: 0.95rem;
    font-family: inherit;
    color: #1d2a6b;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: inset 0 2px 6px rgba(15, 118, 110, 0.08);
  }

  .tf-label textarea {
    min-height: 110px;
    resize: vertical;
  }

  .tf-submit {
    margin-top: 1.8rem;
    display: flex;
    justify-content: flex-end;
  }

  .tf-submit button {
    background: #0f766e;
    color: #ffffff;
    border: none;
    border-radius: 14px;
    padding: 0.95rem 2.8rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 18px 40px rgba(15, 118, 110, 0.3);
    transition: background 0.2s ease, transform 0.2s ease;
  }

  .tf-submit button:hover {
    background: #0c5f59;
    transform: translateY(-1px);
  }

  .tf-results {
    margin-top: 2.5rem;
    width: min(100%, 900px);
  }

  .tf-results__title {
    margin-bottom: 1.2rem;
    font-size: 1.75rem;
    color: #0f766e;
    font-weight: 600;
    text-align: left;
  }

  .tf-result-card {
    background: rgba(255, 255, 255, 0.88);
    border-radius: 18px;
    padding: 1.6rem;
    box-shadow: 0 20px 44px rgba(37, 58, 124, 0.18);
    border: 1px solid rgba(15, 118, 110, 0.24);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .tf-result-header {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  @media (min-width: 768px) {
    .tf-result-header {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .tf-result-name {
    font-size: 1.3rem;
    color: #0f766e;
    font-weight: 600;
  }

  .tf-result-score {
    font-size: 1rem;
    color: #0f766e;
    font-weight: 600;
  }

  .tf-loading,
  .tf-error {
    margin-top: 1rem;
    background: rgba(255, 255, 255, 0.78);
    border-radius: 16px;
    padding: 1.3rem 1.6rem;
    font-size: 0.98rem;
    color: #1f2f6b;
    border: 1px solid rgba(15, 118, 110, 0.18);
    text-align: left;
  }

  .tf-loading {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .tf-loading::before {
    content: "";
    width: 16px;
    height: 16px;
    border-radius: 999px;
    border: 3px solid rgba(15, 118, 110, 0.24);
    border-top-color: #0f766e;
    animation: tf-spin 0.8s linear infinite;
  }

  @keyframes tf-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .tf-database {
    width: min(100%, 1080px);
    display: grid;
    gap: 1.6rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 22px;
    padding: 2.2rem;
    box-shadow: 0 30px 52px rgba(28, 60, 135, 0.18);
  }

  @media (min-width: 900px) {
    .tf-database {
      grid-template-columns: 260px 1fr;
      align-items: flex-start;
    }
  }

  .tf-database__sidebar {
    display: flex;
    flex-direction: row;
    gap: 0.8rem;
    overflow-x: auto;
  }

  @media (min-width: 900px) {
    .tf-database__sidebar {
      flex-direction: column;
      overflow: visible;
    }
  }

  .tf-database__button {
    padding: 0.85rem 1.1rem;
    border-radius: 16px;
    border: 1px solid rgba(28, 60, 135, 0.18);
    background: rgba(255, 255, 255, 0.85);
    color: #1c3c87;
    font-size: 0.92rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    text-align: left;
  }

  .tf-database__button:hover {
    background: rgba(28, 60, 135, 0.08);
  }

  .tf-database__button.is-active {
    background: linear-gradient(135deg, #0f766e, #1c3c87);
    color: #ffffff;
    box-shadow: 0 18px 36px rgba(15, 118, 110, 0.3);
    border-color: transparent;
  }

  .tf-database__content {
    display: flex;
    flex-direction: column;
    gap: 1.3rem;
  }

  .tf-database__controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (min-width: 720px) {
    .tf-database__controls {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .tf-database__search {
    width: 100%;
    border-radius: 14px;
    border: 1px solid rgba(28, 60, 135, 0.2);
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    font-family: inherit;
    color: #1c3c87;
    box-shadow: inset 0 3px 7px rgba(15, 118, 110, 0.08);
  }

  .tf-table__wrapper {
    overflow-x: auto;
    border-radius: 18px;
    border: 1px solid rgba(28, 60, 135, 0.16);
  }

  table.tf-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
  }

  table.tf-table thead {
    background: linear-gradient(135deg, rgba(15, 118, 110, 0.95), rgba(28, 60, 135, 0.95));
    color: #ffffff;
  }

  table.tf-table th,
  table.tf-table td {
    padding: 0.9rem 1rem;
    text-align: left;
    font-size: 0.92rem;
  }

  table.tf-table tbody tr:nth-child(even) {
    background: rgba(15, 118, 110, 0.06);
  }

  table.tf-table tbody tr:hover {
    background: rgba(28, 60, 135, 0.08);
  }

  table.tf-table td {
    color: #1f2f6b;
  }

  .tf-empty-state {
    background: rgba(255, 255, 255, 0.78);
    border-radius: 18px;
    padding: 1.8rem;
    border: 2px dashed rgba(28, 60, 135, 0.28);
    font-size: 0.95rem;
    color: #253a7c;
  }

  .tf-result-text {
    font-size: 0.95rem;
    color: #1f2f6b;
    line-height: 1.6;
  }

  .tf-result-highlight {
    font-size: 0.92rem;
    color: #0f8a6f;
    font-weight: 600;
  }

  .tf-empty {
    background: rgba(255, 255, 255, 0.78);
    border: 2px dashed rgba(15, 118, 110, 0.4);
    border-radius: 18px;
    padding: 2.1rem;
    color: #253a7c;
    font-size: 1rem;
  }
`;

function Home() {
  const menuItems = [
    { label: "Security", to: "/security" },
    { label: "Cloud", to: "/cloud" },
    { label: "DB", to: "/db" },
    { label: "Support", to: "/support" },
    { label: "Work OS", to: "/workos" },
  ];

  return (
    <div className="tf-hero">
      <div className="tf-hero__inner">
        <img src="/logo.png" alt="Tech-Finder logo" className="tf-hero__logo" />
        <h1 className="tf-hero__title">Tech- Finder</h1>
        <div>
          <div className="tf-hero__cta">Choose your Software</div>
        </div>
        <nav className="tf-hero__nav">
          {menuItems.map((item) => (
            <Link key={item.label} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function CloudStep1() {
  return (
    <div className="tf-page">
      <div className="tf-page__content">
        <h2 className="tf-heading">Cloud</h2>
        <p className="tf-subheading">Business needs?</p>
        <div className="tf-choice-grid">
          {["Production", "Development", "Data Analyst", "Testing"].map((item) => (
            <Link to="/cloud/step2" key={item} className="tf-chip">
              {item}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div className="tf-page">
      <div className="tf-page__content" style={{ gap: "1.8rem" }}>
        <h2 className="tf-heading">{title}</h2>
        <p className="tf-subheading">
          We’re still curating partners for this category. In the meantime, browse the
          database to review vetted providers or capture the requirements you’d like us
          to source.
        </p>
        <Link to="/db" className="tf-chip" style={{ textDecoration: "none" }}>
          View vendor database
        </Link>
      </div>
    </div>
  );
}

function CloudStep2() {
  const [selectedNeed, setSelectedNeed] = useState("Virtual Machine");
  const [workloadSize, setWorkloadSize] = useState("Growth");
  const [budget, setBudget] = useState("Medium");
  const [weakPoints, setWeakPoints] = useState("");
  const [notes, setNotes] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setShowResults(true);
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const result = await queryCloudVendors({
        need: selectedNeed,
        workloadSize,
        budget,
        weakPoints,
      });
      setRecommendations(result);
    } catch (err) {
      setError("We couldn’t load the vendor matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const needs = [
    "Virtual Machine",
    "Storage",
    "Data Analytics",
    "BI",
    "Machine Learning",
    "Networking",
    "Security",
    "DevOps",
  ];

  return (
    <div className="tf-page">
      <div className="tf-page__content" style={{ gap: "2rem" }}>
        <h2 className="tf-heading">Cloud</h2>
        <p className="tf-subheading">
          Choose the technology need and outline your organization’s profile to
          receive tailored vendor matches.
        </p>
        <div className="tf-choice-grid">
          {needs.map((item) => (
            <button
              key={item}
              className={`tf-chip${selectedNeed === item ? " is-active" : ""}`}
              type="button"
              onClick={() => {
                setSelectedNeed(item);
                setShowResults(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="tf-form-card">
          <div className="tf-form-grid">
            <label className="tf-label">
              Workload profile
              <select
                value={workloadSize}
                onChange={(event) => {
                  setWorkloadSize(event.target.value);
                  setShowResults(false);
                }}
              >
                <option value="Startup">Startup / SMB</option>
                <option value="Growth">Growth</option>
                <option value="Digital Native">Digital Native</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Regulated">Highly Regulated</option>
                <option value="Public Sector">Public Sector</option>
              </select>
            </label>
            <label className="tf-label">
              Budget expectation
              <select
                value={budget}
                onChange={(event) => {
                  setBudget(event.target.value);
                  setShowResults(false);
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label className="tf-label" style={{ gridColumn: "1 / -1" }}>
              Primary weak points (for example: cyber threats, cost, business
              continuity)
              <textarea
                value={weakPoints}
                onChange={(event) => {
                  setWeakPoints(event.target.value);
                  setShowResults(false);
                }}
              />
            </label>
            <label className="tf-label" style={{ gridColumn: "1 / -1" }}>
              Additional notes (such as workload volumes, timelines, DevOps
              requirements)
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </div>
          <div className="tf-submit">
            <button type="submit">Get matches</button>
          </div>
        </form>
        {showResults && (
          <div className="tf-results">
            <h3 className="tf-results__title">Recommended vendors</h3>
            {isLoading && <div className="tf-loading">Retrieving matches from the Tech-Finder database…</div>}
            {error && <div className="tf-error">{error}</div>}
            {!isLoading && !error && recommendations.length === 0 ? (
              <div className="tf-empty">
                No matching vendors were found. Try adjusting your needs or reach
                out to a specialist.
              </div>
            ) : (
              recommendations.map((vendor) => (
                <div key={vendor.name} className="tf-result-card">
                  <div className="tf-result-header">
                    <div className="tf-result-name">{vendor.name}</div>
                    <div className="tf-result-score">
                      Match score: {vendor.matchScore}%
                    </div>
                  </div>
                  <p className="tf-result-text">
                    Strength areas: {vendor.focusAreas.join(", ")}
                  </p>
                  <p className="tf-result-text">{vendor.strengths}</p>
                  <p className="tf-result-text">
                    Pricing model: {vendor.pricingModel} · Regions: {vendor.regionalCoverage}
                  </p>
                  {vendor.highlightedMitigations.length > 0 && (
                    <p className="tf-result-highlight">
                      Especially addresses: {vendor.highlightedMitigations.join(", ")}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DatabaseExplorer() {
  const [activeCollection, setActiveCollection] = useState("cloud");
  const [searchTerm, setSearchTerm] = useState("");

  const collection = vendorCollections[activeCollection];

  const filteredRows = useMemo(() => {
    if (!collection) {
      return [];
    }

    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return collection.rows;
    }

    return collection.rows.filter((row) => {
      return Object.values(row).some((value) => {
        if (Array.isArray(value)) {
          return value.join(" ").toLowerCase().includes(normalized);
        }
        if (typeof value === "string") {
          return value.toLowerCase().includes(normalized);
        }
        return false;
      });
    });
  }, [collection, searchTerm]);

  return (
    <div className="tf-page">
      <div className="tf-database">
        <div className="tf-database__sidebar">
          {Object.entries(vendorCollections).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              className={`tf-database__button${activeCollection === key ? " is-active" : ""}`}
              onClick={() => {
                setActiveCollection(key);
                setSearchTerm("");
              }}
            >
              {meta.label}
            </button>
          ))}
        </div>
        <div className="tf-database__content">
          <div>
            <h2 className="tf-heading" style={{ fontSize: "2.2rem" }}>
              Vendor knowledge base
            </h2>
            <p className="tf-subheading" style={{ textAlign: "left" }}>
              {collection?.description}
            </p>
          </div>
          <div className="tf-database__controls">
            <input
              className="tf-database__search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by provider, focus area, or certification"
            />
            <div style={{ fontSize: "0.85rem", color: "#1c3c87" }}>
              {filteredRows.length} record{filteredRows.length === 1 ? "" : "s"} shown
            </div>
          </div>
          {collection?.rows.length === 0 ? (
            <div className="tf-empty-state">
              This catalogue is ready for new entries. Capture partner details and they
              will appear here automatically.
            </div>
          ) : (
            <div className="tf-table__wrapper">
              <table className="tf-table">
                <thead>
                  <tr>
                    {collection.columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={collection.columns.length} style={{ color: "#1c3c87" }}>
                        No records match your search yet—try a different keyword or clear the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id || row.name}>
                        {collection.columns.map((column) => {
                          const value = row[column.key];
                          if (Array.isArray(value)) {
                            return <td key={column.key}>{value.join(", ")}</td>;
                          }
                          return <td key={column.key}>{value || "—"}</td>;
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <style>{globalStyles}</style>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cloud" element={<CloudStep1 />} />
        <Route path="/cloud/step2" element={<CloudStep2 />} />
        <Route path="/security" element={<PlaceholderPage title="Security" />} />
        <Route path="/support" element={<PlaceholderPage title="Support" />} />
        <Route path="/workos" element={<PlaceholderPage title="Work OS" />} />
        <Route path="/db" element={<DatabaseExplorer />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

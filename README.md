# Tech Finder demo workspace

This repository stores the Tech Finder single-page React experience that pairs an interactive onboarding wizard with a curated vendor database.  The code is designed to be copied into a modern React scaffold (such as Vite) so you can explore the flow locally or integrate it into an existing frontend.

## Repository layout

| Path | Purpose |
| --- | --- |
| `tech_finder_site.jsx` | Main React entry point that injects the global styles, renders the hero, and wires the supplier matching wizard. |
| `vendor_database.js` | Curated vendor records plus the scoring logic used by both the UI and backend. |
| `database.js` | Initializes the SQLite database, seeds vendor tables, and exposes persistence helpers. |
| `server.js` | Express API that exposes vendor catalogue endpoints and persists submitted briefs. |
| `package.json` | Declares the backend dependencies (Express, better-sqlite3) and start scripts. |
| `data/` | Holds the SQLite database file (`tech_finder.db`, generated on first run). |
| `vercel.json` | Example hosting configuration for static deployment. |
| `.gitignore` | Prevents generated folders (e.g., `node_modules`) from causing conflicts. |

> **Heads-up:** The UI expects a `/logo.png` asset. When copying the app into another project, add your preferred logo to the destination scaffold’s `public/logo.png` (or adjust the `<img src>` in `tech_finder_site.jsx`).

## Run the API server

Install the backend dependencies and start the Express server:

```bash
npm install
npm run start
```

By default the API listens on `http://localhost:4000`. Set `PORT` if you prefer another port.
The server will create `data/tech_finder.db` on first launch, seed it with the curated vendor catalogue, and manage all reads/writes through SQLite. Remove the file if you’d like to reset the environment.

### Database schema

The Express server provisions three tables automatically:

| Table | Purpose |
| --- | --- |
| `products` | Stores every technology supplier (cloud, security, and future categories) along with focus areas, workloads, certifications, and differentiators. |
| `users` | Captures the people who submit briefs (email, name, company) so repeated requests are associated with the same account. |
| `searches` | Persists each cloud brief, including the submitted requirements, top three recommended vendors, and a pointer back to the submitting user. |

All tables are created with foreign-key constraints, and `products` is automatically seeded using the records defined in `vendor_database.js`.

## Run the UI locally (Vite example)

```bash
npm create vite@latest tech-finder-demo -- --template react
cd tech-finder-demo
npm install
npm install react-router-dom
```

1. Replace the generated `src/App.jsx` with the contents of `tech_finder_site.jsx`.
2. Copy `vendor_database.js` into the scaffold’s `src/` directory so the relative imports resolve for utility functions used by the UI (if you plan to call them directly).
3. Add your `public/logo.png` asset if you want the hero image to appear.
4. Expose the API base URL to the frontend (the default assumes `http://localhost:4000`):
   ```bash
   echo "VITE_API_BASE_URL=http://localhost:4000" >> .env.local
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open the URL printed by Vite (typically `http://localhost:5173/`).

The UI injects its own global styles, so the gradient hero and glassmorphism cards render without Tailwind. If you prefer to integrate Tailwind or another design system, replace or extend the style block near the top of `tech_finder_site.jsx`.

## Working with the vendor database

The UI now communicates with the backend API:

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/collections` | GET | Returns the category metadata and vendor rows for the explorer view. |
| `/api/products` | GET | Emits the raw product records from the `products` table for administrative dashboards or audits. |
| `/api/cloud-matches` | POST | Accepts `{ need, workloadSize, budget, weakPoints }` and returns ranked vendor matches (scores capped at 100%). |
| `/api/cloud-briefs` | GET | Retrieves the saved request history rendered beneath the wizard. |
| `/api/cloud-briefs` | POST | Persists submitted briefs, top matches, and optional contact details (`contactName`, `contactEmail`, `contactCompany`). |
| `/api/users` | GET | Lists the registered contacts captured from submitted briefs. |

Submitting the cloud form with a contact email automatically upserts a record in the `users` table and ties each saved brief to that profile, giving you a full audit trail of which organization requested which recommendations.

If you embed the UI in another project, configure `VITE_API_BASE_URL` (or `process.env.VITE_API_BASE_URL` during SSR) so requests target the running backend instance.

## After resolving merge conflicts

1. Run `git status` to confirm that only the intended files (for example `tech_finder_site.jsx`, `vendor_database.js`, or `README.md`) remain with merge markers removed.
2. Stage the fixes: `git add <files>`.
3. Optionally lint or run your preferred checks locally.
4. Commit the resolution: `git commit -m "Resolve merge conflicts"` (choose an appropriate message).
5. Push the branch: `git push`.
6. Refresh your pull request and verify that CI (if any) is green before requesting another review.

These steps ensure the resolved merge makes it to the remote repository without reintroducing conflicts from generated assets.

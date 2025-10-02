# Tech Finder demo workspace

This repository stores the Tech Finder single-page React experience that pairs an interactive onboarding wizard with a curated vendor database.  The code is designed to be copied into a modern React scaffold (such as Vite) so you can explore the flow locally or integrate it into an existing frontend.

## Repository layout

| Path | Purpose |
| --- | --- |
| `tech_finder_site.jsx` | Main React entry point that injects the global styles, renders the hero, and wires the supplier matching wizard. |
| `vendor_database.js` | In-memory records for cloud & security vendors plus scoring logic used by the wizard. |
| `vercel.json` | Example hosting configuration for static deployment. |
| `.gitignore` | Prevents generated folders (e.g., `node_modules`) from causing conflicts. |

> **Heads-up:** The UI expects a `/logo.png` asset. When copying the app into another project, add your preferred logo to the destination scaffold’s `public/logo.png` (or adjust the `<img src>` in `tech_finder_site.jsx`).

## Run the UI locally (Vite example)

```bash
npm create vite@latest tech-finder-demo -- --template react
cd tech-finder-demo
npm install
npm install react-router-dom
```

1. Replace the generated `src/App.jsx` with the contents of `tech_finder_site.jsx`.
2. Copy `vendor_database.js` into the scaffold’s `src/` directory so the relative import (`./vendor_database`) resolves.
3. Add your `public/logo.png` asset if you want the hero image to appear.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open the URL printed by Vite (typically `http://localhost:5173/`).

The UI injects its own global styles, so the gradient hero and glassmorphism cards render without Tailwind. If you prefer to integrate Tailwind or another design system, replace or extend the style block near the top of `tech_finder_site.jsx`.

## Working with the vendor database

The wizard calls `queryCloudVendors` from `vendor_database.js` to rank suppliers based on the selected needs, workload size, budget, and weak points.  You can edit the records or extend `vendorCollections` to surface more categories in the navigation.

## After resolving merge conflicts

1. Run `git status` to confirm that only the intended files (for example `tech_finder_site.jsx`, `vendor_database.js`, or `README.md`) remain with merge markers removed.
2. Stage the fixes: `git add <files>`.
3. Optionally lint or run your preferred checks locally.
4. Commit the resolution: `git commit -m "Resolve merge conflicts"` (choose an appropriate message).
5. Push the branch: `git push`.
6. Refresh your pull request and verify that CI (if any) is green before requesting another review.

These steps ensure the resolved merge makes it to the remote repository without reintroducing conflicts from generated assets.

# Architecture Overview

Veloce Sales Analytics is an enterprise revenue intelligence platform designed to help sales leadership, financial analysts, and regional directors evaluate quarterly commercial performance and detect regional revenue fluctuations. The application ingests order transactions via CSV upload or preloaded enterprise datasets, computes mathematically rigorous aggregations across global sales regions, channels, and product lines, and produces interactive visual dashboards alongside multi-dimensional pivot tables. To empower executive decision-making without hallucination risk, the platform combines a deterministic calculation engine with server-side Gemini AI to generate audit-ready, three-sentence quarterly shift summaries grounded strictly in calculated ledger metrics.

## File Catalog

| File | Description |
| :--- | :--- |
| `ARCHITECTURE.md` | Provides a high-level business overview of the platform and a comprehensive file-by-file system catalog. |
| `.env.example` | Documents template environment variables required for server-side operations, specifically the Gemini API key. |
| `.gitignore` | Configures version control to exclude local dependencies, build directories, and environment secrets. |
| `index.html` | Serves as the HTML entry point and shell for the application, defining branding metadata and font resources. |
| `metadata.json` | Declares platform-level application metadata, permissions, and server-side AI runtime capabilities. |
| `package.json` | Defines project dependencies, package metadata, and scripts for building, linting, and serving the platform. |
| `server.ts` | Runs the Node.js Express backend that serves the application, manages API routes, and interfaces with Gemini for executive briefings. |
| `src/App.tsx` | Coordinates primary dashboard state, tab switching, file uploads, metric aggregation pipelines, and AI summary fetching. |
| `src/components/AiSummaryCard.tsx` | Renders the executive regional shift brief with copy actions, status indicators, and an expandable mathematical verification ledger. |
| `src/components/CsvUploader.tsx` | Provides an interactive modal and drag-and-drop file interface for parsing user-uploaded sales order CSVs or loading sample data. |
| `src/components/Header.tsx` | Displays top-level navigation, application branding, active view controls, and quick-action buttons for data ingestion. |
| `src/components/PivotTable.tsx` | Renders a multi-dimensional matrix aggregating revenue, unit volume, and average discount rates across quarters, regions, and channels. |
| `src/components/RawOrdersTable.tsx` | Presents a searchable, filterable, and paginated data table for auditing granular sales order transactions. |
| `src/components/RevenueChart.tsx` | Visualizes quarterly sales trajectories and comparative regional performance using dynamic, interactive bar charts. |
| `src/index.css` | Configures global typography, Tailwind CSS directives, and tabular numeric font rules for financial reporting. |
| `src/main.tsx` | Initializes the client-side React runtime and mounts the root dashboard into the browser DOM. |
| `src/types.ts` | Defines TypeScript schemas and domain models for sales orders, calculation aggregations, regional deltas, and AI payloads. |
| `src/utils/analytics.ts` | Houses the analytical calculation engine that computes financial totals, regional delta shifts, top product drivers, and verified fallback summaries. |
| `src/utils/csv.ts` | Parses raw CSV text, validates header formats, and transforms transaction rows into typed sales order records with error handling. |
| `src/utils/sampleData.ts` | Supplies a representative enterprise dataset of quarterly sales orders spanning multiple regions, channels, and product families. |
| `tsconfig.json` | Configures TypeScript compiler settings, import path aliases, and module resolution standards for the codebase. |
| `vite.config.ts` | Configures the Vite development and build tooling, bundling React components and Tailwind CSS utilities. |

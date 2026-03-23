# OptiMetrics 🚀

OptiMetrics is a powerful, full-stack Ad Performance Analytics platform tailored for Product Analysts and Ad Operations Teams. It processes massive volumes of ad metrics—including CTR, CPC, Revenue, and Impressions—and features an automated **Insights Engine** to detect anomalies, ad fatigue, and top-performing campaigns.

---

## 🎥 Project Demo

Here is a short recording of the OptiMetrics dashboard in action:

![OptiMetrics Demo](public/optimetrics_demo.webp)

![Dashboard Snapshot](public/optimetrics_screenshot.png)

---

## 📖 About the Project & What We Have Done

The goal of this project was to build a highly responsive, end-to-end analytics dashboard that can handle massive datasets while providing actionable insights. 

**What we have done:**
1. **Frontend Architecture:** Built a beautiful, brand-aligned UI using Next.js App Router and Tailwind CSS v4, featuring a persistent sidebar and complex data visualizations.
2. **Backend API Layer:** Engineered custom REST endpoints to aggregate, filter, and paginate through hundreds of thousands of ad performance logs.
3. **Anomaly Rules Engine:** Implemented an automated analysis pipeline that parses the data to flag anomalies (e.g., unusually high spend with low conversion, localized device anomalies) and opportunities (e.g., scalable high-CTR campaigns).
4. **Data Pipeline:** Created a robust PostgreSQL schema and a massive mock data seeder capable of inserting 100,000+ rows of realistic ad telemetry.

---

## 🛠 Tech Stack (What We Used)

- **Frontend Framework:** Next.js (App Router) v15+
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Charting Library:** Recharts
- **Database:** PostgreSQL
- **Database Client:** `pg` (node-postgres)
- **Icons:** Lucide React

---

## 🧭 Dashboard Guide: How It Works

The platform is divided into four main sections, accessible via the sidebar:

1. **Dashboard (Overview):** 
   - Displays top-level KPI scorecards (Total Impressions, Clicks, Average CTR, Total Revenue, Average CPC).
   - Features a dual-axis line/bar chart showing Revenue vs CTR over time, and a donut chart breaking down revenue by device.
2. **Ad Rankings:**
   - A comprehensive data table for deep-diving into individual ad performance.
   - Includes full pagination, dynamic column sorting, and a search filter. Group data quickly by predefined tabs like "Highest Revenue" or "Needs Attention".
3. **Segmentation:**
   - Granular breakdown of metrics grouped by dimensions like **Device** (Mobile vs Desktop) and **Country**.
   - Side-by-side bar charts enable quick visual comparisons.
4. **Insights & Alerts:**
   - The heart of the platform. The automated engine runs over your date range to produce colored "Alert Cards".
   - Flags issues like *Ad Fatigue* (high impressions/low CTR) and *Opportunities* (high CTR/low spend), assigning them priority levels (High/Medium/Low).

---

## 💾 Data Architecture (How to use it with your data)

OptiMetrics is designed to ingest granular ad telemetry. 

### What kind of data is used?
The application is pre-seeded with **100,000 rows** of mock data simulating real-world ad performance. The data includes:
- `ad_id`, `campaign_id`
- `impressions`, `clicks`, `revenue`, `spend`
- `date`, `device`, `country`

### How to use it with your own data
There are two ways to bring your own data into OptiMetrics:
1. **Manual Database Entry:** Connect the OptiMetrics schema (`ad_performance_raw` table) to your existing data pipeline and write your real ad data directly into Postgres.
2. **API Ingestion:** You can use the built-in `POST /api/ingest` endpoint to bulk-insert raw CSV payloads containing your ad telemetry. 

---

## ⚙️ Installation & Local Setup

OptiMetrics is designed to be easily run on any local environment. Follow these exact steps to get the platform running locally on your machine.

### Requirements & Prerequisites:
Before installing, please ensure you have the following installed on your system:
- **Node.js**: Version 20.9.0 or higher is required to support the Next.js 15 runtime and Tailwind CSS v4 backend.
- **npm**: Comes with Node.js.
- **Git**: To clone the repository.
- **PostgreSQL**: A running instance of a PostgreSQL database. You can install Postgres locally (e.g. via Homebrew or Windows installer) or run it using Docker.

### 1. Clone the Repository
Begin by cloning the source code to your machine:
```bash
git clone https://github.com/Ayush307K/OptiMetrics.git
cd OptiMetrics
```

### 2. Install Project Dependencies
Use npm to install all required Node packages:
```bash
npm install
```

### 3. Setup the Database Connection
OptiMetrics needs to connect to your PostgreSQL database.
First, ensure you have created an empty database (for example, named `optimetrics`) inside PostgreSQL.
Then, create a `.env.local` file at the root of the project directory and add your Postgres connection string:
```bash
# Example syntax: postgres://[user]:[password]@localhost:5432/[database_name]
DATABASE_URL=postgres://user:password@localhost:5432/optimetrics
```

### 4. Create Schema and Seed the Database
OptiMetrics comes with a robust seeding script that automatically constructs the PostgreSQL tables and pushes 100,000 realistic rows of mock ad tracking data so you can test the dashboard right away.
```bash
node scripts/seed.mjs
```
*(Wait until you see "Seeding completed successfully!")*

### 5. Start the Local Server
Boot up the Next.js development server:
```bash
npm run dev
```

### 6. Access the Dashboard
Navigate your web browser to:
[http://localhost:3000](http://localhost:3000)

Congratulations! You should now see the OptiMetrics UI rendering the 100k generated test rows on your local machine.

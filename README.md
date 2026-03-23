# OptiMetrics 🚀

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAyush307K%2FOptiMetrics)

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

Want to run OptiMetrics on your local machine? Follow these steps:

### Prerequisites:
- **Node.js**: v20.9.0 or higher
- **PostgreSQL**: A running instance (either locally or via Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/Ayush307K/OptiMetrics.git
cd OptiMetrics
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup the Database Connection
Create a `.env.local` file at the root of the project and add your Postgres connection string:
```bash
# Example for a local PostgreSQL database
DATABASE_URL=postgres://user:password@localhost:5432/optimetrics
```

### 4. Seed the Database
Populate your database with the required schema and 100,000 rows of test data:
```bash
node scripts/seed.mjs
```

### 5. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

---

## 🌐 Deploy to Vercel

If you want to watch the deployment on Vercel and host it live:

1. **Push to GitHub**: Ensure this code is pushed to your GitHub repository.
2. **Import Project**: Go to [Vercel](https://vercel.com/new) and import your new `OptiMetrics` repository.
3. **Configure Database**: You will need a hosted PostgreSQL database (such as Supabase, Neon, or Vercel Postgres). 
4. **Environment Variables**: In the Vercel deployment settings, add the `DATABASE_URL` variable pointing to your hosted database.
5. **Deploy**: Click "Deploy". Vercel will automatically build the Next.js application and provide you with a live URL!

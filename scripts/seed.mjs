import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const devices = ['mobile', 'desktop', 'tablet'];
const countries = ['US', 'UK', 'CA', 'FR', 'DE', 'IN', 'JP', 'AU', 'BR', 'MX'];

async function main() {
  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error('Failed to connect to DB. Ensure Postgres is running:', err.message);
    process.exit(1);
  }

  try {
    console.log('Creating table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ad_performance_raw (
        id SERIAL PRIMARY KEY,
        ad_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        clicks INTEGER NOT NULL,
        impressions INTEGER NOT NULL,
        revenue DECIMAL(10, 2) NOT NULL,
        device VARCHAR(50) NOT NULL,
        country VARCHAR(2) NOT NULL,
        timestamp TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_ad_id ON ad_performance_raw(ad_id);
      CREATE INDEX IF NOT EXISTS idx_device ON ad_performance_raw(device);
      CREATE INDEX IF NOT EXISTS idx_country ON ad_performance_raw(country);
    `);

    const { rows } = await client.query('SELECT COUNT(*) as count FROM ad_performance_raw');
    if (parseInt(rows[0].count) > 0) {
      console.log('Database already seeded.');
      return;
    }

    console.log('Seeding 100,000 rows...');
    const batchSize = 1000;
    for (let i = 0; i < 100000; i += batchSize) {
      const values = [];
      for (let j = 0; j < batchSize; j++) {
        const ad_id = `AD-${Math.floor(Math.random() * 50) + 1}`;
        const user_id = `USR-${Math.floor(Math.random() * 10000)}`;
        const impressions = Math.floor(Math.random() * 100) + 1;
        // Ensure rules triggers are possible
        let clicks = Math.floor(Math.random() * impressions * 0.05); // 0-5% CTR
        let revenue = clicks * (Math.random() * 2 + 0.5); // CPC $0.5 - $2.5
        
        // Inject anomalies:
        if (ad_id === 'AD-1') {
          clicks = Math.floor(impressions * 0.001); // Fatigue
        } else if (ad_id === 'AD-2') {
          clicks = Math.floor(impressions * 0.15); // Top performer
          revenue = clicks * 5;
        }

        const device = devices[Math.floor(Math.random() * devices.length)];
        const country = countries[Math.floor(Math.random() * countries.length)];
        const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();

        values.push(`('${ad_id}', '${user_id}', ${clicks}, ${impressions}, ${revenue.toFixed(2)}, '${device}', '${country}', '${timestamp}')`);
      }
      const query = `INSERT INTO ad_performance_raw (ad_id, user_id, clicks, impressions, revenue, device, country, timestamp) VALUES ${values.join(',')}`;
      await client.query(query);
      if (i % 10000 === 0) console.log(`Seeded ${i} / 100000 rows`);
    }
    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    client.release();
    pool.end();
  }
}
main();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
const PORT = 9998;

app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Endpoint to log a test run and trigger Jenkins
app.post('/api/trigger-test', async (req, res) => {
  const { repoUrl, branch } = req.body;
  if (!repoUrl || !branch) return res.status(400).json({ error: 'Parameters missing' });

  try {
    // 1. Persist run into Postgres
    const dbResult = await pool.query(
      'INSERT INTO test_runs (repo_url, branch, status) VALUES ($1, $2, $3) RETURNING id',
      [repoUrl, branch, 'PENDING']
    );

    // 2. Trigger External Jenkins via basic authentication
    const authHeader = Buffer.from(`${process.env.JENKINS_USER}:${process.env.JENKINS_TOKEN}`).toString('base64');
    await axios.post(`${process.env.JENKINS_URL}/job/Run-E2E-Tests/buildWithParameters`, null, {
      params: { 
        token: process.env.JENKINS_JOB_TOKEN, 
        GIT_REPO_URL: repoUrl, 
        GIT_BRANCH: branch 
      },
      headers: { 
        'Authorization': `Basic ${authHeader}`, 
        'Content-Type': 'application/x-www-form-urlencoded' 
      }
    });

    res.status(200).json({ success: true, testRunId: dbResult.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch pipeline history for React dashboard UI grid
app.get('/api/test-history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM test_runs ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));


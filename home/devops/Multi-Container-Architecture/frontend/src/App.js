import React, { useState, useEffect } from 'react';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:9900';

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/test-history`);
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch (err) {
      console.error('Failed fetching histories', err);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const triggerTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/trigger-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, branch })
      });
      setRepoUrl('');
      fetchHistory();
    } catch (err) {
      alert('Error triggering execution pipeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🛠️ QA Automation Dashboard</h1>
      
      <form onSubmit={triggerTest} style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Trigger Run</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>GitHub Repository URL:</label><br/>
          <input type="text" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} placeholder="https://github.com"/>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Target Branch Name:</label><br/>
          <input type="text" value={branch} onChange={e => setBranch(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }}/>
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#007bef', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Queueing Build...' : 'Execute Test Run'}
        </button>
      </form>

      <h3>Execution Logs & History</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#ddd', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Repository</th>
            <th style={{ padding: '10px' }}>Branch</th>
            <th style={{ padding: '10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map(run => (
            <tr key={run.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '10px' }}>{run.id}</td>
              <td style={{ padding: '10px' }}>{run.repo_url}</td>
              <td style={{ padding: '10px' }}>{run.branch}</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#f39c12', fontWeight: 'bold' }}>{run.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;


import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!result || !result.cleanedRows) return;

    const headers = Object.keys(result.cleanedRows[0]);
    const csvContent = [
      headers.join(','),
      ...result.cleanedRows.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_leads.csv';
    a.click();
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '10px' }}>
        🧹 CSV Lead Cleaner
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
        Upload your CSV to remove duplicates, validate emails, and enrich data
      </p>

      {/* Upload Section */}
      <div style={{ 
        border: '2px dashed #ccc', 
        borderRadius: '12px', 
        padding: '40px', 
        textAlign: 'center',
        marginBottom: '30px',
        backgroundColor: '#fafafa'
      }}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ marginBottom: '20px' }}
        />
        <br />
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          style={{
            backgroundColor: loading || !file ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            fontSize: '16px',
            borderRadius: '8px',
            cursor: loading || !file ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Processing...' : 'Clean My Data'}
        </button>
        {file && <p style={{ marginTop: '15px', color: '#666' }}>Selected: {file.name}</p>}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          color: '#c00', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div>
          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <StatCard label="Total Rows" value={result.stats.totalRows} color="#2196F3" />
            <StatCard label="Duplicates Removed" value={result.stats.duplicatesRemoved} color="#FF9800" />
            <StatCard label="Valid Emails" value={result.stats.validEmails} color="#4CAF50" />
            <StatCard label="Invalid Websites" value={result.stats.invalidWebsites} color="#f44336" />
          </div>

          {/* Download Button */}
          <button
            onClick={downloadCSV}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}
          >
            📥 Download Cleaned CSV
          </button>

          {/* Data Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  {Object.keys(result.cleanedRows[0]).map(header => (
                    <th key={header} style={{ 
                      padding: '12px', 
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.cleanedRows.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    {Object.values(row).map((value, i) => (
                      <td key={i} style={{ padding: '12px' }}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for stats
function StatCard({ label, value, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color, marginBottom: '5px' }}>
        {value}
      </div>
      <div style={{ color: '#666', fontSize: '14px' }}>{label}</div>
    </div>
  );
}

export default App;
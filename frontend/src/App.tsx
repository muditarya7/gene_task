import { useState, useEffect } from 'react';
import * as Plotly from 'plotly.js-dist';

const App = () => {
  const [genes, setGenes] = useState(['', '']);
  const [activeTab, setActiveTab] = useState('fasta');
  const [fastaData, setFastaData] = useState('');
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addGeneField = () => {
    if (genes.length < 10) {
      setGenes([...genes, '']);
    }
  };

  const removeGeneField = (index: number) => {
    if (genes.length > 1) {
      setGenes(genes.filter((_, i) => i !== index));
    }
  };

  const updateGene = (index: number, value: string) => {
    const newGenes = [...genes];
    newGenes[index] = value;
    setGenes(newGenes);
  };

  const validateGenes = () => {
    const validGenes = genes.filter((g) => g.trim() !== '');
    if (validGenes.length === 0) {
      setError('Please enter at least one gene name');
      return null;
    }
    if (validGenes.length > 10) {
      setError('Maximum 10 genes allowed');
      return null;
    }
    setError('');
    return validGenes;
  };

  const fetchFasta = async () => {
    const validGenes = validateGenes();
    if (!validGenes) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/get_fasta/?genes=${validGenes.join(',')}` //Calling FASTA sequence API
      );
      const data = await response.text();

      if (!data || data.trim() === '') {
        setError('No sequences found for the given genes');
        setFastaData('');
      } else {
        setFastaData(data);
      }
    } catch (err) {
      setError('Failed to fetch FASTA data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    const validGenes = validateGenes();
    if (!validGenes) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/get_heatmap/?genes=${validGenes.join(',')}` //Calling Heatmap API
      );
      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setHeatmapData(null);
      } else {
        setHeatmapData(result.data);
      }
    } catch (err) {
      setError('Failed to fetch heatmap data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTSV = async () => {
    const validGenes = validateGenes();
    if (!validGenes) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/download_tsv/?genes=${validGenes.join(',')}` //Calling TSV file download API
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to download TSV file');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gene_expression.tsv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download TSV file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (heatmapData && activeTab === 'heatmap') {
      const plotDiv = document.getElementById('heatmap-plot');
      if (plotDiv) {
        const layout = {
          title: 'Gene Expression Heatmap',
          xaxis: { title: 'Samples' },
          yaxis: { title: 'Genes' },
          margin: { t: 50, l: 150, r: 50, b: 50 },
        };

        Plotly.newPlot(plotDiv, [heatmapData], layout, { responsive: true });
      }
    }
  }, [heatmapData, activeTab]);

  const handleTabAction = () => {
    if (activeTab === 'fasta') {
      fetchFasta();
    } else if (activeTab === 'heatmap') {
      fetchHeatmap();
    } else if (activeTab === 'download') {
      downloadTSV();
    }
  };

  const validGeneCount = genes.filter((g) => g.trim() !== '').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-800 mb-2">
            Gene Analysis
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-700">Gene Names</h2>
            <div className="space-x-2">
              <button
                onClick={addGeneField}
                disabled={genes.length >= 10}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                + Add Gene
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {genes.map((gene, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={gene}
                  onChange={(e) => updateGene(index, e.target.value)}
                  placeholder={`Gene ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {genes.length > 1 && (
                  <button
                    onClick={() => removeGeneField(index)}
                    className="px-3 py-2 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('fasta')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'fasta'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                FASTA Sequences
              </button>
              <button
                onClick={() => setActiveTab('heatmap')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'heatmap'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Expression Heatmap
              </button>
              <button
                onClick={() => setActiveTab('download')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'download'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Download TSV
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'fasta' && (
              <div>
                <button
                  onClick={handleTabAction}
                  disabled={loading || validGeneCount === 0}
                  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Get Sequences'}
                </button>
                {fastaData && (
                  <pre className="bg-gray-50 p-4 rounded border border-gray-200 whitespace-pre-wrap break-all font-mono text-sm max-h-96 overflow-y-auto">
                    {fastaData}
                  </pre>
                )}
              </div>
            )}

            {activeTab === 'heatmap' && (
              <div>
                <button
                  onClick={handleTabAction}
                  disabled={loading || validGeneCount === 0}
                  className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Generate Heatmap'}
                </button>
                {heatmapData && (
                  <div id="heatmap-plot" className="w-full h-96"></div>
                )}
              </div>
            )}

            {activeTab === 'download' && (
              <div>
                <button
                  onClick={handleTabAction}
                  disabled={loading || validGeneCount === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Downloading...' : 'Download TSV File'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';

export default function DiseaseDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    setFile(selected);
    setResult(null);
    setError('');

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/disease/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(
        'Could not analyze the image. Please make sure the AI service and backend are running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Disease Scan 🌿"
        subtitle="Upload a crop or leaf photo to identify possible diseases and get practical guidance."
      />

      <div className="grid grid-2">

        {/* Upload section */}
        <form onSubmit={handleSubmit} className="card">

          <div className="form-group">
            <label className="form-label">
              Leaf / Crop Photo
            </label>

            <input
              className="form-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          {preview && (
            <div style={{ marginBottom: 16 }}>
              <img
                src={preview}
                alt="Selected crop"
                style={{
                  width: '100%',
                  borderRadius: 12,
                  maxHeight: 300,
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {error && (
            <p
              style={{
                color: 'var(--color-danger)',
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              {error}
            </p>
          )}

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={loading || !file}
          >
            {loading ? 'Analyzing...' : 'Detect Disease'}
          </button>
        </form>

        {/* Result section */}
        <div className="card card-accent-left">
          <h3
            className="font-display"
            style={{ marginBottom: 16 }}
          >
            Diagnosis Result
          </h3>

          {!result && !loading && (
            <p className="text-muted">
              Upload an image to see the CNN prediction and
              crop-care guidance here.
            </p>
          )}

          {loading && (
            <p className="text-muted">
              🔍 Analyzing the image with the trained CNN...
            </p>
          )}

          {result && (
            <div>

              {/* Crop */}
              {result.crop && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ marginBottom: 4 }}>
                    <strong>🌱 Crop</strong>
                  </p>
                  <p className="text-muted">
                    {result.crop}
                  </p>
                </div>
              )}

              {/* Disease */}
              <div style={{ marginBottom: 14 }}>
                <p style={{ marginBottom: 6 }}>
                  <strong>🔬 Detected Disease</strong>
                </p>

                <span className="badge badge-green">
                  {result.disease || 'Unknown'}
                </span>
              </div>

              {/* Confidence */}
              <div style={{ marginBottom: 14 }}>
                <p style={{ marginBottom: 4 }}>
                  <strong>🎯 Confidence</strong>
                </p>

                <p className="text-muted">
                  {result.confidence_percent !== undefined
                    ? `${result.confidence_percent}%`
                    : result.confidence !== undefined
                      ? `${(result.confidence * 100).toFixed(1)}%`
                      : 'N/A'}
                </p>
              </div>

              <div className="divider" />

              {/* Why detected */}
              {result.why_detected && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ marginBottom: 6 }}>
                    <strong>🔎 Why this was detected</strong>
                  </p>

                  <p className="text-muted">
                    {result.why_detected}
                  </p>
                </div>
              )}

              {/* Symptoms */}
              {result.symptoms && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ marginBottom: 6 }}>
                    <strong>⚠️ Symptoms</strong>
                  </p>

                  <p className="text-muted">
                    {result.symptoms}
                  </p>
                </div>
              )}

              {/* Recommendation */}
              {result.recommendation && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ marginBottom: 6 }}>
                    <strong>💡 Recommended Action</strong>
                  </p>

                  <p className="text-muted">
                    {result.recommendation}
                  </p>
                </div>
              )}

              {/* Prevention */}
              {result.prevention && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ marginBottom: 6 }}>
                    <strong>🛡️ Prevention</strong>
                  </p>

                  <p className="text-muted">
                    {result.prevention}
                  </p>
                </div>
              )}

              {/* Model information */}
              {result.model && (
                <>
                  <div className="divider" />

                  <p
                    className="text-muted"
                    style={{
                      fontSize: 12,
                      marginBottom: 0,
                    }}
                  >
                    Model: {result.model}
                  </p>
                </>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
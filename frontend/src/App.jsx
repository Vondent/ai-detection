import { useState, useRef } from "react";

const STATUS = { IDLE: "idle", LOADING: "loading", DONE: "done", ERROR: "error" };

export default function App() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef();

  async function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;

    setPreview(URL.createObjectURL(file));
    setStatus(STATUS.LOADING);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      setStatus(STATUS.DONE);
    } catch {
      setStatus(STATUS.ERROR);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function reset() {
    setStatus(STATUS.IDLE);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const isFake = result?.label === "fake";

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.headerIcon}>⬡</span>
          <h1 style={styles.title}>FACE VERIFY</h1>
          <p style={styles.subtitle}>AI-generated image detection</p>
        </div>

        {/* Drop Zone */}
        {status === STATUS.IDLE && (
          <div
            style={{ ...styles.dropZone, ...(dragging ? styles.dropZoneActive : {}) }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <div style={styles.dropIcon}>↑</div>
            <p style={styles.dropText}>Drop image here</p>
            <p style={styles.dropSub}>or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        )}

        {/* Loading */}
        {status === STATUS.LOADING && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Analyzing image...</p>
          </div>
        )}

        {/* Result */}
        {status === STATUS.DONE && result && (
          <div style={styles.resultBox}>
            <img src={preview} alt="uploaded" style={styles.previewImg} />
            <div style={styles.resultContent}>
              <div style={{
                ...styles.verdict,
                color: isFake ? "#ff4d4d" : "#00e676",
                borderColor: isFake ? "#ff4d4d33" : "#00e67633",
                background: isFake ? "#ff4d4d0a" : "#00e6760a",
              }}>
                {isFake ? "⚠ AI GENERATED" : "✓ AUTHENTIC"}
              </div>
              <p style={styles.confidenceLabel}>Confidence</p>
              <div style={styles.barTrack}>
                <div style={{
                  ...styles.barFill,
                  width: `${result.confidence * 100}%`,
                  background: isFake
                    ? "linear-gradient(90deg, #ff4d4d, #ff8080)"
                    : "linear-gradient(90deg, #00e676, #69f0ae)",
                }} />
              </div>
              <p style={{ ...styles.confidenceValue, color: isFake ? "#ff4d4d" : "#00e676" }}>
                {result.confidence}
              </p>
            </div>
            <button style={styles.resetBtn} onClick={reset}>
              Analyze another image
            </button>
          </div>
        )}

        {/* Error */}
        {status === STATUS.ERROR && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>Something went wrong.</p>
            <button style={styles.resetBtn} onClick={reset}>Try again</button>
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080808",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Rajdhani', sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#0e0e0e",
    border: "1px solid #222",
    borderRadius: "4px",
    padding: "40px 36px",
    animation: "fadeIn 0.4s ease",
  },
  header: {
    textAlign: "center",
    marginBottom: "36px",
  },
  headerIcon: {
    fontSize: "1.4rem",
    color: "#555",
    display: "block",
    marginBottom: "8px",
    letterSpacing: "4px",
  },
  title: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "1.8rem",
    fontWeight: "400",
    color: "#fff",
    letterSpacing: "6px",
    margin: "0 0 6px 0",
  },
  subtitle: {
    color: "#444",
    fontSize: "0.78rem",
    letterSpacing: "3px",
    textTransform: "uppercase",
    margin: 0,
  },
  dropZone: {
    border: "1px dashed #2a2a2a",
    borderRadius: "4px",
    padding: "50px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "#0a0a0a",
  },
  dropZoneActive: {
    borderColor: "#fff",
    background: "#111",
  },
  dropIcon: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "12px",
    fontFamily: "'Share Tech Mono', monospace",
  },
  dropText: {
    color: "#555",
    fontSize: "0.95rem",
    letterSpacing: "1px",
    margin: "0 0 4px 0",
  },
  dropSub: {
    color: "#333",
    fontSize: "0.8rem",
    letterSpacing: "1px",
    margin: 0,
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "50px 0",
    gap: "16px",
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "2px solid #222",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#444",
    fontSize: "0.8rem",
    letterSpacing: "3px",
    textTransform: "uppercase",
    margin: 0,
  },
  resultBox: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    animation: "fadeIn 0.4s ease",
  },
  previewImg: {
    width: "100%",
    maxHeight: "280px",
    objectFit: "cover",
    borderRadius: "4px",
    border: "1px solid #1a1a1a",
  },
  resultContent: {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    borderRadius: "4px",
    padding: "20px",
  },
  verdict: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "1.1rem",
    letterSpacing: "3px",
    padding: "10px 16px",
    border: "1px solid",
    borderRadius: "2px",
    marginBottom: "20px",
    textAlign: "center",
  },
  confidenceLabel: {
    color: "#333",
    fontSize: "0.7rem",
    letterSpacing: "3px",
    textTransform: "uppercase",
    margin: "0 0 8px 0",
  },
  barTrack: {
    background: "#151515",
    borderRadius: "2px",
    height: "6px",
    width: "100%",
    overflow: "hidden",
    marginBottom: "8px",
  },
  barFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  confidenceValue: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "1.4rem",
    margin: 0,
    textAlign: "right",
  },
  resetBtn: {
    width: "100%",
    background: "transparent",
    color: "#444",
    border: "1px solid #1a1a1a",
    padding: "12px",
    borderRadius: "2px",
    cursor: "pointer",
    fontSize: "0.75rem",
    letterSpacing: "3px",
    textTransform: "uppercase",
    fontFamily: "'Rajdhani', sans-serif",
    transition: "all 0.2s",
  },
  errorBox: {
    textAlign: "center",
    padding: "40px 0",
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: "0.85rem",
    letterSpacing: "2px",
    marginBottom: "16px",
  },
};
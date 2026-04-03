import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './index.css';
import 'dotenv/config';

// --- INDEXED DB HELPER FUNCTIONS ---
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("BlackmoonDB", 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { keyPath: "id" });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject("DB Open Error");
  });
};

const saveToDB = async (base64Data) => {
  const db = await openDB();
  const tx = db.transaction("sessions", "readwrite");
  const store = tx.objectStore("sessions");
  // Sirf 5 latest images rakhne ke liye logic yahan handle ho sakta hai
  await store.put({ id: Date.now().toString(), data: base64Data });
  return tx.complete;
};

const getHistoryFromDB = async () => {
  const db = await openDB();
  const tx = db.transaction("sessions", "readonly");
  const store = tx.objectStore("sessions");
  const request = store.getAll();
  return new Promise((resolve) => {
    request.onsuccess = () => {
      // Reverse taake naya session top par aaye aur limit 6 images
      const results = request.result.reverse().slice(0, 6);
      resolve(results.map(item => item.data));
    };
  });
};

const blobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

function App() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load History on Start
  useEffect(() => {
    getHistoryFromDB().then(saved => setHistory(saved));
  }, []);

  // Fake Progress Logic
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 98 ? prev + 1 : prev));
      }, 150);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleProcess = useCallback(async (selectedFile) => {
    if (!selectedFile) return;
    setPreview(URL.createObjectURL(selectedFile));
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(process.env.BACKEND_URI, formData, {
        responseType: 'blob',
        timeout: 120000 // 2 minutes for HD
      });

      const resUrl = URL.createObjectURL(response.data);
      setResult(resUrl);

      const base64 = await blobToBase64(response.data);
      await saveToDB(base64);

      // Update sidebar history
      const updatedHistory = await getHistoryFromDB();
      setHistory(updatedHistory);

    } catch (err) {
      alert("Please Try Again!");
    } finally {
      setLoading(false);
      setProgress(0);
      setDragging(false);
    }
  }, []);

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>×</button>
        <h3 style={{ fontSize: '10px', letterSpacing: '2px', color: '#444', marginBottom: '20px', fontWeight: '900' }}>SESSIONS</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {history.map((img, i) => (
            <div key={i} className="sidebar-session-item" onClick={() => { setPreview(img); setResult(img); }}>
              <img src={img} alt="past" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
          {history.length === 0 && <p style={{ fontSize: '11px', color: '#333' }}>No activity.</p>}
        </div>
      </aside>

      <div className="main-viewport">
        <nav className="nav-glass">
          <div className="nav-logo" onClick={() => window.location.href = "/"} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <img
              src="/image.png"
              alt="Logo"
              className="nav-custom-logo" // Nayi class add ki hai
              style={{
                width: '35px',
                height: '35px',
                objectFit: 'contain'
              }}
            />
            <span style={{ fontWeight: '900', fontSize: '18px' }}>BLACKMOON AI</span>
          </div>
          {/* HAMBURGER MENU (Mobile Only) */}
          <div className="hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <div className={`bar ${isSidebarOpen ? 'active' : ''}`}></div>
            <div className={`bar ${isSidebarOpen ? 'active' : ''}`}></div>
            <div className={`bar ${isSidebarOpen ? 'active' : ''}`}></div>
          </div>
          <div className="nav-links">
            <a href="#tool">PROCESSOR</a>
            <a href="#about">ABOUT US</a>
          </div>
        </nav>

        <main className="content-container" style={{ padding: '40px' }}>
          <header style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h1 className="premium-heading">Neural <span className="text-gradient">Background</span> Extraction</h1>
            <p style={{ color: '#444', fontSize: '18px' }}>Powered by Restful Studios.</p>
          </header>

          <section id="tool" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="tool-card-inner" style={{
              width: '100%', maxWidth: '900px', height: '500px', background: '#0a0a0a',
              borderRadius: '40px', border: '1px solid #111', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
            }}>
              {!preview && !loading ? (
                <div
                  className={`upload-zone ${dragging ? 'dragging' : ''}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #222', // Dotted border yahan lagayein
                    borderRadius: '40px',      // Box ke corners se match karein
                    boxSizing: 'border-box',
                    margin: '0',               // Kisi bhi kism ka margin khatam
                    padding: '0'
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); handleProcess(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', marginTop: '20px' }}>Drop High-Res Image</h2>
                  <input id="file-upload" type="file" hidden onChange={(e) => handleProcess(e.target.files[0])} />
                </div>
              ) : loading ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '84px', fontWeight: '900', color: '#fff', letterSpacing: '-5px' }}>{progress}%</div>
                  <p style={{ fontWeight: '900', letterSpacing: '4px', color: '#a855f7', fontSize: '11px' }}>EXTRACTING SUBJECT...</p>
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '25px' }}>
                  <div className="checkerboard-bg" style={{ flex: 1, borderRadius: '20px', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                    <img
                      src={result || preview}
                      alt="result"
                      className="result-zoom-image"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }} className='btns'>
                    <button onClick={() => { setPreview(null); setResult(null); }} className="btn-secondary" style={{ flex: 1 }}>NEW PROJECT</button>
                    <a href={result} download="blackmoon_ai.png" className="btn-primary" style={{ flex: 2, textAlign: 'center', textDecoration: 'none' }}>DOWNLOAD HD PNG</a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ABOUT US */}
          <section id="about" className="about-section">
            <h2 className="premium-heading">About <span className="text-gradient">Restful Studios</span></h2>
            <div className="grid-2" style={{ alignItems: 'center' }}>
              <div>
                <p style={{ color: '#888', lineHeight: '1.8', fontSize: '16px' }}>
                  Blackmoon AI is a specialized neural engine developed by **Restful Studios** in Lahore, Pakistan.
                </p>
                <p style={{ color: '#888', lineHeight: '1.8', fontSize: '16px', marginTop: '20px' }}>
                  By combining the power of AI models, we ensure every pixel is preserved while background extraction remains lightning-fast.
                </p>
              </div>
              <div style={{ background: 'linear-gradient(45deg, #111, #000)', padding: '40px', borderRadius: '30px', textAlign: 'center', border: '1px solid #1a1a1a' }}>
                <h3 style={{ color: '#fff', fontSize: '32px', fontWeight: '900' }}>2026</h3>
                <p style={{ color: '#a855f7', fontWeight: 'bold' }}>Year of Innovation</p>
              </div>
            </div>
          </section>

          {/* FEEDBACK */}
          <section style={{ marginTop: '140px', marginBottom: '100px' }}>
            <h2 className="premium-heading">User <span className="text-gradient">Pulse</span></h2>
            <div className="reviews-wrapper">
              <div className="reviews-track">
                {[1, 2, 3, 4, 1, 2, 3, 4].map((u, i) => (
                  <div key={i} className="review-card">
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                      <img src={`https://i.pravatar.cc/150?u=${i}`} width="30" height="30" style={{ borderRadius: '50%' }} />
                      <div style={{ fontWeight: '900', fontSize: '12px' }}>Satisfied User</div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666' }}>Perfect transparency every time. Blackmoon AI is now part of my daily workflow.</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* COFFEE */}
          <section style={{ textAlign: 'center', padding: '80px 20px', background: '#050505', borderRadius: '40px' }}>
            <h2 className="premium-heading">Support Saqib</h2>
            <a href="https://buymeacoffee.com/saqib" className="coffee-btn" target="_blank" rel="noreferrer">
              <img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="bmc" width="20" />
              BUY ME A COFFEE
            </a>
          </section>
        </main>

        <footer style={{ textAlign: 'center', padding: '60px', color: '#222', letterSpacing: '2px', fontSize: '10px', fontWeight: '900' }}>
          RESTFUL STUDIOS &bull; LAHORE &bull; PAKISTAN
        </footer>
      </div>
    </div>
  );
}

export default App;
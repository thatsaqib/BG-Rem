import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleProcess = async (selectedFile) => {
    if (!selectedFile) return;
    setPreview(URL.createObjectURL(selectedFile));
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Connecting to your Ubuntu Backend
      const response = await axios.post('http://localhost:8000/process', formData, {
        responseType: 'blob',
      });
      setResult(URL.createObjectURL(response.data));
    } catch (err) {
      console.error(err);
      alert("AI Engine offline. Please check if backend is running!");
    } finally {
      setLoading(false);
      setDragging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 relative z-10 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center font-black text-xs shadow-lg shadow-purple-500/20">B</div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Blackmoon<span className="text-purple-500 text-sm ml-1">AI</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-xs font-bold tracking-widest text-gray-400 uppercase">
          <a href="#" className="hover:text-purple-400 transition">Models</a>
          <a href="#" className="hover:text-purple-400 transition">API</a>
          <a href="#" className="hover:text-purple-400 transition">Pricing</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto pt-20 pb-32 px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-purple-400 mb-6">
            Industrial Grade AI Tools
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
            Remove <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">Backgrounds</span> <br/>
            with Neural Precision.
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Experience ultra-high definition background removal powered by Blackmoon's custom 2048px upscaling engine.
          </p>
        </div>

        {/* The Tool Card */}
        <div className="max-w-4xl mx-auto">
          <div className={`relative p-1 rounded-[40px] transition-all duration-700 ${loading ? 'bg-gradient-to-r from-purple-600 to-blue-600 animate-pulse' : 'bg-white/5'}`}>
            <div className="bg-[#0a0a0a] rounded-[38px] p-8 md:p-12 border border-white/5 shadow-2xl">
              
              {!preview && !loading && (
                <div 
                  className={`group relative aspect-video rounded-[30px] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 cursor-pointer
                    ${dragging ? 'border-purple-500 bg-purple-500/5 scale-[1.02]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); handleProcess(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                    <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold mb-2">Drop your masterpiece</h4>
                  <p className="text-gray-500 text-sm uppercase tracking-widest font-medium">Supports PNG, JPG & WebP</p>
                  <input id="file-upload" type="file" className="hidden" onChange={(e) => handleProcess(e.target.files[0])} />
                </div>
              )}

              {loading && (
                <div className="aspect-video flex flex-col items-center justify-center space-y-8">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-[3px] border-purple-500/20 rounded-full" />
                    <div className="absolute inset-0 border-[3px] border-purple-500 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse">Neural Engine Processing...</p>
                    <p className="text-gray-600 text-sm mt-2 uppercase tracking-widest">Applying 2048px Lanczos Upscaling</p>
                  </div>
                </div>
              )}

              {preview && !loading && (
                <div className="flex flex-col space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-2">Source Image</p>
                      <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/5 p-2">
                        <img src={preview} alt="Input" className="w-full h-auto rounded-xl grayscale opacity-50" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold ml-2 text-right">Processed Result</p>
                      <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] p-2 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                        <img src={result || preview} alt="Output" className={`w-full h-auto rounded-xl transition-all duration-1000 ${!result ? 'blur-xl' : 'blur-0'}`} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <button onClick={() => {setPreview(null); setResult(null);}} className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all uppercase tracking-widest text-xs">New Project</button>
                    <a href={result} download="blackmoon_ai_master.png" className={`flex-1 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-700 text-center font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] transition-all ${!result ? 'opacity-50 pointer-events-none' : ''}`}>Download HD Copy</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-20 border-t border-white/5">
        <p className="text-[10px] tracking-[0.5em] text-gray-600 font-bold uppercase">Restful Studios &copy; 2026 &bull; Blackmoon AI Systems</p>
      </footer>
    </div>
  );
}

export default App;
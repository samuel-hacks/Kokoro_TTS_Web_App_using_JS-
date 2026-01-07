import { useState, useEffect, useRef } from 'react';
import { KokoroTTS } from 'kokoro-js';
import { Play, Pause, Download, Loader2, Cpu } from 'lucide-react';
import './index.css';

export default function App() {
  // --- STATE VARIABLES ---
  const [model, setModel] = useState(null);
  const [text, setText] = useState("This is a test");  const [voice, setVoice] = useState("af_sarah");
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Initializing...");
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- 1. LOAD MODEL ---
  useEffect(() => {
    async function loadModel() {
      try {
        setStatus("Downloading AI Model (80MB)...");
        if (!KokoroTTS) throw new Error("Library not loaded");
        
        const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
          dtype: "fp32", 
        });
        setModel(tts);
        setStatus("Ready");
      } catch (err) {
        console.error("Model Error:", err);
        setError(err.message);
        setStatus("Failed");
      }
    }
    loadModel();
  }, []);

  // --- 2. GENERATE AUDIO ---
  const handleGenerate = async () => {
    if (!model) return;
    setLoading(true);
    setError(null);
    try {
      const audio = await model.generate(text, { // <--- Uses 'text' here
        voice: voice,
        speed: speed,
      });
      const blob = new Blob([audio.toWav()], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (e) {
      console.error(e);
      setError("Generation failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  // --- 3. RENDER UI ---
  if (error) {
    return (
      <div style={{padding: 20, color: 'red', textAlign: 'center'}}>
        <h2>⚠️ Critical Error</h2>
        <p>{error}</p>
        <p style={{color: 'black', fontSize: '0.8rem'}}>Check the Console (F12) for details.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>Kokoro Web</h1>
          <div className="status-badge">
             <span className={model ? "ready" : "loading"}>● {status}</span>
          </div>
        </div>

        {/* This input uses the 'text' variable. If 'text' is missing, it crashes. */}
        <textarea 
          value={text} 
          onChange={e => setText(e.target.value)} 
          disabled={!model} 
        />

        <div className="controls">
          <div className="select-wrapper">
             <label>Voice</label>
             <select value={voice} onChange={e => setVoice(e.target.value)} disabled={!model}>
                <option value="af_sarah">Sarah (US)</option>
                <option value="am_michael">Michael (US)</option>
                <option value="bf_emma">Emma (UK)</option>
                <option value="bm_george">George (UK)</option>
             </select>
          </div>
          <div className="select-wrapper">
             <label>Speed: {speed}x</label>
             <input 
               type="range" min="0.5" max="2.0" step="0.1" 
               value={speed} onChange={e => setSpeed(Number(e.target.value))}
             />
          </div>
        </div>

        <button className="generate-btn" onClick={handleGenerate} disabled={loading || !model}>
          {loading ? <Loader2 className="spin" /> : <><Cpu size={18}/> Generate</>}
        </button>

        {audioUrl && (
          <div className="player-box">
             <button onClick={togglePlay} className="play-btn">
               {isPlaying ? <Pause fill="white"/> : <Play fill="white" style={{marginLeft:'3px'}}/>}
             </button>
             <audio ref={audioRef} controls src={audioUrl} className="hidden" onEnded={() => setIsPlaying(false)} />
             <a href={audioUrl} download="audio.wav" className="download-link"><Download size={14}/> Save</a>
          </div>
        )}
      </div>
    </div>
  );
}
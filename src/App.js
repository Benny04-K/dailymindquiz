import { useState, useEffect, useRef, useCallback } from "react";

// ─── Firebase ────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore, doc, getDoc, setDoc,
  collection, addDoc, serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyB_g5ygL5A82-0YJrcs4DNqkji6b6Bn0bg",
  authDomain:        "dailymind-93266.firebaseapp.com",
  projectId:         "dailymind-93266",
  storageBucket:     "dailymind-93266.firebasestorage.app",
  messagingSenderId: "512986465292",
  appId:             "1:512986465292:web:d3839407255dfcde7e5a29",
  measurementId:     "G-QZJ8L6G8C5",
};

const firebaseApp = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics   = getAnalytics(firebaseApp);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);

/* ─── Fonts & Global CSS ─────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel  = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap";
document.head.appendChild(fontLink);

const globalCSS = `
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --bg-gradient: linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 50%, #EFF6FF 100%);
    --primary:   #7C3AED;
    --secondary: #DB2777;
    --accent:    #0891B2;
    --success:   #059669;
    --warning:   #D97706;
    --danger:    #DC2626;
    --card-bg:   #FFFFFF;
    --text-dark: #1F2937;
    --text-light:#6B7280;
    --border:    rgba(0,0,0,0.08);
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.08);
    --shadow-lg: 0 16px 40px rgba(0,0,0,0.1);
    --overlay:   rgba(0,0,0,0.45);
  }
  [data-theme="dark"] {
    --bg-gradient: linear-gradient(135deg, #1a0f2e 0%, #0d1b2a 50%, #0f0a1e 100%);
    --primary:   #A78BFA;
    --secondary: #F472B6;
    --accent:    #22D3EE;
    --success:   #34D399;
    --warning:   #FBBF24;
    --danger:    #F87171;
    --card-bg:   #1e1630;
    --text-dark: #E2E8F0;
    --text-light:#94A3B8;
    --border:    rgba(255,255,255,0.08);
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.4);
    --shadow-lg: 0 16px 40px rgba(0,0,0,0.5);
    --overlay:   rgba(0,0,0,0.65);
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Poppins', sans-serif;
    background: var(--bg-gradient);
    color: var(--text-dark);
    min-height: 100vh;
    overflow-x: hidden;
    transition: background 0.4s, color 0.4s;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn    { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes count-up { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
  @keyframes mascot-happy { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-8px) rotate(-5deg)} 75%{transform:translateY(-8px) rotate(5deg)} }
  @keyframes mascot-sad   { 0%,100%{transform:rotate(0deg)} 25%,75%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
  @keyframes mascot-idle  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  @keyframes confetti-fall{ 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
  @keyframes slide-up { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(124,58,237,0.4)} 70%{box-shadow:0 0 0 10px rgba(124,58,237,0)} 100%{box-shadow:0 0 0 0 rgba(124,58,237,0)} }

  .fadeUp   { animation: fadeUp  0.5s ease both; }
  .popIn    { animation: popIn   0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
  .float    { animation: float   3s ease-in-out infinite; }
  .shake    { animation: shake   0.4s ease both; }
  .slide-up { animation: slide-up 0.35s ease both; }

  .gradient-text {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .card {
    background: var(--card-bg); border-radius: 16px;
    border: 1px solid var(--border); box-shadow: var(--shadow-md);
    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  }
  .card:hover { border-color: rgba(124,58,237,0.3); box-shadow: var(--shadow-lg); transform: translateY(-3px); }
  .btn {
    font-family:'Poppins',sans-serif; font-weight:600; border:none;
    border-radius:12px; cursor:pointer; transition:all 0.3s ease;
    display:inline-flex; align-items:center; gap:8px;
    position:relative; overflow:hidden;
  }
  .btn::before {
    content:''; position:absolute; top:50%; left:50%; width:0; height:0;
    border-radius:50%; background:rgba(255,255,255,0.25);
    transform:translate(-50%,-50%); transition:width 0.6s, height 0.6s;
  }
  .btn:active::before { width:300px; height:300px; }
  .btn-primary {
    background:linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color:#fff; padding:14px 32px; font-size:15px;
    box-shadow:0 8px 20px rgba(124,58,237,0.3);
  }
  .btn-primary:hover  { transform:translateY(-2px); box-shadow:0 12px 28px rgba(124,58,237,0.4); }
  .btn-secondary {
    background:var(--card-bg); color:var(--primary);
    border:2px solid var(--primary); padding:12px 28px; font-size:14px;
  }
  .btn-secondary:hover { background:rgba(124,58,237,0.08); }
  .option-btn {
    width:100%; background:var(--card-bg); border:2px solid var(--border);
    border-radius:12px; padding:16px 18px; text-align:left;
    font-family:'Poppins',sans-serif; font-size:15px; cursor:pointer;
    display:flex; align-items:center; gap:14px; color:var(--text-dark);
    transition:all 0.3s ease;
  }
  .option-btn:not(:disabled):hover { border-color:var(--primary); background:rgba(124,58,237,0.05); transform:translateX(6px); }
  .option-btn.correct     { background:rgba(5,150,105,0.1);  border-color:var(--success); color:var(--success); }
  .option-btn.wrong       { background:rgba(220,38,38,0.1);  border-color:var(--danger);  color:var(--danger); animation:shake 0.4s ease; }
  .option-btn.disabled-opt{ opacity:0.45; }
  .badge {
    display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:600;
    padding:6px 12px; border-radius:20px; text-transform:uppercase; letter-spacing:0.05em;
  }
  .badge-primary { background:rgba(124,58,237,0.1); color:var(--primary); }
  .confetti-piece {
    position:fixed; top:-10px; pointer-events:none; z-index:9999;
    animation:confetti-fall linear forwards;
  }
  .modal-backdrop {
    position:fixed; inset:0; background:var(--overlay);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; padding:20px; animation:fadeUp 0.2s ease;
  }
  .modal-box {
    background:var(--card-bg); border-radius:24px; padding:36px 32px;
    max-width:420px; width:100%; box-shadow:var(--shadow-lg);
    animation:popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .firebase-badge {
    display:inline-flex; align-items:center; gap:5px;
    background:rgba(255,160,0,0.12); color:#b45309;
    border-radius:8px; padding:3px 10px; font-size:11px; font-weight:600;
  }
  [data-theme="dark"] .firebase-badge { background:rgba(251,191,36,0.15); color:#fbbf24; }
`;
const styleTag = document.createElement("style");
styleTag.textContent = globalCSS;
document.head.appendChild(styleTag);

/* ─── Constants ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { id:9,  name:"General Knowledge", icon:"🧠", color:"#7C3AED" },
  { id:17, name:"Science & Nature",  icon:"🔬", color:"#059669" },
  { id:23, name:"History",           icon:"📜", color:"#D97706" },
  { id:11, name:"Entertainment",     icon:"🎬", color:"#DB2777" },
  { id:21, name:"Sports",            icon:"⚽", color:"#0891B2" },
  { id:19, name:"Mathematics",       icon:"🔢", color:"#7C3AED" },
  { id:22, name:"Geography",         icon:"🌍", color:"#0D9488" },
  { id:15, name:"Video Games",       icon:"🎮", color:"#DC2626" },
  { id:12, name:"Music",             icon:"🎵", color:"#EA580C" },
  { id:18, name:"Computers",         icon:"💻", color:"#2563EB" },
];

const DIFFICULTIES = [
  { id:"easy",   label:"Easy",   icon:"🟢", desc:"Warm up your brain" },
  { id:"medium", label:"Medium", icon:"🟡", desc:"A solid challenge"  },
  { id:"hard",   label:"Hard",   icon:"🔴", desc:"Test your limits"   },
];

const RESULT_MSGS = [
  { min:9, title:"Genius! 🧠",      msg:"Outstanding! You're a true knowledge master." },
  { min:7, title:"Excellent! 🌟",   msg:"Fantastic work! You really know your stuff."  },
  { min:5, title:"Good Job! 👍",    msg:"Nice effort! You're making solid progress."   },
  { min:0, title:"Keep Going! 💪",  msg:"Great attempt! Every quiz helps you grow."    },
];

const DID_YOU_KNOW = [
  "The human brain can process images in as little as 13 milliseconds.",
  "Honey never spoils — archaeologists found 3,000-year-old honey in Egyptian tombs.",
  "A group of flamingos is called a 'flamboyance'.",
  "The Eiffel Tower grows about 6 inches taller in summer due to thermal expansion.",
  "Sharks are older than trees — they've existed for over 400 million years.",
  "Octopuses have three hearts and blue blood.",
  "The shortest war in history lasted only 38–45 minutes (Anglo-Zanzibar War, 1896).",
  "A single cloud can weigh over a million pounds.",
  "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.",
  "Bananas are technically berries, but strawberries are not.",
];

const AD_CLIENT   = "ca-pub-4969283434635432";
const AD_SLOT_TOP = "4706096028";

/* ─── Firebase Helpers ───────────────────────────────────────────── */
async function fbLoadUserData(uid) {
  try {
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        profile: data.profile || null,
        stats:   data.stats   || null,
      };
    }
    return { profile: null, stats: null };
  } catch (e) {
    console.warn("Firebase load failed, using localStorage fallback", e);
    return { profile: null, stats: null };
  }
}

async function fbSaveProfile(uid, data) {
  try {
    await setDoc(doc(db, "users", uid), {
      profile: { ...data, lastSeen: serverTimestamp() },
    }, { merge: true });
  } catch (e) { console.warn("Firebase profile save failed", e); }
}

async function fbSaveStats(uid, stats) {
  try {
    await setDoc(doc(db, "users", uid), { stats }, { merge: true });
  } catch (e) { console.warn("Firebase stats save failed", e); }
}

async function fbSaveHistory(uid, entry) {
  try {
    await addDoc(collection(db, "users", uid, "history"), {
      ...entry,
      playedAt: serverTimestamp(),
    });
  } catch (e) { console.warn("Firebase history save failed", e); }
}

/* ─── Audio Engine ───────────────────────────────────────────────── */
function useAudio() {
  const ctx = useRef(null);
  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctx.current;
  };
  return useCallback((type) => {
    try {
      const ac = getCtx();
      const g  = ac.createGain();
      g.connect(ac.destination);
      if (type === "correct") {
        [523, 659, 784].forEach((f, i) => {
          const o = ac.createOscillator(); o.type = "sine"; o.frequency.value = f; o.connect(g);
          g.gain.setValueAtTime(0.18, ac.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.1 + 0.25);
          o.start(ac.currentTime + i * 0.1); o.stop(ac.currentTime + i * 0.1 + 0.3);
        });
      } else if (type === "wrong") {
        const o = ac.createOscillator(); o.type = "sawtooth";
        o.frequency.setValueAtTime(280, ac.currentTime);
        o.frequency.exponentialRampToValueAtTime(120, ac.currentTime + 0.3);
        o.connect(g);
        g.gain.setValueAtTime(0.15, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
        o.start(ac.currentTime); o.stop(ac.currentTime + 0.4);
      } else if (type === "fanfare") {
        [523, 659, 784, 1047].forEach((f, i) => {
          const o = ac.createOscillator(); o.type = "triangle"; o.frequency.value = f; o.connect(g);
          g.gain.setValueAtTime(0.2, ac.currentTime + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.12 + 0.4);
          o.start(ac.currentTime + i * 0.12); o.stop(ac.currentTime + i * 0.12 + 0.5);
        });
      } else if (type === "click") {
        const o = ac.createOscillator(); o.type = "sine"; o.frequency.value = 880; o.connect(g);
        g.gain.setValueAtTime(0.08, ac.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
        o.start(ac.currentTime); o.stop(ac.currentTime + 0.1);
      }
    } catch (_) {}
  }, []);
}

/* ─── Confetti ───────────────────────────────────────────────────── */
function Confetti() {
  const colors = ["#7C3AED","#DB2777","#059669","#D97706","#0891B2","#DC2626","#A78BFA"];
  const pieces = Array.from({ length: 80 }, (_, i) => ({
    id: i, left: Math.random() * 100, color: colors[i % colors.length],
    size: 6 + Math.random() * 8, duration: 2 + Math.random() * 2,
    delay: Math.random() * 1.5, shape: Math.random() > 0.5 ? "50%" : "2px",
  }));
  return (
    <>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left:`${p.left}%`, width:p.size, height:p.size,
          background:p.color, borderRadius:p.shape,
          animationDuration:`${p.duration}s`, animationDelay:`${p.delay}s`,
        }} />
      ))}
    </>
  );
}

/* ─── Mascot ─────────────────────────────────────────────────────── */
function Mascot({ mood }) {
  const anims = {
    idle:    "mascot-idle 2s ease-in-out infinite",
    happy:   "mascot-happy 0.6s ease-in-out 3",
    sad:     "mascot-sad 0.5s ease-in-out 3",
    excited: "mascot-happy 0.3s ease-in-out 6",
  };
  const faces = { idle:"😊", happy:"🥳", sad:"😢", excited:"🤩" };
  return (
    <div style={{
      fontSize:"46px", lineHeight:1,
      animation:anims[mood] || anims.idle, display:"inline-block",
      filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.12))", userSelect:"none",
    }}>
      {faces[mood] || faces.idle}
    </div>
  );
}

/* ─── Dark Toggle ────────────────────────────────────────────────── */
function DarkToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      background: dark ? "rgba(167,139,250,0.2)" : "rgba(124,58,237,0.1)",
      border:`2px solid ${dark ? "var(--primary)" : "var(--border)"}`,
      borderRadius:"20px", padding:"6px 14px",
      display:"flex", alignItems:"center", gap:"8px",
      cursor:"pointer", transition:"all 0.3s",
      color:"var(--text-dark)", fontSize:"13px", fontWeight:600,
    }}>
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

/* ─── Username Modal ─────────────────────────────────────────────── */
function UsernameModal({ onSave }) {
  const [name, setName] = useState("");
  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ textAlign:"center" }}>
        <div style={{ fontSize:"56px", marginBottom:"16px" }}>👋</div>
        <h2 style={{
          fontFamily:"'Quicksand',sans-serif", fontSize:"24px",
          fontWeight:700, marginBottom:"8px", color:"var(--text-dark)",
        }}>Welcome to DailyMind!</h2>
        <p style={{ color:"var(--text-light)", fontSize:"14px", marginBottom:"24px", lineHeight:1.6 }}>
          What should we call you?
        </p>
        <input
          autoFocus value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && name.trim() && onSave(name.trim())}
          placeholder="Enter your name…"
          style={{
            width:"100%", padding:"14px 18px", borderRadius:"12px",
            border:"2px solid var(--border)", background:"var(--card-bg)",
            color:"var(--text-dark)", fontSize:"16px",
            fontFamily:"'Poppins',sans-serif", outline:"none", marginBottom:"16px",
            transition:"border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor="var(--primary)"}
          onBlur={e  => e.target.style.borderColor="var(--border)"}
        />
        <button className="btn btn-primary"
          style={{ width:"100%", justifyContent:"center" }}
          onClick={() => name.trim() && onSave(name.trim())}
          disabled={!name.trim()}>
          Let's Play! →
        </button>
      </div>
    </div>
  );
}

/* ─── Setup Screen ───────────────────────────────────────────────── */
function SetupScreen({ username, stats, onStart, loading, error, onRetry, play }) {
  const [selCat,  setSelCat]  = useState(null);
  const [selDiff, setSelDiff] = useState(null);
  const today   = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  function pickCat(cat)  { play("click"); setSelCat(cat); }
  function pickDiff(d)   { play("click"); setSelDiff(d);  }
  function handleStart() { if (selCat && selDiff) { play("click"); onStart(selCat, selDiff); } }

  return (
    <div style={{ width:"100%", maxWidth:"680px", padding:"0 20px 60px" }}>
      <div className="fadeUp" style={{ textAlign:"center", padding:"10px 0 24px" }}>
        <div style={{ marginBottom:"12px" }}><Mascot mood="idle" /></div>
        <h1 style={{
          fontFamily:"'Quicksand',sans-serif", fontSize:"clamp(22px,6vw,36px)",
          fontWeight:700, marginBottom:"6px",
        }}>
          <span className="gradient-text">Hey {username}! 👋</span>
        </h1>
        <div style={{ fontSize:"13px", color:"var(--text-light)" }}>{dateStr}</div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"24px" }}>
        {[
          { num:stats.played,                                   lbl:"Played",  icon:"📊" },
          { num:stats.best !== null ? `${stats.best}/10` : "—", lbl:"Best",    icon:"🏆" },
          { num:`${stats.streak}🔥`,                           lbl:"Streak",  icon:"⚡" },
        ].map((s,i) => (
          <div key={i} className="card fadeUp" style={{
            flex:1, padding:"16px 10px", textAlign:"center", animationDelay:`${i*0.08}s`,
          }}>
            <div style={{ fontSize:"20px", marginBottom:"4px" }}>{s.icon}</div>
            <div style={{
              fontFamily:"'Quicksand',sans-serif", fontSize:"clamp(16px,3.5vw,22px)",
              fontWeight:700, color:"var(--primary)", marginBottom:"2px",
            }}>{s.num}</div>
            <div style={{ fontSize:"11px", color:"var(--text-light)", fontWeight:500 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {error ? (
        <div className="fadeUp card" style={{
          padding:"28px", marginBottom:"24px", textAlign:"center",
          background:"rgba(220,38,38,0.05)", borderColor:"rgba(220,38,38,0.3)",
        }}>
          <div style={{ fontSize:"32px", marginBottom:"12px" }}>😵</div>
          <div style={{ fontSize:"16px", fontWeight:700, color:"var(--danger)", marginBottom:"8px" }}>
            Connection Failed
          </div>
          <div style={{ fontSize:"14px", color:"var(--text-light)", marginBottom:"20px" }}>
            Couldn't load questions. Please check your connection.
          </div>
          <button className="btn btn-primary" onClick={onRetry}>↻ Try Again</button>
        </div>
      ) : (
        <>
          {/* Category picker */}
          <div className="card fadeUp" style={{ padding:"22px", marginBottom:"14px", animationDelay:"0.1s" }}>
            <div style={{
              fontSize:"11px", fontWeight:700, color:"var(--text-light)",
              textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"14px",
            }}>
              Step 1 · Pick a Category
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px" }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => pickCat(cat)} style={{
                  background: selCat?.id === cat.id
                    ? `linear-gradient(135deg, ${cat.color}22, ${cat.color}11)` : "transparent",
                  border:`2px solid ${selCat?.id === cat.id ? cat.color : "var(--border)"}`,
                  borderRadius:"12px", padding:"12px 14px",
                  display:"flex", alignItems:"center", gap:"10px",
                  cursor:"pointer", transition:"all 0.25s",
                  color:"var(--text-dark)",
                  fontFamily:"'Poppins',sans-serif", fontWeight:500, fontSize:"13px",
                  transform: selCat?.id === cat.id ? "scale(1.02)" : "scale(1)",
                }}>
                  <span style={{ fontSize:"20px" }}>{cat.icon}</span>
                  <span style={{ textAlign:"left", lineHeight:1.2, flex:1 }}>{cat.name}</span>
                  {selCat?.id === cat.id && <span style={{ color:cat.color }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="card fadeUp" style={{ padding:"22px", marginBottom:"18px", animationDelay:"0.15s" }}>
            <div style={{
              fontSize:"11px", fontWeight:700, color:"var(--text-light)",
              textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"14px",
            }}>
              Step 2 · Choose Difficulty
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              {DIFFICULTIES.map(d => (
                <button key={d.id} onClick={() => pickDiff(d)} style={{
                  flex:1,
                  background: selDiff?.id === d.id
                    ? "linear-gradient(135deg, var(--primary), var(--secondary))" : "var(--card-bg)",
                  border:`2px solid ${selDiff?.id === d.id ? "transparent" : "var(--border)"}`,
                  borderRadius:"12px", padding:"14px 8px",
                  cursor:"pointer", transition:"all 0.25s",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
                  color: selDiff?.id === d.id ? "white" : "var(--text-dark)",
                  fontFamily:"'Poppins',sans-serif",
                  transform: selDiff?.id === d.id ? "scale(1.04)" : "scale(1)",
                  boxShadow: selDiff?.id === d.id ? "0 8px 20px rgba(124,58,237,0.35)" : "none",
                }}>
                  <span style={{ fontSize:"22px" }}>{d.icon}</span>
                  <span style={{ fontWeight:600, fontSize:"13px" }}>{d.label}</span>
                  <span style={{ fontSize:"11px", opacity:0.75, textAlign:"center" }}>{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary fadeUp"
            onClick={handleStart}
            disabled={!selCat || !selDiff || loading}
            style={{
              width:"100%", justifyContent:"center", animationDelay:"0.2s",
              opacity:(!selCat || !selDiff || loading) ? 0.6 : 1,
              cursor:(!selCat || !selDiff || loading) ? "not-allowed" : "pointer",
            }}>
            {loading ? (
              <>
                <span style={{
                  width:"16px", height:"16px",
                  border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white",
                  borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite",
                }} />
                Loading…
              </>
            ) : !selCat ? "↑ Pick a category first"
              : !selDiff ? "↑ Choose difficulty"
              : "Start Quiz! →"}
          </button>
        </>
      )}
    </div>
  );
}

/* ─── Quiz Screen ────────────────────────────────────────────────── */
function QuizScreen({ questionIndex, score, question, onAnswer, answered, selectedIdx, onNext, total, mascotMood }) {
  const letters   = ["A","B","C","D"];
  const isCorrect = answered && selectedIdx === question.answer;
  const progress  = ((questionIndex + (answered ? 1 : 0)) / total) * 100;
  const funFact   = DID_YOU_KNOW[questionIndex % DID_YOU_KNOW.length];

  return (
    <div style={{ width:"100%", maxWidth:"680px", padding:"0 20px 60px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0 16px" }}>
        <div style={{
          fontSize:"13px", fontWeight:600, color:"var(--text-light)",
          textTransform:"uppercase", letterSpacing:"0.05em",
        }}>Q {questionIndex+1}/{total}</div>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <Mascot mood={mascotMood} />
          <div style={{
            fontFamily:"'Quicksand',sans-serif", fontSize:"20px", fontWeight:700, color:"var(--primary)",
          }}>⭐ {score}</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{
        width:"100%", height:"6px", background:"rgba(0,0,0,0.08)",
        borderRadius:"3px", marginBottom:"20px", overflow:"hidden",
      }}>
        <div style={{
          height:"100%", width:`${progress}%`,
          background:"linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
          borderRadius:"3px", transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)",
          boxShadow:"0 0 10px rgba(124,58,237,0.4)",
        }} />
      </div>

      {/* Question */}
      <div className="card fadeUp" key={questionIndex} style={{ padding:"24px 26px", marginBottom:"16px" }}>
        <span className="badge badge-primary" style={{ marginBottom:"12px" }}>{question.category}</span>
        <div style={{
          fontSize:"clamp(15px,3.5vw,19px)", lineHeight:1.6,
          fontWeight:600, color:"var(--text-dark)", marginTop:"8px",
        }}>
          {question.q}
        </div>
      </div>

      {/* Options */}
      <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"16px" }}>
        {question.options.map((opt, i) => (
          <button key={i}
            className={[
              "option-btn",
              answered && i === question.answer ? "correct" : "",
              answered && i === selectedIdx && i !== question.answer ? "wrong" : "",
              answered && i !== selectedIdx && i !== question.answer ? "disabled-opt" : "",
            ].join(" ").trim()}
            disabled={answered} onClick={() => onAnswer(i)}>
            <div style={{
              width:"30px", height:"30px",
              background: answered && i === question.answer ? "var(--success)"
                        : answered && i === selectedIdx    ? "var(--danger)"
                        : "var(--primary)",
              color:"white", borderRadius:"8px",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"11px", fontWeight:700, flexShrink:0,
            }}>{letters[i]}</div>
            <span style={{ flex:1 }}>{opt}</span>
            {answered && i === question.answer && <span style={{ fontSize:"16px" }}>✓</span>}
            {answered && i === selectedIdx && i !== question.answer && <span style={{ fontSize:"16px" }}>✗</span>}
          </button>
        ))}
      </div>

      {/* Feedback + Did You Know */}
      {answered && (
        <div className="slide-up">
          <div style={{
            padding:"14px 18px", borderRadius:"12px", fontSize:"14px", fontWeight:600,
            marginBottom:"12px",
            background: isCorrect ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)",
            color:  isCorrect ? "var(--success)" : "var(--danger)",
            border:`2px solid ${isCorrect ? "var(--success)" : "var(--danger)"}`,
          }}>
            {isCorrect
              ? "✓ Correct! Great work!"
              : `✗ Correct answer: ${question.options[question.answer]}`}
          </div>

          <div style={{
            padding:"14px 18px", borderRadius:"12px", fontSize:"13px", lineHeight:1.65,
            background:"rgba(124,58,237,0.07)", border:"2px solid rgba(124,58,237,0.2)",
            color:"var(--text-dark)", marginBottom:"14px",
          }}>
            <span style={{ fontWeight:700, color:"var(--primary)" }}>💡 Did you know? </span>
            {funFact}
          </div>

          <button className="btn btn-primary"
            style={{ display:"block", width:"100%", justifyContent:"center" }}
            onClick={onNext}>
            {questionIndex + 1 < total ? "Next Question →" : "See Results →"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Result Screen ──────────────────────────────────────────────── */
function ResultScreen({ score, results, total, onHome, username, play }) {
  const m        = RESULT_MSGS.find(x => score >= x.min) ?? RESULT_MSGS[RESULT_MSGS.length - 1];
  const pct      = Math.round((score / total) * 100);
  const bgColor  = pct >= 70 ? "#059669" : pct >= 50 ? "#D97706" : "#DC2626";
  const showConfetti = score >= 8;
  const mascotMood   = score >= 8 ? "excited" : score >= 5 ? "happy" : "sad";

  useEffect(() => { if (score >= 8) play("fanfare"); }, []); // eslint-disable-line

  function share() {
    const text = `I scored ${score}/${total} (${pct}%) on DailyMind Quiz! Can you beat me? ${window.location.href}`;
    if (navigator.share) navigator.share({ title:"DailyMind Score", text });
    else navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
  }

  return (
    <div style={{ width:"100%", maxWidth:"680px", padding:"0 20px 60px" }}>
      {showConfetti && <Confetti />}
      <div style={{ textAlign:"center", padding:"20px 0" }}>
        <div style={{ marginBottom:"20px" }}><Mascot mood={mascotMood} /></div>

        {/* Score circle */}
        <div className="popIn" style={{
          width:"150px", height:"150px", borderRadius:"50%",
          background:`linear-gradient(135deg, ${bgColor}, ${bgColor}BB)`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          margin:"0 auto 24px", color:"white",
          boxShadow:`0 16px 40px ${bgColor}50`,
        }}>
          <div style={{
            fontFamily:"'Quicksand',sans-serif", fontSize:"52px", fontWeight:700, lineHeight:1,
            animation:"count-up 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
          }}>{score}</div>
          <div style={{ fontSize:"13px", marginTop:"4px", opacity:0.9 }}>out of {total}</div>
        </div>

        <div className="fadeUp" style={{
          fontFamily:"'Quicksand',sans-serif", fontSize:"clamp(20px,5vw,28px)",
          fontWeight:700, color:bgColor, marginBottom:"8px",
        }}>{m.title}</div>
        <div className="fadeUp" style={{
          fontSize:"15px", color:"var(--text-light)", lineHeight:1.7,
          maxWidth:"360px", margin:"0 auto 24px",
        }}>
          {username ? `${username}, ` : ""}{m.msg}
        </div>

        {/* Accuracy */}
        <div className="card fadeUp" style={{
          padding:"16px 20px", marginBottom:"14px",
          display:"flex", alignItems:"center", gap:"14px",
        }}>
          <span style={{ fontSize:"12px", color:"var(--text-light)", fontWeight:600, textTransform:"uppercase", whiteSpace:"nowrap" }}>
            Accuracy
          </span>
          <div style={{ flex:1, height:"8px", background:"rgba(0,0,0,0.08)", borderRadius:"4px", overflow:"hidden" }}>
            <div style={{
              height:"100%", width:`${pct}%`,
              background:`linear-gradient(135deg, ${bgColor}, ${bgColor}BB)`,
              borderRadius:"4px", transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <span style={{
            fontFamily:"'Quicksand',sans-serif", fontSize:"17px",
            color:bgColor, fontWeight:700, minWidth:"42px",
          }}>{pct}%</span>
        </div>

        {/* Breakdown */}
        <div className="card fadeUp" style={{ padding:"20px 22px", marginBottom:"24px", textAlign:"left" }}>
          <div style={{
            fontSize:"11px", fontWeight:700, color:"var(--text-light)",
            textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"12px",
          }}>Performance Breakdown</div>
          {results.map((r, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:"10px", padding:"9px 0",
              borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none",
              fontSize:"13px",
            }}>
              <div style={{
                width:"22px", height:"22px", borderRadius:"6px", flexShrink:0,
                background: r.correct ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)",
                border:`2px solid ${r.correct ? "var(--success)" : "var(--danger)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"11px", fontWeight:700,
                color: r.correct ? "var(--success)" : "var(--danger)",
              }}>{r.correct ? "✓" : "✗"}</div>
              <span style={{ flex:1, color: r.correct ? "var(--text-dark)" : "var(--text-light)" }}>
                Q{i+1}: {r.q.length > 52 ? r.q.substring(0, 49) + "…" : r.q}
              </span>
            </div>
          ))}
        </div>

        <div className="fadeUp" style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
          <button className="btn btn-primary"   onClick={share}>📤 Share Score</button>
          <button className="btn btn-secondary" onClick={onHome}>↩ Play Again</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Ad Banner ──────────────────────────────────────────────────── */
function AdBanner() {
  useEffect(() => {
    try { window.adsbygoogle = window.adsbygoogle || []; window.adsbygoogle.push({}); } catch (_) {}
  }, []);
  return (
    <div style={{ textAlign:"center", margin:"20px 0", width:"100%" }}>
      <ins className="adsbygoogle" style={{ display:"block" }}
        data-ad-client={AD_CLIENT} data-ad-slot={AD_SLOT_TOP}
        data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str; return txt.value;
}

async function fetchQuestions(categoryId, difficulty) {
  const base = `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple&difficulty=${difficulty}`;
  const url  = window.location.hostname === "localhost"
    ? `https://corsproxy.io/?${encodeURIComponent(base)}` : base;
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  if (data.response_code !== 0) throw new Error("API error");
  return data.results.map(item => {
    const correct   = decodeHTML(item.correct_answer);
    const incorrect = item.incorrect_answers.map(decodeHTML);
    const options   = [correct, ...incorrect].sort(() => Math.random() - 0.5);
    return { category: decodeHTML(item.category), q: decodeHTML(item.question), options, answer: options.indexOf(correct) };
  });
}

function loadStatsLocal() {
  try {
    return JSON.parse(localStorage.getItem("quizStats") || "null")
        || { played:0, best:null, streak:0, lastDate:null };
  } catch { return { played:0, best:null, streak:0, lastDate:null }; }
}

/* ─── Root App ───────────────────────────────────────────────────── */
export default function App() {
  const play  = useAudio();
  const today = new Date();

  // Firebase auth
  const [uid,       setUid]       = useState(null);
  const [fbReady,   setFbReady]   = useState(false);

  // Persisted prefs
  const [dark,      setDark]      = useState(() => localStorage.getItem("darkMode") === "true");
  const [username,  setUsername]  = useState(() => localStorage.getItem("username") || "");
  const [stats,     setStats]     = useState(loadStatsLocal);

  // Quiz state
  const [screen,         setScreen]         = useState("setup");
  const [questions,      setQuestions]      = useState([]);
  const [currentDiff,    setCurrentDiff]    = useState(null);  // full difficulty object
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(false);
  const [currentQ,       setCurrentQ]       = useState(0);
  const [score,          setScore]          = useState(0);
  const [answered,       setAnswered]       = useState(false);
  const [selectedIdx,    setSelectedIdx]    = useState(null);
  const [results,        setResults]        = useState([]);
  const [mascotMood,     setMascotMood]     = useState("idle");
  const [currentCat,     setCurrentCat]     = useState(null);  // full category object

  // ── Firebase: sign in anonymously on mount ──────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        // Load data from Firestore; fall back to localStorage if it fails
        const { profile, stats: fbStats } = await fbLoadUserData(user.uid);
        if (profile?.username) {
          setUsername(profile.username);
          localStorage.setItem("username", profile.username);
        }
        if (profile?.darkMode !== undefined) {
          setDark(profile.darkMode);
        }
        if (fbStats) {
          setStats(fbStats);
          localStorage.setItem("quizStats", JSON.stringify(fbStats));
        }
        setFbReady(true);
      } else {
        try {
          await signInAnonymously(auth);
          // onAuthStateChanged will fire again with the new user
        } catch (e) {
          console.warn("Anonymous sign-in failed, running offline", e);
          setFbReady(true);
        }
      }
    });
    return unsub;
  }, []);

  // ── Apply dark mode ─────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("darkMode", String(dark));
  }, [dark]);

  function toggleDark() {
    play("click");
    const newDark = !dark;
    setDark(newDark);
    if (uid) fbSaveProfile(uid, { darkMode: newDark });
  }

  // ── Save username ────────────────────────────────────────────────
  async function saveUsername(name) {
    play("click");
    localStorage.setItem("username", name);
    setUsername(name);
    if (uid) {
      await fbSaveProfile(uid, {
        username:  name,
        darkMode:  dark,
        joinedAt:  serverTimestamp(),
      });
    }
  }

  // ── Start quiz ───────────────────────────────────────────────────
  async function startQuiz(cat, diff) {
    setLoading(true); setError(false);
    try {
      const qs = await fetchQuestions(cat.id, diff.id);
      setQuestions(qs);
      setCurrentCat(cat);
      setCurrentDiff(diff);
      setCurrentQ(0); setScore(0); setAnswered(false);
      setSelectedIdx(null); setResults([]); setMascotMood("idle");
      setScreen("quiz");
      window.scrollTo(0, 0);
    } catch { setError(true); }
    finally  { setLoading(false); }
  }

  // ── Handle answer ────────────────────────────────────────────────
  function handleAnswer(idx) {
    if (answered) return;
    const correct = idx === questions[currentQ].answer;
    setSelectedIdx(idx); setAnswered(true);
    if (correct) { play("correct"); setScore(s => s + 1); setMascotMood("happy"); }
    else         { play("wrong");   setMascotMood("sad"); }
    setResults(r => [...r, { q: questions[currentQ].q, correct }]);
  }

  // ── Next question / end quiz ─────────────────────────────────────
  async function nextQuestion() {
    const next = currentQ + 1;
    setMascotMood("idle");

    if (next >= questions.length) {
      const todayStr  = today.toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      setStats(prev => {
        const newStats = {
          played:   prev.played + 1,
          best:     prev.best === null ? score : Math.max(prev.best, score),
          streak:   prev.lastDate === yesterday ? prev.streak + 1 : 1,
          lastDate: todayStr,
        };
        // Persist locally
        localStorage.setItem("quizStats", JSON.stringify(newStats));

        // Persist to Firebase (fire & forget)
        if (uid) {
          fbSaveStats(uid, newStats);
          fbSaveHistory(uid, {
            category:   currentCat?.name  || "Unknown",
            categoryId: currentCat?.id    || 0,
            difficulty: currentDiff?.id   || "unknown",
            score,
            total: questions.length,
          });
          // Also update lastSeen on profile
          fbSaveProfile(uid, { lastSeen: serverTimestamp() });
        }

        return newStats;
      });

      setScreen("result");
    } else {
      setCurrentQ(next);
      setAnswered(false);
      setSelectedIdx(null);
    }
    window.scrollTo(0, 0);
  }

  function goHome() {
    setScreen("setup"); setError(false);
    window.scrollTo(0, 0);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minHeight:"100vh", paddingBottom:"20px" }}>
      {!username && fbReady && <UsernameModal onSave={saveUsername} />}

      <AdBanner />

      {/* Top bar */}
      <div style={{
        width:"100%", maxWidth:"680px", padding:"14px 20px 0",
        display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{
            fontFamily:"'Quicksand',sans-serif", fontSize:"18px", fontWeight:700,
            background:"linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
          }}>DailyMind Quiz</div>
          {/* Shows a small indicator when Firebase is connected */}
          {uid && (
            <span className="firebase-badge" title={`Firebase UID: ${uid}`}>
              🔥 synced
            </span>
          )}
        </div>
        <DarkToggle dark={dark} onToggle={toggleDark} />
      </div>

      {screen === "setup" && (
        <SetupScreen
          username={username} stats={stats}
          onStart={startQuiz} loading={loading}
          error={error} onRetry={() => setError(false)}
          play={play}
        />
      )}
      {screen === "quiz" && questions.length > 0 && (
        <QuizScreen
          questionIndex={currentQ} score={score}
          question={questions[currentQ]} onAnswer={handleAnswer}
          answered={answered} selectedIdx={selectedIdx}
          onNext={nextQuestion} total={questions.length}
          mascotMood={mascotMood}
        />
      )}
      {screen === "result" && (
        <ResultScreen
          score={score} results={results} total={questions.length}
          onHome={goHome} username={username} play={play}
        />
      )}

      <footer style={{
        textAlign:"center", padding:"20px",
        fontSize:"13px", color:"var(--text-light)",
        borderTop:"1px solid var(--border)",
        width:"100%", marginTop:"auto", fontWeight:500,
      }}>
        DailyMind &copy; {today.getFullYear()}
        &nbsp;·&nbsp;
        Created by <strong style={{ color:"var(--primary)" }}>Rojar Benny K</strong>
        &nbsp;·&nbsp;
        Learn daily, grow faster
      </footer>
    </div>
  );
}

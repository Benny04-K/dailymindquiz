import { useState, useEffect, useRef } from "react";

// ── Google Fonts ─────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap";
document.head.appendChild(fontLink);

// ── Global styles ─────────────────────────────────────────────────────────────
const globalCSS = `
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --bg: #0D0B1A;
    --bg2: #150F2E;
    --bg3: #1E1540;
    --gold: #D4A843;
    --gold2: #F0C060;
    --gold-dim: #8B6B1F;
    --purple: #7C3AED;
    --purple2: #9F67FF;
    --purple-soft: #4C1D95;
    --red: #E84A6F;
    --green: #22C97A;
    --orange: #E8843A;
    --card: rgba(255,255,255,0.04);
    --card-border: rgba(212,168,67,0.18);
    --muted: #5A4A8A;
    --text: #F0E8FF;
    --text-dim: #9A8FC0;
    --correct: #22C97A;
    --wrong: #E84A6F;
  }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Space Grotesk', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 700px 500px at 15% 20%, rgba(124,58,237,0.22) 0%, transparent 65%),
      radial-gradient(ellipse 500px 600px at 85% 75%, rgba(212,168,67,0.12) 0%, transparent 65%),
      radial-gradient(ellipse 400px 300px at 50% 50%, rgba(159,103,255,0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  body::after {
    content: '';
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 220px;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(to bottom, transparent, rgba(124,58,237,0.08) 60%, rgba(212,168,67,0.06));
    mask-image:
      repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(212,168,67,0.18) 60px),
      repeating-linear-gradient(0deg, transparent, transparent 29px, rgba(212,168,67,0.12) 30px);
    -webkit-mask-composite: intersect;
    mask-composite: intersect;
  }

  #root { position: relative; z-index: 1; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes popIn {
    from { transform:scale(0.4) rotateY(90deg); opacity:0; }
    to   { transform:scale(1) rotateY(0deg); opacity:1; }
  }
  @keyframes goldShimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes floatY {
    0%, 100% { transform: translateY(0px) rotateX(2deg); }
    50%       { transform: translateY(-8px) rotateX(0deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
  @keyframes rotateBorder {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes countUp {
    from { transform: scale(0.3) rotateY(90deg); opacity: 0; }
    to   { transform: scale(1) rotateY(0deg); opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  .fadeUp  { animation: fadeUp 0.4s ease both; }
  .popIn   { animation: popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
  .float   { animation: floatY 5s ease-in-out infinite; }
  .pulse   { animation: pulse 3s ease-in-out infinite; }

  .gold-shimmer-text {
    background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 40%, #fff 60%, var(--gold) 80%, var(--purple2) 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: goldShimmer 4s linear infinite;
  }

  .card-3d {
    transform-style: preserve-3d;
    transform: rotateX(3deg) rotateY(-1deg);
    transition: transform 0.4s ease, box-shadow 0.4s ease;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(212,168,67,0.06) 50%, rgba(124,58,237,0.08) 100%);
    border: 1px solid rgba(212,168,67,0.22);
    border-radius: 20px;
    padding: 24px;
    position: relative;
    box-shadow:
      0 30px 60px rgba(0,0,0,0.5),
      0 10px 20px rgba(124,58,237,0.15),
      inset 0 1px 0 rgba(212,168,67,0.15),
      inset 0 -1px 0 rgba(0,0,0,0.3);
  }
  .card-3d::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 21px;
    z-index: -1;
    background: linear-gradient(135deg, rgba(212,168,67,0.3), rgba(124,58,237,0.25), rgba(212,168,67,0.1));
    filter: blur(6px);
    opacity: 0.5;
  }
  .card-3d::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    border-radius: 20px 20px 0 0;
    background: linear-gradient(90deg, transparent 10%, rgba(212,168,67,0.5) 50%, transparent 90%);
  }
  .card-3d:hover {
    transform: rotateX(1deg) rotateY(0deg) translateY(-3px);
    box-shadow:
      0 40px 70px rgba(0,0,0,0.55),
      0 16px 28px rgba(124,58,237,0.22),
      inset 0 1px 0 rgba(212,168,67,0.2),
      inset 0 -1px 0 rgba(0,0,0,0.3);
  }

  .holographic-card {
    position: relative;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(212,168,67,0.14);
    border-radius: 16px;
    transition: border-color 0.3s, box-shadow 0.3s;
    box-shadow: 0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .holographic-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    border-radius: 0 0 16px 16px;
    background: linear-gradient(90deg, transparent, var(--gold), var(--purple2), transparent);
    opacity: 0.5;
  }
  .holographic-card:hover {
    border-color: rgba(212,168,67,0.3);
    box-shadow: 0 12px 30px rgba(0,0,0,0.35), 0 0 20px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .cyber-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.25s ease;
  }
  .cyber-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(212,168,67,0.12), transparent);
    transition: left 0.4s ease;
  }
  .cyber-btn:hover::before { left: 100%; }
  .cyber-btn:hover { transform: translateY(-2px); }
  .cyber-btn:active { transform: translateY(0px) scale(0.98); }

  .option-btn {
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  .option-btn::after {
    content: '';
    position: absolute;
    left: 0; top: 0;
    width: 2px; height: 100%;
    background: linear-gradient(to bottom, var(--gold), var(--purple2));
    transform: scaleY(0);
    transition: transform 0.2s ease;
    transform-origin: bottom;
  }
  .option-btn:not(:disabled):hover::after { transform: scaleY(1); }
  .option-btn:not(:disabled):hover {
    background: rgba(212,168,67,0.06) !important;
    border-color: rgba(212,168,67,0.3) !important;
    transform: translateX(3px);
    color: var(--text) !important;
  }

  .scanline-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 6px;
    background: linear-gradient(transparent, rgba(212,168,67,0.04), transparent);
    animation: scanline 10s linear infinite;
    pointer-events: none;
    z-index: 9999;
  }

  .result-ring-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .result-ring-glow {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: conic-gradient(var(--purple) 0deg, var(--gold) 180deg, var(--purple2) 360deg);
    animation: rotateBorder 5s linear infinite;
    filter: blur(8px);
    opacity: 0.35;
  }
  .ring-spin {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(var(--purple) 0deg, var(--gold) 180deg, var(--purple2) 360deg);
    animation: rotateBorder 5s linear infinite;
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 3px));
    mask: radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 3px));
    z-index: 1;
  }
  .result-ring-inner {
    position: relative;
    z-index: 2;
    width: 160px; height: 160px;
    border-radius: 50%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: radial-gradient(circle, rgba(124,58,237,0.1) 0%, var(--bg) 75%);
    border: 1px solid rgba(212,168,67,0.1);
  }
`;
const styleTag = document.createElement("style");
styleTag.textContent = globalCSS;
document.head.appendChild(styleTag);

// ── Trivia API ────────────────────────────────────────────────────────────────
const DAILY_CATEGORIES = [
  { id: 9,  name: "General Knowledge", icon: "◈" },
  { id: 17, name: "Science & Nature",  icon: "⬡" },
  { id: 23, name: "History",           icon: "◉" },
  { id: 11, name: "Entertainment",     icon: "◎" },
  { id: 21, name: "Sports",            icon: "⬢" },
  { id: 19, name: "Mathematics",       icon: "◆" },
  { id: 22, name: "Geography",         icon: "◐" },
];

function getTodayCategory() {
  const dayIndex = Math.floor(new Date().getTime() / 86400000) % DAILY_CATEGORIES.length;
  return DAILY_CATEGORIES[dayIndex];
}

function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

async function fetchQuestions(categoryId) {
  const base = `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple&difficulty=medium`;
  const url = window.location.hostname === "localhost"
    ? `https://corsproxy.io/?${encodeURIComponent(base)}`
    : base;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  if (data.response_code !== 0) throw new Error("API error");

  return data.results.map((item) => {
    const correct = decodeHTML(item.correct_answer);
    const incorrect = item.incorrect_answers.map(decodeHTML);
    const options = [correct, ...incorrect].sort(() => Math.random() - 0.5);
    return {
      category: decodeHTML(item.category),
      q: decodeHTML(item.question),
      options,
      answer: options.indexOf(correct),
    };
  });
}

// ── Ad Slot IDs ───────────────────────────────────────────────────────────────
const AD_CLIENT      = "ca-pub-4969283434635432";
const AD_SLOT_TOP    = "4706096028";
const AD_SLOT_MID    = "XXXXXXXXXX";
const AD_SLOT_BOTTOM = "YYYYYYYYYY";

// ── Constants ─────────────────────────────────────────────────────────────────
const RESULT_MSGS = [
  { min:9, title:"NEURAL OVERRIDE",  msg:"Maximum cognitive performance detected. Your mind operates at peak frequency." },
  { min:7, title:"SIGNAL STRONG",    msg:"High-resolution thinking confirmed. Fine-tune and you'll hit full bandwidth." },
  { min:5, title:"PROCESSING...",    msg:"Stable connection established. Recalibrate and dominate tomorrow's session." },
  { min:0, title:"LEARNING MODE",    msg:"Every query expands your neural network. The algorithm improves with time." },
];

// ── Ad Components ─────────────────────────────────────────────────────────────
function AdBanner() {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (_e) { /* noop */ }
  }, []);
  return (
    <div style={{ textAlign:"center", margin:"20px 0", width:"100%" }}>
      <ins className="adsbygoogle" style={{ display:"block" }}
        data-ad-client={AD_CLIENT} data-ad-slot={AD_SLOT_TOP}
        data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}

function MidAd() {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (_e) { /* noop */ }
  }, []);
  return (
    <div style={{ textAlign:"center", margin:"16px 0" }}>
      <ins className="adsbygoogle" style={{ display:"block" }}
        data-ad-client={AD_CLIENT} data-ad-slot={AD_SLOT_MID}
        data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}

function BottomAd() {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (_e) { /* noop */ }
  }, []);
  return (
    <div style={{ textAlign:"center", margin:"24px 0 0" }}>
      <ins className="adsbygoogle" style={{ display:"block" }}
        data-ad-client={AD_CLIENT} data-ad-slot={AD_SLOT_BOTTOM}
        data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}

// ── Particle Field ────────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.35 + 0.08,
      gold: Math.random() > 0.5,
    }));

    let animId;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212,168,67,${p.alpha})`
          : `rgba(159,103,255,${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212,168,67,${0.06 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.75,
    }} />
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ dateStr }) {
  return (
    <header style={{ textAlign:"center", padding:"36px 20px 16px" }}>
      <div className="pulse" style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "11px", letterSpacing: "0.5em",
        textTransform: "uppercase", color: "var(--gold)",
        marginBottom: "8px",
      }}>
        ◈ DailyMind ◈
      </div>
      <div style={{
        width: "80px", height: "1px",
        background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
        margin: "10px auto",
      }} />
      <div style={{
        fontSize: "11px", color: "var(--muted)",
        letterSpacing: "0.2em", textTransform: "uppercase",
      }}>
        {dateStr}
      </div>
    </header>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ num, lbl, delay }) {
  return (
    <div className="holographic-card fadeUp" style={{
      flex: 1, padding: "20px 12px", textAlign: "center",
      animationDelay: delay,
      background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(212,168,67,0.04) 100%)",
    }}>
      <div style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "clamp(18px,4vw,26px)",
        fontWeight: 700, color: "var(--gold)",
        textShadow: "0 0 20px rgba(212,168,67,0.4)",
        marginBottom: "4px",
      }}>
        {num}
      </div>
      <div style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {lbl}
      </div>
    </div>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────────
function HomeScreen({ category, stats, onStart, loading, error, onRetry }) {
  return (
    <div style={{ width:"100%", maxWidth:"640px", padding:"0 20px 60px" }}>
      <div className="fadeUp" style={{ textAlign:"center", padding:"16px 0 40px" }}>
        <div className="float" style={{
          fontSize: "52px", marginBottom: "20px",
          filter: "drop-shadow(0 0 24px rgba(212,168,67,0.7)) drop-shadow(0 0 48px rgba(124,58,237,0.4))",
          fontFamily: "'Cinzel', serif", color: "var(--gold)",
          lineHeight: 1,
        }}>
          {category.icon}
        </div>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(26px,7vw,46px)",
          fontWeight: 900, lineHeight: 1.1,
          letterSpacing: "0.02em", marginBottom: "18px",
        }}>
          <span className="gold-shimmer-text">NEURAL</span>
          <br />
          <span style={{ color: "var(--text)", textShadow: "0 0 30px rgba(124,58,237,0.3)" }}>
            QUIZ PROTOCOL
          </span>
        </h1>
        <p style={{
          fontSize: "14px", color: "var(--text-dim)", lineHeight: 1.8,
          maxWidth: "360px", margin: "0 auto 32px", fontWeight: 300,
          letterSpacing: "0.02em",
        }}>
          Ten questions. One session. No second chances.<br />
          Engage your cognitive matrix daily.
        </p>

        <div className="holographic-card fadeUp" style={{
          padding: "22px 26px", marginBottom: "28px",
          display: "flex", alignItems: "center", gap: "18px",
          background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(212,168,67,0.04) 100%)",
          animationDelay: "0.1s",
        }}>
          <div style={{
            width: "52px", height: "52px",
            background: "linear-gradient(135deg, rgba(212,168,67,0.18), rgba(124,58,237,0.12))",
            border: "1px solid rgba(212,168,67,0.3)",
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", color: "var(--gold)",
            fontFamily: "'Cinzel', serif",
            flexShrink: 0,
            boxShadow: "0 0 20px rgba(212,168,67,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}>
            {category.icon}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{
              fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em",
              color: "var(--gold)", marginBottom: "4px", fontFamily: "'Cinzel', serif",
            }}>
              Today's Module
            </div>
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(13px,3vw,17px)", fontWeight: 700, color: "var(--text)",
            }}>
              {category.name}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "3px" }}>
              10 queries · ~3 min runtime
            </div>
          </div>
        </div>

        {error ? (
          <div className="fadeUp" style={{
            background: "rgba(232,74,111,0.08)",
            border: "1px solid rgba(232,74,111,0.25)",
            borderRadius: "16px", padding: "28px", margin: "0 0 24px",
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: "16px",
              color: "var(--red)", marginBottom: "10px",
            }}>
              CONNECTION FAILED
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-dim)", marginBottom: "20px", lineHeight: 1.6 }}>
              Data uplink unavailable. Reattempt connection?
            </div>
            <button className="cyber-btn" style={{
              background: "rgba(232,74,111,0.15)",
              border: "1px solid rgba(232,74,111,0.4)",
              color: "var(--red)", padding: "12px 24px",
              borderRadius: "8px", fontFamily: "'Cinzel', serif",
              fontSize: "12px", cursor: "pointer", letterSpacing: "0.1em",
            }} onClick={onRetry}>
              ↻ RETRY
            </button>
          </div>
        ) : (
          <button className="cyber-btn" style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: loading
              ? "rgba(212,168,67,0.04)"
              : "linear-gradient(135deg, #7C3AED 0%, #9F67FF 40%, #D4A843 100%)",
            color: loading ? "var(--muted)" : "white",
            border: loading ? "1px solid rgba(212,168,67,0.1)" : "none",
            padding: "16px 40px", borderRadius: "50px",
            fontFamily: "'Cinzel', serif",
            fontSize: "13px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.12em",
            boxShadow: loading ? "none" : "0 8px 24px rgba(124,58,237,0.4), 0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
          }} onClick={onStart} disabled={loading}>
            {loading ? (
              <>
                <span style={{
                  width: "14px", height: "14px",
                  border: "2px solid rgba(212,168,67,0.2)",
                  borderTopColor: "var(--gold)",
                  borderRadius: "50%", display: "inline-block",
                  animation: "spin 0.8s linear infinite",
                }} />
                LOADING DATA...
              </>
            ) : "⚡ INITIATE QUIZ"}
          </button>
        )}
      </div>

      <div style={{ display:"flex", gap:"12px", marginBottom:"32px" }}>
        <StatCard num={stats.played} lbl="Sessions" delay="0.15s" />
        <StatCard num={stats.best !== null ? stats.best + "/10" : "—"} lbl="Best Score" delay="0.2s" />
        <StatCard num={stats.streak + " 🔥"} lbl="Streak" delay="0.25s" />
      </div>

      <BottomAd />
    </div>
  );
}

// ── QuizScreen ────────────────────────────────────────────────────────────────
function QuizScreen({ questionIndex, score, question, onAnswer, answered, selectedIdx, onNext, total }) {
  const letters = ["A", "B", "C", "D"];
  const isCorrect = answered && selectedIdx === question.answer;
  const progress = ((questionIndex + (answered ? 1 : 0)) / total) * 100;

  function getOptStyle(i) {
    const base = {
      width: "100%", borderRadius: "12px",
      padding: "15px 20px", textAlign: "left", fontFamily: "'Space Grotesk', sans-serif",
      fontSize: "14px",
      display: "flex", alignItems: "center", gap: "14px",
      transition: "all 0.2s",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      position: "relative",
    };
    if (!answered) {
      return { ...base, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,168,67,0.1)", color: "var(--text)", cursor: "pointer" };
    }
    if (i === question.answer) {
      return { ...base, background: "rgba(34,201,122,0.07)", border: "1px solid rgba(34,201,122,0.35)", color: "var(--green)", cursor: "default", boxShadow: "0 0 16px rgba(34,201,122,0.07)" };
    }
    if (i === selectedIdx) {
      return { ...base, background: "rgba(232,74,111,0.07)", border: "1px solid rgba(232,74,111,0.28)", color: "var(--red)", cursor: "default" };
    }
    return { ...base, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", color: "var(--muted)", cursor: "default", opacity: 0.4 };
  }

  function getLetterStyle(i) {
    const base = {
      width: "30px", height: "30px", borderRadius: "8px",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: 700, flexShrink: 0,
      fontFamily: "'Cinzel', serif", transition: "all 0.2s",
    };
    if (answered && i === question.answer)
      return { ...base, background: "rgba(34,201,122,0.18)", color: "var(--green)", border: "1px solid rgba(34,201,122,0.35)" };
    if (answered && i === selectedIdx)
      return { ...base, background: "rgba(232,74,111,0.18)", color: "var(--red)", border: "1px solid rgba(232,74,111,0.35)" };
    return { ...base, background: "rgba(212,168,67,0.1)", color: "var(--gold)", border: "1px solid rgba(212,168,67,0.2)" };
  }

  return (
    <div style={{ width:"100%", maxWidth:"640px", padding:"0 20px 60px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 0 20px" }}>
        <div style={{ fontSize:"11px", color:"var(--muted)", letterSpacing:"0.2em", textTransform:"uppercase", fontFamily:"'Cinzel', serif" }}>
          Q{questionIndex + 1} / {total}
        </div>
        <div style={{ fontFamily:"'Cinzel', serif", fontSize:"16px", fontWeight:700, color:"var(--gold)", textShadow:"0 0 10px rgba(212,168,67,0.4)" }}>
          {score} <span style={{ color:"var(--muted)", fontSize:"11px" }}>PTS</span>
        </div>
      </div>

      <div style={{ width:"100%", height:"3px", background:"rgba(255,255,255,0.05)", borderRadius:"2px", marginBottom:"28px", overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${progress}%`,
          background:"linear-gradient(90deg, var(--purple), var(--purple2), var(--gold))",
          borderRadius:"2px", transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)",
          boxShadow:"0 0 8px rgba(212,168,67,0.4)",
        }} />
      </div>

      <div className="card-3d fadeUp" key={questionIndex} style={{ marginBottom:"18px" }}>
        <div style={{ fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.2em", color:"var(--gold)", marginBottom:"12px", fontFamily:"'Cinzel', serif", fontWeight:600 }}>
          {question.category}
        </div>
        <div style={{ fontSize:"clamp(16px,3.5vw,19px)", lineHeight:1.55, fontWeight:500, color:"var(--text)", letterSpacing:"-0.01em" }}>
          {question.q}
        </div>
      </div>

      {questionIndex === 4 && <MidAd />}

      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={!answered ? "option-btn" : ""}
            style={getOptStyle(i)}
            disabled={answered}
            onClick={() => onAnswer(i)}
          >
            <span style={getLetterStyle(i)}>{letters[i]}</span>
            <span style={{ flex:1 }}>{opt}</span>
            {answered && i === question.answer && <span style={{ color:"var(--green)", fontSize:"15px" }}>✓</span>}
            {answered && i === selectedIdx && i !== question.answer && <span style={{ color:"var(--red)", fontSize:"15px" }}>✗</span>}
          </button>
        ))}
      </div>

      {answered && (
        <div className="fadeUp" style={{
          padding:"13px 18px", borderRadius:"10px",
          fontSize:"12px", fontWeight:600, marginTop:"14px",
          letterSpacing:"0.04em", fontFamily:"'Cinzel', serif",
          ...(isCorrect
            ? { background:"rgba(34,201,122,0.06)", color:"var(--green)", border:"1px solid rgba(34,201,122,0.18)" }
            : { background:"rgba(232,74,111,0.06)", color:"var(--red)", border:"1px solid rgba(232,74,111,0.18)" }),
        }}>
          {isCorrect
            ? "✓ CORRECT — neural pathway reinforced."
            : `✗ INCORRECT — answer: ${question.options[question.answer]}`}
        </div>
      )}

      {answered && (
        <button className="cyber-btn fadeUp" style={{
          display:"block", width:"100%", marginTop:"14px",
          background:"linear-gradient(135deg, rgba(124,58,237,0.18), rgba(212,168,67,0.1))",
          color:"var(--gold)", border:"1px solid rgba(212,168,67,0.28)",
          padding:"15px", borderRadius:"12px",
          fontFamily:"'Cinzel', serif", fontSize:"12px", fontWeight:700,
          cursor:"pointer", letterSpacing:"0.12em",
          boxShadow:"0 6px 18px rgba(0,0,0,0.25)",
        }} onClick={onNext}>
          {questionIndex + 1 < total ? "NEXT QUERY →" : "VIEW RESULTS →"}
        </button>
      )}
    </div>
  );
}

// ── ResultScreen ──────────────────────────────────────────────────────────────
function ResultScreen({ score, results, today, total, onHome }) {
  const m = RESULT_MSGS.find(x => score >= x.min) || RESULT_MSGS[RESULT_MSGS.length - 1];
  const pct = Math.round((score / total) * 100);

  function share() {
    const siteUrl = window.location.href;
    const text = `◈ DailyMind Neural Quiz\n${today.toLocaleDateString()}\nScore: ${score}/${total} (${pct}%)\n\nTest your network: ${siteUrl}`;
    if (navigator.share) navigator.share({ title: "DailyMind Score", text });
    else navigator.clipboard.writeText(text);
  }

  return (
    <div style={{ width:"100%", maxWidth:"640px", padding:"0 20px 60px" }}>
      <div style={{ textAlign:"center", padding:"20px 0" }}>

        <div className="result-ring-wrap popIn" style={{ margin:"0 auto 32px", width:"160px", height:"160px" }}>
          <div className="result-ring-glow" />
          <div className="ring-spin" />
          <div className="result-ring-inner">
            <div style={{
              fontFamily:"'Cinzel', serif", fontSize:"52px", fontWeight:900,
              color:"var(--gold)", lineHeight:1,
              textShadow:"0 0 30px rgba(212,168,67,0.6)",
              animation:"countUp 0.5s 0.3s ease both",
            }}>
              {score}
            </div>
            <div style={{ fontSize:"13px", color:"var(--muted)", letterSpacing:"0.1em" }}>
              / {total}
            </div>
          </div>
        </div>

        <div className="fadeUp" style={{
          fontFamily:"'Cinzel', serif",
          fontSize:"clamp(15px,4vw,20px)",
          fontWeight:900, color:"var(--gold)",
          marginBottom:"10px", letterSpacing:"0.06em",
          textShadow:"0 0 20px rgba(212,168,67,0.4)",
        }}>
          {m.title}
        </div>
        <div className="fadeUp" style={{
          fontSize:"14px", color:"var(--text-dim)", lineHeight:1.7,
          maxWidth:"360px", margin:"0 auto 28px", fontWeight:300,
        }}>
          {m.msg}
        </div>

        <div className="holographic-card fadeUp" style={{
          padding:"16px 20px", marginBottom:"16px",
          display:"flex", alignItems:"center", gap:"14px",
          background:"linear-gradient(135deg, rgba(124,58,237,0.06), rgba(212,168,67,0.04))",
        }}>
          <span style={{ fontSize:"10px", color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase", fontFamily:"'Cinzel', serif", whiteSpace:"nowrap" }}>
            Accuracy
          </span>
          <div style={{ flex:1, height:"4px", background:"rgba(255,255,255,0.05)", borderRadius:"2px", overflow:"hidden" }}>
            <div style={{
              height:"100%", width:`${pct}%`,
              background: pct >= 70 ? "linear-gradient(90deg, var(--purple), var(--gold))" : "linear-gradient(90deg, var(--orange), var(--red))",
              borderRadius:"2px",
              transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <span style={{ fontFamily:"'Cinzel', serif", fontSize:"14px", color: pct >= 70 ? "var(--gold)" : "var(--orange)", fontWeight:700 }}>
            {pct}%
          </span>
        </div>

        <div className="card-3d fadeUp" style={{ padding:"20px 22px", marginBottom:"24px", textAlign:"left" }}>
          <div style={{ fontSize:"10px", textTransform:"uppercase", letterSpacing:"0.2em", color:"var(--muted)", marginBottom:"14px", fontFamily:"'Cinzel', serif" }}>
            Query Breakdown
          </div>
          {results.map((r, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:"12px",
              padding:"8px 0",
              borderBottom: i < results.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              fontSize:"13px",
              color: r.correct ? "var(--text)" : "var(--text-dim)",
            }}>
              <div style={{
                width:"20px", height:"20px", borderRadius:"6px", flexShrink:0,
                background: r.correct ? "rgba(34,201,122,0.1)" : "rgba(232,74,111,0.1)",
                border: `1px solid ${r.correct ? "rgba(34,201,122,0.28)" : "rgba(232,74,111,0.28)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"10px",
                color: r.correct ? "var(--green)" : "var(--red)",
              }}>
                {r.correct ? "✓" : "✗"}
              </div>
              <span style={{ flex:1 }}>
                Q{i + 1}: {r.q.length > 55 ? r.q.substring(0, 52) + "…" : r.q}
              </span>
            </div>
          ))}
        </div>

        <div className="fadeUp" style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
          <button className="cyber-btn" style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background:"linear-gradient(135deg, #7C3AED 0%, #9F67FF 40%, #D4A843 100%)",
            color:"white", border:"none",
            padding:"14px 28px", borderRadius:"50px",
            fontFamily:"'Cinzel', serif", fontSize:"12px", fontWeight:700,
            cursor:"pointer", letterSpacing:"0.1em",
            boxShadow:"0 8px 24px rgba(124,58,237,0.35)",
          }} onClick={share}>
            ⬆ SHARE SCORE
          </button>
          <button className="cyber-btn" style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background:"transparent", color:"var(--text-dim)",
            border:"1px solid rgba(255,255,255,0.1)",
            padding:"14px 28px", borderRadius:"50px",
            fontFamily:"'Cinzel', serif", fontSize:"12px", fontWeight:700,
            cursor:"pointer", letterSpacing:"0.1em",
          }} onClick={onHome}>
            ↩ PLAY AGAIN
          </button>
        </div>

        <BottomAd />
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const today    = new Date();
  const category = getTodayCategory();
  const dateStr  = today.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const loadStats = () => {
    try {
      return JSON.parse(localStorage.getItem("quizStats") || "null") ||
        { played: 0, best: null, streak: 0, lastDate: null };
    } catch {
      return { played: 0, best: null, streak: 0, lastDate: null };
    }
  };

  const [screen,      setScreen]      = useState("home");
  const [questions,   setQuestions]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const [currentQ,    setCurrentQ]    = useState(0);
  const [score,       setScore]       = useState(0);
  const [answered,    setAnswered]    = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [results,     setResults]     = useState([]);
  const [stats,       setStats]       = useState(loadStats);

  useEffect(() => { loadQuestions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadQuestions() {
    setLoading(true); setError(false);
    try { setQuestions(await fetchQuestions(category.id)); }
    catch { setError(true); }
    finally { setLoading(false); }
  }

  function startQuiz() {
    if (!questions.length) return;
    setCurrentQ(0); setScore(0); setAnswered(false);
    setSelectedIdx(null); setResults([]);
    setScreen("quiz");
    window.scrollTo(0, 0);
  }

  function handleAnswer(idx) {
    if (answered) return;
    const correct = idx === questions[currentQ].answer;
    setSelectedIdx(idx); setAnswered(true);
    if (correct) setScore(s => s + 1);
    setResults(r => [...r, { q: questions[currentQ].q, correct }]);
  }

  function nextQuestion() {
    const next = currentQ + 1;
    if (next >= questions.length) {
      const todayStr  = today.toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStats = {
        played:   stats.played + 1,
        best:     stats.best === null ? score : Math.max(stats.best, score),
        streak:   stats.lastDate === yesterday ? stats.streak + 1 : 1,
        lastDate: todayStr,
      };
      localStorage.setItem("quizStats", JSON.stringify(newStats));
      setStats(newStats);
      setScreen("result");
    } else {
      setCurrentQ(next); setAnswered(false); setSelectedIdx(null);
    }
    window.scrollTo(0, 0);
  }

  function goHome() {
    setScreen("home");
    loadQuestions();
    window.scrollTo(0, 0);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minHeight:"100vh" }}>
      <div className="scanline-overlay" />
      <ParticleField />

      <AdBanner />
      <Header dateStr={dateStr} />

      {screen === "home" && (
        <HomeScreen
          category={category} stats={stats}
          onStart={startQuiz} loading={loading}
          error={error} onRetry={loadQuestions}
        />
      )}
      {screen === "quiz" && questions.length > 0 && (
        <QuizScreen
          questionIndex={currentQ} score={score}
          question={questions[currentQ]} onAnswer={handleAnswer}
          answered={answered} selectedIdx={selectedIdx}
          onNext={nextQuestion} total={questions.length}
        />
      )}
      {screen === "result" && (
        <ResultScreen
          score={score} results={results}
          today={today} total={questions.length}
          onHome={goHome}
        />
      )}

      <footer style={{
        textAlign:"center", padding:"24px 20px",
        fontSize:"11px", color:"var(--muted)",
        borderTop:"1px solid rgba(212,168,67,0.08)",
        width:"100%", marginTop:"auto",
        fontFamily:"'Cinzel', serif", letterSpacing:"0.1em",
      }}>
        DAILYMIND &copy; {today.getFullYear()}
        &nbsp;·&nbsp;
        FOUNDED BY <strong style={{ color:"var(--gold)" }}>ROJAR BENNY K</strong>
        &nbsp;·&nbsp;
        NEURAL SYNC DAILY
      </footer>
    </div>
  );
}
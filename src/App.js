import { useState, useEffect } from "react";

// ── Google Fonts ─────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

// ── Global styles ─────────────────────────────────────────────────────────────
const globalCSS = `
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --cream:#F5F0E8; --ink:#1A1A1A; --gold:#C9A84C;
    --muted:#7A7065; --correct:#3D7A5E; --wrong:#A84C4C;
    --card:#FFFFFF; --border:#E0D8CC;
  }
  body {
    font-family:'DM Sans',sans-serif;
    background:var(--cream);
    color:var(--ink);
    min-height:100vh;
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(14px)}
    to{opacity:1;transform:translateY(0)}
  }
  @keyframes popIn {
    from{transform:scale(0.5);opacity:0}
    to{transform:scale(1);opacity:1}
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .fadeUp { animation: fadeUp 0.35s ease both; }
  .popIn  { animation: popIn  0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
`;
const styleTag = document.createElement("style");
styleTag.textContent = globalCSS;
document.head.appendChild(styleTag);

// ── Trivia API ────────────────────────────────────────────────────────────────
const DAILY_CATEGORIES = [
  { id: 9,  name: "General Knowledge", icon: "🧠" },
  { id: 17, name: "Science & Nature",  icon: "🔬" },
  { id: 23, name: "History",           icon: "📜" },
  { id: 11, name: "Entertainment",     icon: "🎬" },
  { id: 21, name: "Sports",            icon: "⚽" },
  { id: 19, name: "Mathematics",       icon: "🔢" },
  { id: 22, name: "Geography",         icon: "🌍" },
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
// Each ad unit must have its own unique slot ID from your AdSense dashboard.
// Go to AdSense → Ads → By ad unit → create separate units for each placement.
const AD_CLIENT   = "ca-pub-4969283434635432";
const AD_SLOT_TOP    = "4706096028"; // ← your existing top banner slot
const AD_SLOT_MID    = "XXXXXXXXXX"; // ← replace with your mid-quiz slot ID
const AD_SLOT_BOTTOM = "YYYYYYYYYY"; // ← replace with your result/bottom slot ID

// ── Constants ─────────────────────────────────────────────────────────────────
const RESULT_MSGS = [
  { min:9, title:"Outstanding!", msg:"You're in the top tier. Truly impressive knowledge!" },
  { min:7, title:"Great Job!",   msg:"You know your stuff! A little more practice and you'll be perfect." },
  { min:5, title:"Not Bad!",     msg:"A solid effort. Come back tomorrow and beat your score." },
  { min:0, title:"Keep Going!",  msg:"Every quiz teaches you something new. See you tomorrow!" },
];

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page:      { display:"flex", flexDirection:"column", alignItems:"center", minHeight:"100vh" },
  header:    { textAlign:"center", padding:"40px 20px 20px" },
  logo:      { fontFamily:"'Playfair Display',serif", fontSize:"13px", letterSpacing:"0.3em",
               textTransform:"uppercase", color:"var(--gold)", marginBottom:"6px" },
  dateLine:  { fontSize:"12px", color:"var(--muted)", letterSpacing:"0.1em", textTransform:"uppercase" },
  divider:   { width:"60px", height:"1px", background:"var(--gold)", margin:"16px auto" },
  screen:    { width:"100%", maxWidth:"640px", padding:"0 20px 60px" },
  hero:      { textAlign:"center", padding:"20px 0 40px" },
  h1:        { fontFamily:"'Playfair Display',serif", fontSize:"clamp(36px,8vw,56px)",
               fontWeight:900, lineHeight:1.1, letterSpacing:"-0.02em", marginBottom:"16px" },
  heroP:     { fontSize:"16px", color:"var(--muted)", lineHeight:1.6, maxWidth:"380px",
               margin:"0 auto 32px", fontWeight:300 },
  topicCard: { background:"var(--card)", border:"1px solid var(--border)", borderRadius:"16px",
               padding:"24px 28px", marginBottom:"28px", display:"flex",
               alignItems:"center", gap:"16px", boxShadow:"0 2px 20px rgba(0,0,0,0.04)" },
  topicIcon: { fontSize:"36px", flexShrink:0 },
  topicLabel:{ fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.15em",
               color:"var(--muted)", marginBottom:"4px" },
  topicName: { fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700 },
  topicCount:{ fontSize:"13px", color:"var(--muted)", marginTop:"2px" },
  btnPrimary:{ display:"inline-flex", alignItems:"center", gap:"8px",
               background:"var(--ink)", color:"#fff", border:"none",
               padding:"16px 36px", borderRadius:"50px", fontFamily:"'DM Sans',sans-serif",
               fontSize:"15px", fontWeight:500, cursor:"pointer", letterSpacing:"0.02em",
               transition:"all 0.2s" },
  statsRow:  { display:"flex", gap:"12px", marginTop:"28px" },
  statCard:  { flex:1, background:"var(--card)", border:"1px solid var(--border)",
               borderRadius:"12px", padding:"16px", textAlign:"center" },
  statNum:   { fontFamily:"'Playfair Display',serif", fontSize:"28px", fontWeight:700, color:"var(--gold)" },
  statLbl:   { fontSize:"12px", color:"var(--muted)", marginTop:"2px" },
  quizHeader:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 0 24px" },
  qCounter:  { fontSize:"13px", color:"var(--muted)", letterSpacing:"0.05em", textTransform:"uppercase" },
  qScore:    { fontFamily:"'Playfair Display',serif", fontSize:"18px", fontWeight:700 },
  progressBar:{ width:"100%", height:"3px", background:"var(--border)", borderRadius:"2px",
                marginBottom:"28px", overflow:"hidden" },
  progressFill:{ height:"100%", background:"var(--gold)", borderRadius:"2px", transition:"width 0.4s ease" },
  questionCard:{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"20px",
                 padding:"32px", marginBottom:"20px", boxShadow:"0 2px 20px rgba(0,0,0,0.04)" },
  qCategory: { fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.15em",
               color:"var(--gold)", marginBottom:"12px", fontWeight:500 },
  qText:     { fontFamily:"'Playfair Display',serif", fontSize:"clamp(18px,4vw,22px)",
               lineHeight:1.4, fontWeight:700 },
  optionsGrid:{ display:"flex", flexDirection:"column", gap:"10px" },
  optBase:   { width:"100%", background:"var(--card)", border:"1.5px solid var(--border)",
               borderRadius:"12px", padding:"16px 20px", textAlign:"left",
               fontFamily:"'DM Sans',sans-serif", fontSize:"15px", cursor:"pointer",
               display:"flex", alignItems:"center", gap:"14px", color:"var(--ink)",
               transition:"all 0.18s" },
  optLetter: { width:"28px", height:"28px", borderRadius:"50%", background:"var(--cream)",
               display:"flex", alignItems:"center", justifyContent:"center",
               fontSize:"12px", fontWeight:600, flexShrink:0, transition:"all 0.18s" },
  feedbackBase:{ padding:"14px 20px", borderRadius:"12px", fontSize:"14px",
                 fontWeight:500, marginTop:"10px" },
  nextBtn:   { display:"block", width:"100%", marginTop:"16px", background:"var(--ink)",
               color:"#fff", border:"none", padding:"16px", borderRadius:"12px",
               fontFamily:"'DM Sans',sans-serif", fontSize:"15px", fontWeight:500,
               cursor:"pointer", letterSpacing:"0.02em", transition:"all 0.2s" },
  resultWrapper:{ textAlign:"center", padding:"20px 0" },
  resultCircle: { width:"140px", height:"140px", borderRadius:"50%",
                  border:"3px solid var(--gold)", display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center", margin:"0 auto 28px",
                  background:"#fff", boxShadow:"0 0 0 10px #FBF7EF" },
  resultScore:  { fontFamily:"'Playfair Display',serif", fontSize:"48px", fontWeight:900,
                  color:"var(--gold)", lineHeight:1 },
  resultTotal:  { fontSize:"14px", color:"var(--muted)" },
  resultTitle:  { fontFamily:"'Playfair Display',serif", fontSize:"28px", fontWeight:700, marginBottom:"10px" },
  resultMsg:    { fontSize:"15px", color:"var(--muted)", lineHeight:1.6,
                  maxWidth:"360px", margin:"0 auto 32px", fontWeight:300 },
  breakdown:    { background:"var(--card)", border:"1px solid var(--border)", borderRadius:"16px",
                  padding:"20px 24px", marginBottom:"24px", textAlign:"left" },
  bTitle:       { fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.15em",
                  color:"var(--muted)", marginBottom:"14px" },
  bItem:        { display:"flex", alignItems:"center", gap:"12px", padding:"8px 0",
                  borderBottom:"1px solid var(--border)", fontSize:"14px" },
  bDot:         { width:"8px", height:"8px", borderRadius:"50%", flexShrink:0 },
  shareBtn:     { display:"inline-flex", alignItems:"center", gap:"8px",
                  background:"var(--ink)", color:"#fff", border:"none",
                  padding:"14px 28px", borderRadius:"50px", fontFamily:"'DM Sans',sans-serif",
                  fontSize:"14px", fontWeight:500, cursor:"pointer", margin:"4px", transition:"all 0.2s" },
  shareBtnOut:  { display:"inline-flex", alignItems:"center", gap:"8px",
                  background:"transparent", color:"var(--ink)", border:"1.5px solid var(--border)",
                  padding:"14px 28px", borderRadius:"50px", fontFamily:"'DM Sans',sans-serif",
                  fontSize:"14px", fontWeight:500, cursor:"pointer", margin:"4px", transition:"all 0.2s" },
  footer:       { textAlign:"center", padding:"20px", fontSize:"12px", color:"var(--muted)",
                  borderTop:"1px solid var(--border)", width:"100%", marginTop:"auto" },
  errorBox:     { background:"#F5EBEB", border:"1px solid #DDB8B8", borderRadius:"16px",
                  padding:"28px", textAlign:"center", margin:"20px 0" },
  errorTitle:   { fontFamily:"'Playfair Display',serif", fontSize:"20px",
                  marginBottom:"10px", color:"var(--wrong)" },
  errorMsg:     { fontSize:"14px", color:"var(--muted)", marginBottom:"20px", lineHeight:1.6 },
};

// ── Ad Components ─────────────────────────────────────────────────────────────
// Each component uses its own unique slot ID.
// Replace AD_SLOT_MID and AD_SLOT_BOTTOM with real slot IDs from AdSense dashboard.

function AdBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);
  return (
    <div style={{ textAlign:"center", margin:"20px 0", width:"100%" }}>
      <ins
        className="adsbygoogle"
        style={{ display:"block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT_TOP}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

function MidAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);
  return (
    <div style={{ textAlign:"center", margin:"16px 0" }}>
      <ins
        className="adsbygoogle"
        style={{ display:"block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT_MID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

function BottomAd() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);
  return (
    <div style={{ textAlign:"center", margin:"24px 0 0" }}>
      <ins
        className="adsbygoogle"
        style={{ display:"block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT_BOTTOM}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ dateStr }) {
  return (
    <header style={s.header}>
      <div style={s.logo}>DailyMind</div>
      <div style={s.divider} />
      <div style={s.dateLine}>{dateStr}</div>
    </header>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────────
function HomeScreen({ category, stats, onStart, loading, error, onRetry }) {
  return (
    <div style={s.screen}>
      <div style={s.hero} className="fadeUp">
        <h1 style={s.h1}>
          Test Your<br /><span style={{ color:"var(--gold)" }}>Mind Daily</span>
        </h1>
        <p style={s.heroP}>
          Your daily dose of brain fuel — ten questions, one chance, zero excuses.
        </p>
      </div>

      <div style={s.topicCard} className="fadeUp">
        <div style={s.topicIcon}>{category.icon}</div>
        <div>
          <div style={s.topicLabel}>Today's Topic</div>
          <div style={s.topicName}>{category.name}</div>
          <div style={s.topicCount}>10 live questions · ~3 minutes</div>
        </div>
      </div>

      {error ? (
        <div style={s.errorBox} className="fadeUp">
          <div style={s.errorTitle}>Couldn't Load Questions</div>
          <div style={s.errorMsg}>
            The trivia server might be busy. Please try again in a moment.
          </div>
          <button style={s.btnPrimary} onClick={onRetry}>↻ Try Again</button>
        </div>
      ) : (
        <div style={{ textAlign:"center" }} className="fadeUp">
          <button
            style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
            onClick={onStart}
            disabled={loading}
            onMouseEnter={e => { if (!loading) Object.assign(e.currentTarget.style, { background:"var(--gold)", transform:"translateY(-1px)", boxShadow:"0 6px 20px rgba(201,168,76,0.3)" }); }}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { background:"var(--ink)", transform:"none", boxShadow:"none" })}>
            {loading ? "⏳ Loading Questions…" : "Begin Today's Quiz →"}
          </button>
        </div>
      )}

      <div style={s.statsRow} className="fadeUp">
        {[
          { num: stats.played,                                    lbl:"Quizzes Played" },
          { num: stats.best !== null ? stats.best + "/10" : "—", lbl:"Best Score" },
          { num: stats.streak + "🔥",                            lbl:"Day Streak" },
        ].map(({ num, lbl }) => (
          <div key={lbl} style={s.statCard}>
            <div style={s.statNum}>{num}</div>
            <div style={s.statLbl}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Bottom ad on home screen — uses its own slot */}
      <BottomAd />
    </div>
  );
}

// ── QuizScreen ────────────────────────────────────────────────────────────────
function QuizScreen({ questionIndex, score, question, onAnswer, answered, selectedIdx, onNext, total }) {
  const letters = ["A","B","C","D"];
  const isCorrect = answered && selectedIdx === question.answer;

  function optStyle(i) {
    let base = { ...s.optBase };
    if (answered) {
      if (i === question.answer) base = { ...base, borderColor:"var(--correct)", background:"#EBF5F0" };
      else if (i === selectedIdx) base = { ...base, borderColor:"var(--wrong)", background:"#F5EBEB" };
    }
    return base;
  }
  function letterStyle(i) {
    let base = { ...s.optLetter };
    if (answered) {
      if (i === question.answer) base = { ...base, background:"var(--correct)", color:"#fff" };
      else if (i === selectedIdx) base = { ...base, background:"var(--wrong)", color:"#fff" };
    }
    return base;
  }

  return (
    <div style={s.screen}>
      <div style={s.quizHeader}>
        <div style={s.qCounter}>Question {questionIndex + 1} of {total}</div>
        <div style={s.qScore}>Score: <strong>{score}</strong></div>
      </div>
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width:`${(questionIndex / total) * 100}%` }} />
      </div>

      <div style={s.questionCard} className="fadeUp" key={questionIndex}>
        <div style={s.qCategory}>{question.category}</div>
        <div style={s.qText}>{question.q}</div>
      </div>

      {/* Mid-quiz ad shown at question 5 — uses its own unique slot */}
      {questionIndex === 4 && <MidAd />}

      <div style={s.optionsGrid}>
        {question.options.map((opt, i) => (
          <button key={i} style={optStyle(i)} disabled={answered}
            onClick={() => onAnswer(i)}
            onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = "var(--gold)"; }}
            onMouseLeave={e => { if (!answered) e.currentTarget.style.borderColor = "var(--border)"; }}>
            <span style={letterStyle(i)}>{letters[i]}</span>
            {opt}
          </button>
        ))}
      </div>

      {answered && (
        <div className="fadeUp" style={{
          ...s.feedbackBase,
          ...(isCorrect
            ? { background:"#EBF5F0", color:"var(--correct)", border:"1px solid #B8DDD0" }
            : { background:"#F5EBEB", color:"var(--wrong)",   border:"1px solid #DDB8B8" }),
        }}>
          {isCorrect ? "✓ Correct! Well done."
            : `✗ The correct answer was: ${question.options[question.answer]}`}
        </div>
      )}

      {answered && (
        <button className="fadeUp" style={s.nextBtn} onClick={onNext}
          onMouseEnter={e => e.currentTarget.style.background = "var(--gold)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--ink)"}>
          {questionIndex + 1 < total ? "Next Question →" : "See Results →"}
        </button>
      )}
    </div>
  );
}

// ── ResultScreen ──────────────────────────────────────────────────────────────
function ResultScreen({ score, results, today, total, onHome }) {
  const m = RESULT_MSGS.find(x => score >= x.min);

  function share() {
    const siteUrl = window.location.href;
    const text = `🧠 DailyMind Quiz\n📅 ${today.toLocaleDateString()}\n✅ I scored ${score}/${total}!\n\nCan you beat me? Play at ${siteUrl}`;
    if (navigator.share) navigator.share({ title:"DailyMind Score", text });
    else navigator.clipboard.writeText(text);
  }

  return (
    <div style={s.screen}>
      <div style={s.resultWrapper}>
        <div style={s.resultCircle} className="popIn">
          <div style={s.resultScore}>{score}</div>
          <div style={s.resultTotal}>out of {total}</div>
        </div>
        <div style={s.resultTitle} className="fadeUp">{m.title}</div>
        <div style={s.resultMsg}   className="fadeUp">{m.msg}</div>

        <div style={s.breakdown} className="fadeUp">
          <div style={s.bTitle}>Question Breakdown</div>
          {results.map((r, i) => (
            <div key={i} style={{ ...s.bItem, ...(i === results.length-1 ? { borderBottom:"none" } : {}) }}>
              <div style={{ ...s.bDot, background: r.correct ? "var(--correct)" : "var(--wrong)" }} />
              <div>Q{i+1}: {r.q.length > 55 ? r.q.substring(0,52)+"…" : r.q}</div>
            </div>
          ))}
        </div>

        <div className="fadeUp">
          <button style={s.shareBtn} onClick={share}
            onMouseEnter={e => Object.assign(e.currentTarget.style, { background:"var(--gold)", transform:"translateY(-1px)" })}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { background:"var(--ink)", transform:"none" })}>
            📤 Share Score
          </button>
          <button style={s.shareBtnOut} onClick={onHome}
            onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor:"var(--gold)", background:"#FBF7EF" })}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor:"var(--border)", background:"transparent" })}>
            ↩ Play Again
          </button>
        </div>

        {/* Bottom ad on result screen — uses its own unique slot */}
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
    weekday:"long", year:"numeric", month:"long", day:"numeric",
  });

  const loadStats = () => {
    try { return JSON.parse(localStorage.getItem("quizStats") || "null") || { played:0, best:null, streak:0, lastDate:null }; }
    catch { return { played:0, best:null, streak:0, lastDate:null }; }
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadQuestions(); }, []);

  async function loadQuestions() {
    setLoading(true);
    setError(false);
    try {
      const qs = await fetchQuestions(category.id);
      setQuestions(qs);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function startQuiz() {
    if (questions.length === 0) return;
    setCurrentQ(0); setScore(0); setAnswered(false);
    setSelectedIdx(null); setResults([]);
    setScreen("quiz");
    window.scrollTo(0, 0);
  }

  function handleAnswer(idx) {
    if (answered) return;
    const correct = idx === questions[currentQ].answer;
    setSelectedIdx(idx);
    setAnswered(true);
    if (correct) setScore(sc => sc + 1);
    setResults(r => [...r, { q: questions[currentQ].q, correct }]);
  }

  function nextQuestion() {
    const next = currentQ + 1;
    if (next >= questions.length) {
      const todayStr  = today.toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStats  = {
        played:   stats.played + 1,
        best:     stats.best === null ? score : Math.max(stats.best, score),
        streak:   stats.lastDate === yesterday ? stats.streak + 1 : 1,
        lastDate: todayStr,
      };
      localStorage.setItem("quizStats", JSON.stringify(newStats));
      setStats(newStats);
      setScreen("result");
    } else {
      setCurrentQ(next);
      setAnswered(false);
      setSelectedIdx(null);
    }
    window.scrollTo(0, 0);
  }

  function goHome() {
    setScreen("home");
    loadQuestions();
    window.scrollTo(0, 0);
  }

  return (
    <div style={s.page}>
      {/* Top banner ad — shown on every screen */}
      <AdBanner />
      <Header dateStr={dateStr} />

      {screen === "home" && (
        <HomeScreen
          category={category}
          stats={stats}
          onStart={startQuiz}
          loading={loading}
          error={error}
          onRetry={loadQuestions}
        />
      )}

      {screen === "quiz" && questions.length > 0 && (
        <QuizScreen
          questionIndex={currentQ}
          score={score}
          question={questions[currentQ]}
          onAnswer={handleAnswer}
          answered={answered}
          selectedIdx={selectedIdx}
          onNext={nextQuestion}
          total={questions.length}
        />
      )}

      {screen === "result" && (
        <ResultScreen
          score={score}
          results={results}
          today={today}
          total={questions.length}
          onHome={goHome}
        />
      )}

      <footer style={s.footer}>
        DailyMind &copy; {today.getFullYear()}
        &nbsp;&middot;&nbsp;
        Founded by <strong>Rojar Benny K</strong>
        &nbsp;&middot;&nbsp;
        Fresh questions every day.
      </footer>
    </div>
  );
}
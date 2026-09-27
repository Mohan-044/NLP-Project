import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const EMOTION_COLORS = {
  anger:    "#E24B4A",
  disgust:  "#854F0B",
  fear:     "#7F77DD",
  joy:      "#1D9E75",
  sadness:  "#378ADD",
  surprise: "#EF9F27",
  neutral:  "#888780",
};

const SAMPLE_RESULT = {
  emotions: {
    scores: { anger: 45.2, disgust: 13.6, fear: 15.6, joy: 12.3, sadness: 8.1, surprise: 5.2 },
    dominant: "anger",
  },
  writing_stats: {
    word_count: 245,
    sentence_count: 12,
    avg_sentence_length: 20.4,
    vocabulary_richness: 0.68,
    readability_score: 62.5,
    grade_level: 10.2,
  },
  personality: {
    openness: 65,
    conscientiousness: 78,
    extraversion: 42,
    agreeableness: 55,
    neuroticism: 70,
    communication_style: "Direct",
    tone: "Semi-formal",
    insights: [
      "Strong analytical thinking style",
      "High emotional sensitivity detected",
      "Prefers structured communication",
    ],
  },
};

// Dark theme tokens
const T = {
  bg:         "#0A0A0A",
  surface:    "#111111",
  card:       "#181818",
  border:     "#2A2A2A",
  borderHov:  "#3A3A3A",
  textPri:    "#F0F0EE",
  textSec:    "#888780",
  textMut:    "#555552",
  blue:       "#378ADD",
  blueDark:   "#185FA5",
  blueLight:  "#85B7EB",
};

function EmotionBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: T.textSec, textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color }}>{value}%</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: "#222", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: color,
            borderRadius: 4,
            transition: "width 0.9s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div
      style={{
        background: "#141414",
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: "16px 18px",
        flex: "1 1 120px",
        minWidth: 110,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 500, color: T.blue, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.textSec, marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function InsightChip({ text }) {
  return (
    <div
      style={{
        display: "inline-block",
        background: "#0D1F33",
        color: T.blueLight,
        border: `1px solid #1A3A5C`,
        borderRadius: 20,
        padding: "6px 14px",
        fontSize: 13,
        margin: "4px 6px 4px 0",
      }}
    >
      {text}
    </div>
  );
}

export default function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!text.trim()) {
      setError("Paste or type some text to analyze.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_text: text }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResult(data);
    } catch (err){
      console.error(err);
      setError("Failed to reach server. Make sure FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function useSample() {
    setText(
      "I cannot believe how incompetent this team is. Every deadline gets missed, nobody communicates, and management just ignores all our concerns. I have tried raising this multiple times but nothing ever changes. It is deeply frustrating."
    );
  }

  const emotionData = result
    ? Object.entries(result.emotions.scores).map(([label, value]) => ({ label, value }))
    : [];

  const personalityData = result
    ? [
        { trait: "Openness",  value: result.personality.openness },
        { trait: "Consc.",    value: result.personality.conscientiousness },
        { trait: "Extrav.",   value: result.personality.extraversion },
        { trait: "Agree.",    value: result.personality.agreeableness },
        { trait: "Neuro.",    value: result.personality.neuroticism },
      ]
    : [];

  const dominantColor = result
    ? EMOTION_COLORS[result.emotions.dominant] || T.blue
    : T.blue;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter','Segoe UI',sans-serif", color: T.textPri }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "18px 32px", display: "flex", alignItems: "center", gap: 12, background: T.surface }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "#0D1F33", border: `1px solid #1A3A5C`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          🧠
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: T.textPri }}>Emotion & Personality Analyzer</div>
          <div style={{ fontSize: 12, color: T.textSec }}>Powered by HuggingFace + Llama 3.1</div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

        {/* Input Section */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: T.textPri }}>Paste your text</label>
            <button
              onClick={useSample}
              style={{ fontSize: 12, color: T.blue, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
            >
              Use sample text
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste an email, journal entry, essay, or any text you want to analyze..."
            style={{
              width: "100%", minHeight: 140, borderRadius: 10,
              border: `1px solid ${T.border}`, padding: "12px 14px",
              fontSize: 14, lineHeight: 1.6, color: T.textPri,
              background: "#0E0E0E", resize: "vertical", outline: "none",
              boxSizing: "border-box", fontFamily: "inherit",
              caretColor: T.blue,
            }}
          />

          {error && <div style={{ color: "#E24B4A", fontSize: 13, marginTop: 8 }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <span style={{ fontSize: 12, color: T.textMut }}>
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              onClick={analyze}
              disabled={loading}
              style={{
                background: loading ? T.blueDark : T.blue,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 28px",
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                boxShadow: loading ? "none" : `0 0 16px ${T.blue}55`,
              }}
            >
              {loading ? "Analyzing…" : "Analyze text"}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Dominant Emotion Banner */}
            <div
              style={{
                borderRadius: 16,
                padding: "20px 24px",
                background: dominantColor + "18",
                border: `1px solid ${dominantColor}40`,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: dominantColor + "30", border: `1px solid ${dominantColor}60`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                {result.emotions.dominant === "joy"      ? "😄"
                : result.emotions.dominant === "anger"   ? "😠"
                : result.emotions.dominant === "sadness" ? "😢"
                : result.emotions.dominant === "fear"    ? "😨"
                : result.emotions.dominant === "surprise"? "😲"
                : result.emotions.dominant === "disgust" ? "😒"
                : "😐"}
              </div>
              <div>
                <div style={{ fontSize: 12, color: T.textSec, marginBottom: 2 }}>Dominant emotion detected</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: dominantColor, textTransform: "capitalize" }}>
                  {result.emotions.dominant}
                </div>
              </div>
            </div>

            {/* Emotions + Personality row */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

              {/* Emotion Breakdown */}
              <div style={{ flex: "1 1 320px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: T.textPri, marginBottom: 18 }}>Emotion breakdown</div>
                {emotionData
                  .sort((a, b) => b.value - a.value)
                  .map(({ label, value }) => (
                    <EmotionBar key={label} label={label} value={value} color={EMOTION_COLORS[label] || T.textSec} />
                  ))}
              </div>

              {/* Personality Radar */}
              <div style={{ flex: "1 1 280px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: T.textPri, marginBottom: 4 }}>Big Five personality</div>
                <div style={{ fontSize: 12, color: T.textSec, marginBottom: 12 }}>OCEAN model</div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={personalityData}>
                    <PolarGrid stroke="#2A2A2A" />
                    <PolarAngleAxis dataKey="trait" tick={{ fontSize: 12, fill: T.textSec }} />
                    <Radar name="Score" dataKey="value" stroke={T.blue} fill={T.blue} fillOpacity={0.15} strokeWidth={1.5} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, color: T.textPri }}
                      formatter={(v) => [`${v}%`, "Score"]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, background: "#0D1F33", color: T.blueLight, border: "1px solid #1A3A5C", borderRadius: 20, padding: "3px 10px" }}>
                    {result.personality.communication_style}
                  </span>
                  <span style={{ fontSize: 12, background: "#1A1200", color: "#EF9F27", border: "1px solid #3A2800", borderRadius: 20, padding: "3px 10px" }}>
                    {result.personality.tone}
                  </span>
                </div>
              </div>
            </div>

            {/* Writing Stats */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.textPri, marginBottom: 16 }}>Writing statistics</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <StatCard label="Words"         value={result.writing_stats.word_count} />
                <StatCard label="Sentences"     value={result.writing_stats.sentence_count} />
                <StatCard label="Avg sentence"  value={result.writing_stats.avg_sentence_length} sub="words per sentence" />
                <StatCard label="Vocab richness" value={`${Math.round(result.writing_stats.vocabulary_richness * 100)}%`} sub="unique word ratio" />
                <StatCard label="Readability"   value={result.writing_stats.readability_score} sub="Flesch score" />
                <StatCard label="Grade level"   value={`G${result.writing_stats.grade_level}`} sub="Flesch-Kincaid" />
              </div>
            </div>

            {/* Personality Bar Chart */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.textPri, marginBottom: 16 }}>Personality trait scores</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={personalityData} barSize={32}>
                  <XAxis dataKey="trait" tick={{ fontSize: 12, fill: T.textSec }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, color: T.textPri }}
                    formatter={(v) => [`${v}%`]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {personalityData.map((_, i) => (
                      <Cell key={i} fill={[T.blue, "#1D9E75", "#EF9F27", "#7F77DD", "#E24B4A"][i]} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Insights */}
            <div style={{ background: "#0A1520", border: "1px solid #1A3A5C", borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.blueLight, marginBottom: 12 }}>AI insights</div>
              <div>
                {result.personality.insights.map((insight, i) => (
                  <InsightChip key={i} text={insight} />
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setResult(null); setText(""); }}
              style={{
                alignSelf: "center",
                background: "none",
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "9px 24px",
                fontSize: 13,
                color: T.textSec,
                cursor: "pointer",
              }}
            >
              Analyze another text
            </button>

          </div>
        )}
      </div>
    </div>
  );
}

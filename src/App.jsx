import { useState, useEffect } from "react";

const DEFAULT_ARRAY = [0, 1, 0, 0, 1, 1, 0, 1, 1, 0];

function solve(arr) {
  const steps = [];
  const map = { 0: -1 };
  let sum = 0;
  let maxLen = 0;
  let bestStart = -1, bestEnd = -1;

  steps.push({
    phase: "init",
    description: "Replace every 0 with −1. Track a running sum. When the sum repeats, the subarray between those two points has equal 0s and 1s.",
    sum: 0,
    map: { ...map },
    i: -1,
    candidate: null,
    maxLen: 0,
    bestStart: -1,
    bestEnd: -1,
  });

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i] === 1 ? 1 : -1;
    sum += val;

    const prevStep = {
      phase: "scan",
      i,
      val,
      sum,
      map: { ...map },
      candidate: null,
      maxLen,
      bestStart,
      bestEnd,
      description: `i=${i}: value=${arr[i]} → mapped to ${val > 0 ? "+1" : "−1"}, running sum = ${sum}`,
    };

    if (map[sum] !== undefined) {
      const len = i - map[sum];
      prevStep.candidate = { start: map[sum] + 1, end: i, len };
      prevStep.description += `. Sum ${sum} seen before at index ${map[sum]}! Subarray [${map[sum]+1}..${i}] has length ${len}.`;
      if (len > maxLen) {
        maxLen = len;
        bestStart = map[sum] + 1;
        bestEnd = i;
        prevStep.description += " 🏆 New best!";
      }
    } else {
      map[sum] = i;
      prevStep.description += `. Sum ${sum} is new → store index ${i}.`;
    }

    prevStep.maxLen = maxLen;
    prevStep.bestStart = bestStart;
    prevStep.bestEnd = bestEnd;
    steps.push(prevStep);
  }

  steps.push({
    phase: "done",
    i: arr.length,
    sum,
    map: { ...map },
    candidate: null,
    maxLen,
    bestStart,
    bestEnd,
    description: `✅ Done! Longest subarray with equal 0s and 1s: indices [${bestStart}..${bestEnd}], length ${maxLen}.`,
  });

  return steps;
}

export default function App() {
  const [arr, setArr] = useState(DEFAULT_ARRAY);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [inputVal, setInputVal] = useState(DEFAULT_ARRAY.join(", "));

  useEffect(() => {
    const s = solve(arr);
    setSteps(s);
    setStepIdx(0);
    setPlaying(false);
  }, [arr]);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStepIdx(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [playing, stepIdx, steps]);

  const step = steps[stepIdx] || steps[0];
  if (!step) return null;

  const handleInput = () => {
    const nums = inputVal.split(/[\s,]+/).map(Number).filter(n => n === 0 || n === 1);
    if (nums.length > 0) setArr(nums);
  };

  const prefixMapped = arr.map(v => v === 1 ? "+1" : "−1");

  const runSums = [];
  let rs = 0;
  for (let i = 0; i < arr.length; i++) {
    rs += arr[i] === 1 ? 1 : -1;
    runSums.push(rs);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e4d9",
      fontFamily: "'Courier New', monospace",
      padding: "32px 24px",
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideIn { from{transform:translateY(-8px);opacity:0} to{transform:translateY(0);opacity:1} }
        .cell { transition: all 0.3s ease; }
        .btn { cursor:pointer; border:none; font-family:inherit; transition: all 0.15s; }
        .btn:hover { transform:translateY(-1px); }
        .btn:active { transform:translateY(0); }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#5a5a6a", marginBottom: 8, textTransform: "uppercase" }}>Algorithm Visualizer</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "#f0ebe0", letterSpacing: -1 }}>
          Longest Subarray: Equal 0s & 1s
        </h1>
        <p style={{ color: "#6a6a7a", fontSize: 13, marginTop: 8 }}>
          Prefix sum trick — O(n) time, O(n) space
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="0, 1, 0, 1, ..."
          style={{
            background: "#14141e", border: "1px solid #2a2a3a", color: "#e8e4d9",
            padding: "8px 14px", borderRadius: 6, fontFamily: "inherit", fontSize: 14, width: 280,
          }}
        />
        <button className="btn" onClick={handleInput} style={{
          background: "#2a2aff", color: "#fff", padding: "8px 18px", borderRadius: 6, fontSize: 13,
        }}>Load Array</button>
        <button className="btn" onClick={() => {
          const rand = Array.from({length: 10}, () => Math.round(Math.random()));
          setArr(rand); setInputVal(rand.join(", "));
        }} style={{ background: "#1a1a2e", color: "#8888bb", padding: "8px 14px", borderRadius: 6, border: "1px solid #2a2a3a", fontSize: 13 }}>
          Random
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {arr.map((v, i) => {
          const isActive = step.i === i;
          const inBest = step.bestStart <= i && i <= step.bestEnd && step.bestStart >= 0;
          const inCandidate = step.candidate && step.candidate.start <= i && i <= step.candidate.end;
          let bg = "#1a1a28";
          if (inBest) bg = "#1a3a1a";
          if (inCandidate) bg = "#2a2a0a";
          if (isActive) bg = "#2a1a4a";
          return (
            <div key={i} className="cell" style={{
              width: 52, textAlign: "center",
              border: isActive ? "2px solid #8888ff" : inBest ? "2px solid #44cc44" : inCandidate ? "2px solid #aaaa22" : "2px solid #222230",
              borderRadius: 8, padding: "6px 0", background: bg,
            }}>
              <div style={{ fontSize: 9, color: "#444455", marginBottom: 2 }}>i={i}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: v === 1 ? "#7ab8f5" : "#f5a07a" }}>{v}</div>
              <div style={{ fontSize: 11, color: "#555566", marginTop: 2 }}>{prefixMapped[i]}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        {runSums.map((s, i) => {
          const shown = step.i > i || (step.phase === "done");
          const isActive = step.i === i;
          return (
            <div key={i} style={{ width: 52, textAlign: "center" }}>
              {shown ? (
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: s > 0 ? "#7ab8f5" : s < 0 ? "#f5a07a" : "#88cc88",
                  opacity: isActive ? 1 : 0.5,
                  animation: isActive ? "pulse 0.8s ease" : "none",
                }}>
                  {s > 0 ? `+${s}` : s}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#2a2a3a" }}>·</div>
              )}
            </div>
          );
        })}
        <div style={{ width: "100%", textAlign: "center", fontSize: 10, color: "#444455", marginTop: 2 }}>running prefix sum</div>
      </div>

      <div style={{
        maxWidth: 680, margin: "0 auto 28px",
        background: "#12121c", border: "1px solid #222232", borderRadius: 10,
        padding: "16px 20px", animation: "slideIn 0.3s ease",
        minHeight: 52,
      }}>
        <span style={{ fontSize: 14, lineHeight: 1.6, color: "#c8c4b4" }}>{step?.description}</span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto 28px" }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#444455", marginBottom: 10, textTransform: "uppercase" }}>Hashmap: sum → first index seen</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(step.map).map(([k, v]) => (
            <div key={k} style={{
              background: "#14141e", border: "1px solid #2a2a3a", borderRadius: 6,
              padding: "5px 10px", fontSize: 12,
            }}>
              <span style={{ color: "#8888bb" }}>{k >= 0 ? `+${k}` : k}</span>
              <span style={{ color: "#333343" }}> → </span>
              <span style={{ color: "#e8c87a" }}>idx {v}</span>
            </div>
          ))}
        </div>
      </div>

      {step.bestStart >= 0 && (
        <div style={{
          maxWidth: 680, margin: "0 auto 28px",
          background: "#0a1f0a", border: "1px solid #1a4a1a", borderRadius: 10,
          padding: "12px 20px", display: "flex", alignItems: "center", gap: 16,
        }}>
          <span style={{ fontSize: 20 }}>🏆</span>
          <div>
            <div style={{ fontSize: 12, color: "#44aa44", marginBottom: 2 }}>Best so far</div>
            <div style={{ fontSize: 14, color: "#88dd88" }}>
              Indices [{step.bestStart} .. {step.bestEnd}] →{" "}
              <strong style={{ color: "#aaffaa" }}>[{arr.slice(step.bestStart, step.bestEnd + 1).join(", ")}]</strong>{" "}
              <span style={{ color: "#44aa44" }}>length {step.maxLen}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button className="btn" onClick={() => { setPlaying(false); setStepIdx(0); }} style={{
          background: "#1a1a2e", color: "#8888bb", padding: "9px 16px", borderRadius: 6, border: "1px solid #2a2a3a", fontSize: 13,
        }}>⏮ Reset</button>
        <button className="btn" onClick={() => setStepIdx(s => Math.max(0, s - 1))} style={{
          background: "#1a1a2e", color: "#8888bb", padding: "9px 16px", borderRadius: 6, border: "1px solid #2a2a3a", fontSize: 13,
        }}>← Prev</button>
        <button className="btn" onClick={() => setPlaying(p => !p)} style={{
          background: playing ? "#4a1a1a" : "#2a2aff", color: "#fff",
          padding: "9px 22px", borderRadius: 6, fontSize: 13, minWidth: 90,
        }}>{playing ? "⏸ Pause" : "▶ Play"}</button>
        <button className="btn" onClick={() => setStepIdx(s => Math.min(steps.length - 1, s + 1))} style={{
          background: "#1a1a2e", color: "#8888bb", padding: "9px 16px", borderRadius: 6, border: "1px solid #2a2a3a", fontSize: 13,
        }}>Next →</button>
        <button className="btn" onClick={() => { setPlaying(false); setStepIdx(steps.length - 1); }} style={{
          background: "#1a1a2e", color: "#8888bb", padding: "9px 16px", borderRadius: 6, border: "1px solid #2a2a3a", fontSize: 13,
        }}>⏭ End</button>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "#333343" }}>
        Step {stepIdx + 1} / {steps.length}
        <div style={{ width: 200, height: 2, background: "#1a1a2a", borderRadius: 2, margin: "8px auto 0" }}>
          <div style={{ width: `${((stepIdx + 1) / steps.length) * 100}%`, height: "100%", background: "#2a2aff", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{
        maxWidth: 680, margin: "32px auto 0",
        background: "#0f0f1a", border: "1px solid #1e1e30", borderRadius: 10, padding: "16px 20px",
      }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#333343", marginBottom: 10, textTransform: "uppercase" }}>Key Insight</div>
        <div style={{ fontSize: 13, color: "#7a7a8a", lineHeight: 1.7 }}>
          Map each <span style={{ color: "#f5a07a" }}>0 → −1</span> and <span style={{ color: "#7ab8f5" }}>1 → +1</span>.
          Compute prefix sums. If the same sum appears at two indices <em>j</em> and <em>i</em>,
          then the subarray between them sums to 0 — meaning equal counts of 0s and 1s.
          We store the <em>first</em> occurrence of each sum in a hashmap to maximize length.
        </div>
      </div>
    </div>
  );
}

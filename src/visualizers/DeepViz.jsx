import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

const DEFAULT_ARRAY = [0, 1, 0, 0, 1, 1, 0, 1, 1, 0];

const PYTHON_CODE = [
  { text: "def longest_equal_subarray(nums):", phase: null },
  { text: '    """Find longest subarray with equal 0s and 1s"""', phase: null },
  { text: "    prefix_map = {0: -1}  # sum → first index seen", phase: "init" },
  { text: "    running_sum = 0", phase: "init" },
  { text: "    best_len, best_start, best_end = 0, -1, -1", phase: "init" },
  { text: "", phase: null },
  { text: "    for i, val in enumerate(nums):", phase: "loop" },
  { text: "        # Map 0 → -1, 1 → +1", phase: "sum" },
  { text: "        running_sum += 1 if val == 1 else -1", phase: "sum" },
  { text: "", phase: null },
  { text: "        if running_sum in prefix_map:", phase: "hit" },
  { text: "            # Found repeated sum! Subarray between them = 0", phase: "hit" },
  { text: "            length = i - prefix_map[running_sum]", phase: "hit" },
  { text: "            if length > best_len:", phase: "update" },
  { text: "                best_len = length", phase: "update" },
  { text: "                best_start = prefix_map[running_sum] + 1", phase: "update" },
  { text: "                best_end = i", phase: "update" },
  { text: "        else:", phase: "miss" },
  { text: "            # First time: store this index", phase: "miss" },
  { text: "            prefix_map[running_sum] = i", phase: "miss" },
  { text: "", phase: null },
  { text: "    return nums[best_start : best_end + 1], best_len", phase: "done" },
];

function solve(arr) {
  const steps = [];
  const map = { 0: -1 };
  let sum = 0, maxLen = 0, bestStart = -1, bestEnd = -1;

  steps.push({ phase: "init", codePhase: "init", i: -1, sum: 0, map: { ...map }, candidate: null, maxLen: 0, bestStart: -1, bestEnd: -1, isNewBest: false,
    title: "Initialization", desc: "Set up prefix_map with sum=0 at index −1 (sentinel). This handles subarrays that start at index 0.", insight: "Trick: map 0→−1, 1→+1. A subarray with equal 0s and 1s has a net sum of 0." });

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i] === 1 ? 1 : -1;

    steps.push({ phase: "loop", codePhase: "loop", i, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
      title: `Visit index ${i}`, desc: `Now at index i=${i}, value=${arr[i]}. About to update the running sum.`, insight: `We process each element exactly once → O(n) time.` });

    sum += val;
    steps.push({ phase: "sum", codePhase: "sum", i, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
      title: `Update running sum`, desc: `arr[${i}]=${arr[i]} maps to ${val>0?"+1":"−1"}. Running sum: ${sum-val} + ${val>0?"+1":"−1"} = ${sum}`, insight: `Running sum encodes "balance": positive means more 1s so far, negative means more 0s.` });

    if (map[sum] !== undefined) {
      const len = i - map[sum];
      const candidate = { start: map[sum] + 1, end: i, len };
      steps.push({ phase: "hit", codePhase: "hit", i, sum, map: { ...map }, candidate, maxLen, bestStart, bestEnd, isNewBest: false,
        title: `Sum ${sum} seen before!`, desc: `Sum ${sum} was first seen at index ${map[sum]}. Subarray [${map[sum]+1}..${i}] has length ${len}.`, insight: `Same prefix sum at two points → the segment between them sums to 0 → equal 0s and 1s! 🎯` });

      if (len > maxLen) {
        maxLen = len; bestStart = map[sum] + 1; bestEnd = i;
        steps.push({ phase: "update", codePhase: "update", i, sum, map: { ...map }, candidate, maxLen, bestStart, bestEnd, isNewBest: true,
          title: `🏆 New best length: ${maxLen}`, desc: `Length ${len} is the new best. Answer updated to [${bestStart}..${bestEnd}].`, insight: `Subarray: [${arr.slice(bestStart,bestEnd+1).join(", ")}] — zeros: ${arr.slice(bestStart,bestEnd+1).filter(x=>x===0).length}, ones: ${arr.slice(bestStart,bestEnd+1).filter(x=>x===1).length} ✓` });
      }
    } else {
      map[sum] = i;
      steps.push({ phase: "miss", codePhase: "miss", i, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
        title: `New sum ${sum} → store index ${i}`, desc: `Sum ${sum} hasn't been seen before. Record index ${i} as the first time this sum occurred.`, insight: `We store only the FIRST occurrence to maximize subarray length when this sum appears again.` });
    }
  }

  steps.push({ phase: "done", codePhase: "done", i: arr.length, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
    title: "Complete!", desc: `Longest subarray with equal 0s & 1s: indices [${bestStart}..${bestEnd}], length = ${maxLen}.`, insight: `Result: [${arr.slice(bestStart,bestEnd+1).join(", ")}]` });

  return steps;
}

const COLORS = { init:"#94a3b8", loop:"#818cf8", sum:"#fbbf24", hit:"#34d399", update:"#10b981", miss:"#f87171", done:"#10b981" };

function SyntaxLine({ text, lit }) {
  if (!text) return <span>&nbsp;</span>;
  const base = lit ? "#c9d1e3" : "#2d3f60";
  const kw = lit ? "#c084fc" : "#1e2740";
  const str = lit ? "#86efac" : "#1a2e22";
  const com = lit ? "#4a6a7a" : "#1a2530";
  const num = lit ? "#fbbf24" : "#2a2010";
  const keywords = new Set(["def","return","for","if","else","in","and","or","not","True","False","None","elif","while","import","from","as","class","with","pass","break","continue","yield","lambda","try","except","finally","raise","del","global","nonlocal","assert"]);
  const tokens = text.split(/(\s+|[()[\]{},:#=<>+\-*/%!]|"[^"]*"|'[^']*'|#.*$|\b(?:def|return|for|if|else|in|and|or|not|True|False|None|elif|while|import|from|as|class|with|pass|break|continue|yield|lambda|try|except|finally|raise|del|global|nonlocal|assert)\b|\b\d+\b)/);
  return (
    <span>
      {tokens.map((tok, i) => {
        if (keywords.has(tok)) return <span key={i} style={{ color: kw }}>{tok}</span>;
        if (/^["']/.test(tok)) return <span key={i} style={{ color: str }}>{tok}</span>;
        if (/^#/.test(tok)) return <span key={i} style={{ color: com }}>{tok}</span>;
        if (/^\d+$/.test(tok)) return <span key={i} style={{ color: num }}>{tok}</span>;
        return <span key={i} style={{ color: base }}>{tok}</span>;
      })}
    </span>
  );
}

export default function DeepViz() {
  const [arr, setArr] = useState(DEFAULT_ARRAY);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [inputVal, setInputVal] = useState(DEFAULT_ARRAY.join(", "));

  useEffect(() => { setSteps(solve(arr)); setStepIdx(0); setPlaying(false); }, [arr]);
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStepIdx(s => s + 1), speed);
    return () => clearTimeout(t);
  }, [playing, stepIdx, steps, speed]);

  const step = steps[stepIdx];
  if (!step) return null;

  const color = COLORS[step.phase] || "#818cf8";

  const graphData = [{ label: "·", sum: 0 }];
  let rs = 0;
  for (let i = 0; i < arr.length; i++) {
    rs += arr[i] === 1 ? 1 : -1;
    graphData.push({ label: `${i}`, sum: rs, i });
  }
  const visibleData = graphData.slice(0, step.i >= 0 ? step.i + 2 : 1);
  const minY = Math.min(...graphData.map(d => d.sum), 0) - 0.5;
  const maxY = Math.max(...graphData.map(d => d.sum), 0) + 0.5;

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", background: "#080c14", color: "#c9d1e3", fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace", fontSize: 13 }}>
      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:#0d1117;}
        ::-webkit-scrollbar-thumb{background:#1e2740;border-radius:4px;}
        @keyframes dv-fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .dv-cel{transition:all .25s cubic-bezier(.4,0,.2,1);}
        .dv-btn{cursor:pointer;border:none;font-family:inherit;transition:all .15s;}
        .dv-btn:hover{filter:brightness(1.2);}
      `}</style>

      {/* Input bar */}
      <div style={{ background: "#0a0d14", borderBottom: "1px solid #1a2035", padding: "10px 20px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "#2d3f60", letterSpacing: 2 }}>ARRAY:</span>
        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && (() => { const n = inputVal.split(/[\s,]+/).map(Number).filter(x=>x===0||x===1); if(n.length>=2) setArr(n); })()}
          placeholder="0, 1, 0, 1, ..."
          style={{ background: "#0d1117", border: "1px solid #1a2740", color: "#c9d1e3", padding: "5px 10px", borderRadius: 5, fontFamily: "inherit", fontSize: 12, width: 180 }} />
        <button className="dv-btn" onClick={() => { const n = inputVal.split(/[\s,]+/).map(Number).filter(x=>x===0||x===1); if(n.length>=2) setArr(n); }}
          style={{ background: "#1d4ed8", color: "#fff", padding: "5px 12px", borderRadius: 5, fontSize: 11 }}>Load</button>
        <button className="dv-btn" onClick={() => { const r = Array.from({length:10},()=>Math.round(Math.random())); setArr(r); setInputVal(r.join(", ")); }}
          style={{ background: "#131e30", color: "#6c7fa5", padding: "5px 10px", borderRadius: 5, border: "1px solid #1a2740", fontSize: 11 }}>Random</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "calc(100vh - 44px - 47px)" }}>

        {/* LEFT */}
        <div style={{ borderRight: "1px solid #1a2035", overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Array cells */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #1a2035" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#2d3f60", marginBottom: 10, textTransform: "uppercase" }}>Input Array</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {arr.map((v, i) => {
                const isActive = step.i === i;
                const inBest = step.bestStart >= 0 && i >= step.bestStart && i <= step.bestEnd;
                const inCand = step.candidate && i >= step.candidate.start && i <= step.candidate.end;
                let bc = "#1a2035", bg = "#0a0f1a";
                if (isActive) { bc = color; bg = "#121a2a"; }
                else if (inBest) { bc = "#10b981"; bg = "#071812"; }
                else if (inCand) { bc = "#fbbf24"; bg = "#181208"; }
                return (
                  <div key={i} className="dv-cel" style={{ width: 48, border: `2px solid ${bc}`, borderRadius: 8, background: bg, overflow: "hidden", boxShadow: isActive ? `0 0 14px ${color}33` : "none" }}>
                    <div style={{ fontSize: 8, color: "#2d3f60", textAlign: "center", paddingTop: 4 }}>i={i}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, textAlign: "center", color: v===1?"#60a5fa":"#fb923c", fontFamily: "'Syne',sans-serif", lineHeight: 1.1 }}>{v}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, textAlign: "center", paddingBottom: 4, color: v===1?"#3b82f6":"#f97316" }}>{v===1?"+1":"−1"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph */}
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #1a2035" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#2d3f60", marginBottom: 4, textTransform: "uppercase" }}>
              Prefix Sum Graph <span style={{ fontSize: 8, color: "#1a2740", letterSpacing: 1, marginLeft: 8 }}>← same Y = equal 0s & 1s between those points</span>
            </div>
            <ResponsiveContainer width="100%" height={165}>
              <AreaChart data={visibleData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="dv-g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#111828" />
                <XAxis dataKey="label" tick={{ fill: "#2d3f60", fontSize: 9 }} />
                <YAxis domain={[minY, maxY]} tick={{ fill: "#2d3f60", fontSize: 9 }} />
                <ReferenceLine y={0} stroke="#1e2e50" strokeDasharray="5 3" strokeWidth={1.5} />
                {step.bestStart >= 0 && <ReferenceLine x={String(step.bestStart)} stroke="#10b98155" strokeDasharray="4 2" />}
                {step.bestEnd >= 0 && <ReferenceLine x={String(step.bestEnd)} stroke="#10b98155" strokeDasharray="4 2" />}
                <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid #1a2035", borderRadius: 6, fontSize: 11 }} labelStyle={{ color: "#6c7fa5" }} formatter={(v) => [v, "sum"]} />
                <Area type="monotone" dataKey="sum" stroke="#6366f1" strokeWidth={2.5} fill="url(#dv-g1)"
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const isAct = payload.i === step.i;
                    const inB = step.bestStart >= 0 && payload.i !== undefined && payload.i >= step.bestStart - 1 && payload.i <= step.bestEnd;
                    const r = isAct ? 7 : inB ? 5 : 3;
                    const fill = isAct ? color : inB ? "#10b981" : "#6366f1";
                    return <circle key={payload.label} cx={cx} cy={cy} r={r} fill={fill} stroke="#080b14" strokeWidth={2} />;
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

const DEFAULT_ARRAY = [0, 1, 0, 0, 1, 1, 0, 1, 1, 0];

const PYTHON_CODE = [
  { text: "def longest_equal_subarray(nums):", phase: null },
  { text: '    """Find longest subarray with equal 0s and 1s"""', phase: null },
  { text: "    prefix_map = {0: -1}  # sum → first index seen", phase: "init" },
  { text: "    running_sum = 0", phase: "init" },
  { text: "    best_len, best_start, best_end = 0, -1, -1", phase: "init" },
  { text: "", phase: null },
  { text: "    for i, val in enumerate(nums):", phase: "loop" },
  { text: "        # Map 0 → -1, 1 → +1", phase: "sum" },
  { text: "        running_sum += 1 if val == 1 else -1", phase: "sum" },
  { text: "", phase: null },
  { text: "        if running_sum in prefix_map:", phase: "hit" },
  { text: "            # Found repeated sum! Subarray between them = 0", phase: "hit" },
  { text: "            length = i - prefix_map[running_sum]", phase: "hit" },
  { text: "            if length > best_len:", phase: "update" },
  { text: "                best_len = length", phase: "update" },
  { text: "                best_start = prefix_map[running_sum] + 1", phase: "update" },
  { text: "                best_end = i", phase: "update" },
  { text: "        else:", phase: "miss" },
  { text: "            # First time: store this index", phase: "miss" },
  { text: "            prefix_map[running_sum] = i", phase: "miss" },
  { text: "", phase: null },
  { text: "    return nums[best_start : best_end + 1], best_len", phase: "done" },
];

function solve(arr) {
  const steps = [];
  const map = { 0: -1 };
  let sum = 0, maxLen = 0, bestStart = -1, bestEnd = -1;

  steps.push({ phase: "init", codePhase: "init", i: -1, sum: 0, map: { ...map }, candidate: null, maxLen: 0, bestStart: -1, bestEnd: -1, isNewBest: false,
    title: "Initialization", desc: "Set up prefix_map with sum=0 at index −1 (sentinel). This handles subarrays that start at index 0.", insight: "Trick: map 0→−1, 1→+1. A subarray with equal 0s and 1s has a net sum of 0." });

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i] === 1 ? 1 : -1;

    steps.push({ phase: "loop", codePhase: "loop", i, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
      title: `Visit index ${i}`, desc: `Now at index i=${i}, value=${arr[i]}. About to update the running sum.`, insight: `We process each element exactly once → O(n) time.` });

    sum += val;
    steps.push({ phase: "sum", codePhase: "sum", i, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
      title: `Update running sum`, desc: `arr[${i}]=${arr[i]} maps to ${val>0?"+1":"−1"}. Running sum: ${sum-val} + ${val>0?"+1":"−1"} = ${sum}`, insight: `Running sum encodes "balance": positive means more 1s so far, negative means more 0s.` });

    if (map[sum] !== undefined) {
      const len = i - map[sum];
      const candidate = { start: map[sum] + 1, end: i, len };
      steps.push({ phase: "hit", codePhase: "hit", i, sum, map: { ...map }, candidate, maxLen, bestStart, bestEnd, isNewBest: false,
        title: `Sum ${sum} seen before!`, desc: `Sum ${sum} was first seen at index ${map[sum]}. Subarray [${map[sum]+1}..${i}] has length ${len}.`, insight: `Same prefix sum at two points → the segment between them sums to 0 → equal 0s and 1s! 🎯` });

      if (len > maxLen) {
        maxLen = len; bestStart = map[sum] + 1; bestEnd = i;
        steps.push({ phase: "update", codePhase: "update", i, sum, map: { ...map }, candidate, maxLen, bestStart, bestEnd, isNewBest: true,
          title: `🏆 New best length: ${maxLen}`, desc: `Length ${len} is the new best. Answer updated to [${bestStart}..${bestEnd}].`, insight: `Subarray: [${arr.slice(bestStart,bestEnd+1).join(", ")}] — zeros: ${arr.slice(bestStart,bestEnd+1).filter(x=>x===0).length}, ones: ${arr.slice(bestStart,bestEnd+1).filter(x=>x===1).length} ✓` });
      }
    } else {
      map[sum] = i;
      steps.push({ phase: "miss", codePhase: "miss", i, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
        title: `New sum ${sum} → store index ${i}`, desc: `Sum ${sum} hasn't been seen before. Record index ${i} as the first time this sum occurred.`, insight: `We store only the FIRST occurrence to maximize subarray length when this sum appears again.` });
    }
  }

  steps.push({ phase: "done", codePhase: "done", i: arr.length, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
    title: "Complete!", desc: `Longest subarray with equal 0s & 1s: indices [${bestStart}..${bestEnd}], length = ${maxLen}.`, insight: `Result: [${arr.slice(bestStart,bestEnd+1).join(", ")}]` });

  return steps;
}

const COLORS = { init:"#94a3b8", loop:"#818cf8", sum:"#fbbf24", hit:"#34d399", update:"#10b981", miss:"#f87171", done:"#10b981" };

function SyntaxLine({ text, lit }) {
  if (!text) return <span>&nbsp;</span>;
  const base = lit ? "#c9d1e3" : "#2d3f60";
  const kw = lit ? "#c084fc" : "#1e2740";
  const str = lit ? "#86efac" : "#1a2e22";
  const com = lit ? "#4a6a7a" : "#1a2530";
  const num = lit ? "#fbbf24" : "#2a2010";
  const keywords = new Set(["def","return","for","if","else","in","and","or","not","True","False","None","elif","while","import","from","as","class","with","pass","break","continue","yield","lambda","try","except","finally","raise","del","global","nonlocal","assert"]);
  const tokens = text.split(/(\s+|[()[\]{},:#=<>+\-*/%!]|"[^"]*"|'[^']*'|#.*$|\b(?:def|return|for|if|else|in|and|or|not|True|False|None|elif|while|import|from|as|class|with|pass|break|continue|yield|lambda|try|except|finally|raise|del|global|nonlocal|assert)\b|\b\d+\b)/);
  return (
    <span>
      {tokens.map((tok, i) => {
        if (keywords.has(tok)) return <span key={i} style={{ color: kw }}>{tok}</span>;
        if (/^["']/.test(tok)) return <span key={i} style={{ color: str }}>{tok}</span>;
        if (/^#/.test(tok)) return <span key={i} style={{ color: com }}>{tok}</span>;
        if (/^\d+$/.test(tok)) return <span key={i} style={{ color: num }}>{tok}</span>;
        return <span key={i} style={{ color: base }}>{tok}</span>;
      })}
    </span>
  );
}

export default function DeepViz() {
  const [arr, setArr] = useState(DEFAULT_ARRAY);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [inputVal, setInputVal] = useState(DEFAULT_ARRAY.join(", "));

  useEffect(() => { setSteps(solve(arr)); setStepIdx(0); setPlaying(false); }, [arr]);
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStepIdx(s => s + 1), speed);
    return () => clearTimeout(t);
  }, [playing, stepIdx, steps, speed]);

  const step = steps[stepIdx];
  if (!step) return null;

  const color = COLORS[step.phase] || "#818cf8";

  const graphData = [{ label: "·", sum: 0 }];
  let rs = 0;
  for (let i = 0; i < arr.length; i++) {
    rs += arr[i] === 1 ? 1 : -1;
    graphData.push({ label: `${i}`, sum: rs, i });
  }
  const visibleData = graphData.slice(0, step.i >= 0 ? step.i + 2 : 1);
  const minY = Math.min(...graphData.map(d => d.sum), 0) - 0.5;
  const maxY = Math.max(...graphData.map(d => d.sum), 0) + 0.5;

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", background: "#080c14", color: "#c9d1e3", fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace", fontSize: 13 }}>
      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:#0d1117;}
        ::-webkit-scrollbar-thumb{background:#1e2740;border-radius:4px;}
        @keyframes dv-fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .dv-cel{transition:all .25s cubic-bezier(.4,0,.2,1);}
        .dv-btn{cursor:pointer;border:none;font-family:inherit;transition:all .15s;}
        .dv-btn:hover{filter:brightness(1.2);}
      `}</style>

      {/* Input bar */}
      <div style={{ background: "#0a0d14", borderBottom: "1px solid #1a2035", padding: "10px 20px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "#2d3f60", letterSpacing: 2 }}>ARRAY:</span>
        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && (() => { const n = inputVal.split(/[\s,]+/).map(Number).filter(x=>x===0||x===1); if(n.length>=2) setArr(n); })()}
          placeholder="0, 1, 0, 1, ..."
          style={{ background: "#0d1117", border: "1px solid #1a2740", color: "#c9d1e3", padding: "5px 10px", borderRadius: 5, fontFamily: "inherit", fontSize: 12, width: 180 }} />
        <button className="dv-btn" onClick={() => { const n = inputVal.split(/[\s,]+/).map(Number).filter(x=>x===0||x===1); if(n.length>=2) setArr(n); }}
          style={{ background: "#1d4ed8", color: "#fff", padding: "5px 12px", borderRadius: 5, fontSize: 11 }}>Load</button>
        <button className="dv-btn" onClick={() => { const r = Array.from({length:10},()=>Math.round(Math.random())); setArr(r); setInputVal(r.join(", ")); }}
          style={{ background: "#131e30", color: "#6c7fa5", padding: "5px 10px", borderRadius: 5, border: "1px solid #1a2740", fontSize: 11 }}>Random</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "calc(100vh - 44px - 47px)" }}>

        {/* LEFT */}
        <div style={{ borderRight: "1px solid #1a2035", overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Array cells */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #1a2035" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#2d3f60", marginBottom: 10, textTransform: "uppercase" }}>Input Array</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {arr.map((v, i) => {
                const isActive = step.i === i;
                const inBest = step.bestStart >= 0 && i >= step.bestStart && i <= step.bestEnd;
                const inCand = step.candidate && i >= step.candidate.start && i <= step.candidate.end;
                let bc = "#1a2035", bg = "#0a0f1a";
                if (isActive) { bc = color; bg = "#121a2a"; }
                else if (inBest) { bc = "#10b981"; bg = "#071812"; }
                else if (inCand) { bc = "#fbbf24"; bg = "#181208"; }
                return (
                  <div key={i} className="dv-cel" style={{ width: 48, border: `2px solid ${bc}`, borderRadius: 8, background: bg, overflow: "hidden", boxShadow: isActive ? `0 0 14px ${color}33` : "none" }}>
                    <div style={{ fontSize: 8, color: "#2d3f60", textAlign: "center", paddingTop: 4 }}>i={i}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, textAlign: "center", color: v===1?"#60a5fa":"#fb923c", fontFamily: "'Syne',sans-serif", lineHeight: 1.1 }}>{v}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, textAlign: "center", paddingBottom: 4, color: v===1?"#3b82f6":"#f97316" }}>{v===1?"+1":"−1"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph */}
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

const DEFAULT_ARRAY = [0, 1, 0, 0, 1, 1, 0, 1, 1, 0];

const PYTHON_CODE = [
  { text: "def longest_equal_subarray(nums):", phase: null },
  { text: '    """Find longest subarray with equal 0s and 1s"""', phase: null },
  { text: "    prefix_map = {0: -1}  # sum → first index seen", phase: "init" },
  { text: "    running_sum = 0", phase: "init" },
  { text: "    best_len, best_start, best_end = 0, -1, -1", phase: "init" },
  { text: "", phase: null },
  { text: "    for i, val in enumerate(nums):", phase: "loop" },
  { text: "        # Map 0 → -1, 1 → +1", phase: "sum" },
  { text: "        running_sum += 1 if val == 1 else -1", phase: "sum" },
  { text: "", phase: null },
  { text: "        if running_sum in prefix_map:", phase: "hit" },
  { text: "            # Found repeated sum! Subarray between them = 0", phase: "hit" },
  { text: "            length = i - prefix_map[running_sum]", phase: "hit" },
  { text: "            if length > best_len:", phase: "update" },
  { text: "                best_len = length", phase: "update" },
  { text: "                best_start = prefix_map[running_sum] + 1", phase: "update" },
  { text: "                best_end = i", phase: "update" },
  { text: "        else:", phase: "miss" },
  { text: "            # First time: store this index", phase: "miss" },
  { text: "            prefix_map[running_sum] = i", phase: "miss" },
  { text: "", phase: null },
  { text: "    return nums[best_start : best_end + 1], best_len", phase: "done" },
];

function solve(arr) {
  const steps = [];
  const map = { 0: -1 };
  let sum = 0, maxLen = 0, bestStart = -1, bestEnd = -1;

  steps.push({ phase: "init", codePhase: "init", i: -1, sum: 0, map: { ...map }, candidate: null, maxLen: 0, bestStart: -1, bestEnd: -1, isNewBest: false,
    title: "Initialization", desc: "Set up prefix_map with sum=0 at index −1 (sentinel). This handles subarrays that start at index 0.", insight: "Trick: map 0→−1, 1→+1. A subarray with equal 0s and 1s has a net sum of 0." });

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i] === 1 ? 1 : -1;

    steps.push({ phase: "loop", codePhase: "loop", i, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
      title: `Visit index ${i}`, desc: `Now at index i=${i}, value=${arr[i]}. About to update the running sum.`, insight: `We process each element exactly once → O(n) time.` });

    sum += val;
    steps.push({ phase: "sum", codePhase: "sum", i, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
      title: `Update running sum`, desc: `arr[${i}]=${arr[i]} maps to ${val>0?"+1":"−1"}. Running sum: ${sum-val} + ${val>0?"+1":"−1"} = ${sum}`, insight: `Running sum encodes "balance": positive means more 1s so far, negative means more 0s.` });

    if (map[sum] !== undefined) {
      const len = i - map[sum];
      const candidate = { start: map[sum] + 1, end: i, len };
      steps.push({ phase: "hit", codePhase: "hit", i, sum, map: { ...map }, candidate, maxLen, bestStart, bestEnd, isNewBest: false,
        title: `Sum ${sum} seen before!`, desc: `Sum ${sum} was first seen at index ${map[sum]}. Subarray [${map[sum]+1}..${i}] has length ${len}.`, insight: `Same prefix sum at two points → the segment between them sums to 0 → equal 0s and 1s! 🎯` });

      if (len > maxLen) {
        maxLen = len; bestStart = map[sum] + 1; bestEnd = i;
        steps.push({ phase: "update", codePhase: "update", i, sum, map: { ...map }, candidate, maxLen, bestStart, bestEnd, isNewBest: true,
          title: `🏆 New best length: ${maxLen}`, desc: `Length ${len} is the new best. Answer updated to [${bestStart}..${bestEnd}].`, insight: `Subarray: [${arr.slice(bestStart,bestEnd+1).join(", ")}] — zeros: ${arr.slice(bestStart,bestEnd+1).filter(x=>x===0).length}, ones: ${arr.slice(bestStart,bestEnd+1).filter(x=>x===1).length} ✓` });
      }
    } else {
      map[sum] = i;
      steps.push({ phase: "miss", codePhase: "miss", i, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
        title: `New sum ${sum} → store index ${i}`, desc: `Sum ${sum} hasn't been seen before. Record index ${i} as the first time this sum occurred.`, insight: `We store only the FIRST occurrence to maximize subarray length when this sum appears again.` });
    }
  }

  steps.push({ phase: "done", codePhase: "done", i: arr.length, sum, map: { ...map }, candidate: null, maxLen, bestStart, bestEnd, isNewBest: false,
    title: "Complete!", desc: `Longest subarray with equal 0s & 1s: indices [${bestStart}..${bestEnd}], length = ${maxLen}.`, insight: `Result: [${arr.slice(bestStart,bestEnd+1).join(", ")}]` });

  return steps;
}

const COLORS = { init:"#94a3b8", loop:"#818cf8", sum:"#fbbf24", hit:"#34d399", update:"#10b981", miss:"#f87171", done:"#10b981" };

function SyntaxLine({ text, lit }) {
  if (!text) return <span>&nbsp;</span>;
  const base = lit ? "#c9d1e3" : "#2d3f60";
  const kw = lit ? "#c084fc" : "#1e2740";
  const str = lit ? "#86efac" : "#1a2e22";
  const com = lit ? "#4a6a7a" : "#1a2530";
  const num = lit ? "#fbbf24" : "#2a2010";
  const keywords = new Set(["def","return","for","if","else","in","and","or","not","True","False","None","elif","while","import","from","as","class","with","pass","break","continue","yield","lambda","try","except","finally","raise","del","global","nonlocal","assert"]);
  const tokens = text.split(/(\s+|[()[\]{},:#=<>+\-*/%!]|"[^"]*"|'[^']*'|#.*$|\b(?:def|return|for|if|else|in|and|or|not|True|False|None|elif|while|import|from|as|class|with|pass|break|continue|yield|lambda|try|except|finally|raise|del|global|nonlocal|assert)\b|\b\d+\b)/);
  return (
    <span>
      {tokens.map((tok, i) => {
        if (keywords.has(tok)) return <span key={i} style={{ color: kw }}>{tok}</span>;
        if (/^["']/.test(tok)) return <span key={i} style={{ color: str }}>{tok}</span>;
        if (/^#/.test(tok)) return <span key={i} style={{ color: com }}>{tok}</span>;
        if (/^\d+$/.test(tok)) return <span key={i} style={{ color: num }}>{tok}</span>;
        return <span key={i} style={{ color: base }}>{tok}</span>;
      })}
    </span>
  );
}

export default function DeepViz() {
  const [arr, setArr] = useState(DEFAULT_ARRAY);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [inputVal, setInputVal] = useState(DEFAULT_ARRAY.join(", "));

  useEffect(() => { setSteps(solve(arr)); setStepIdx(0); setPlaying(false); }, [arr]);
  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStepIdx(s => s + 1), speed);
    return () => clearTimeout(t);
  }, [playing, stepIdx, steps, speed]);

  const step = steps[stepIdx];
  if (!step) return null;

  const color = COLORS[step.phase] || "#818cf8";

  const graphData = [{ label: "·", sum: 0 }];
  let rs = 0;
  for (let i = 0; i < arr.length; i++) {
    rs += arr[i] === 1 ? 1 : -1;
    graphData.push({ label: `${i}`, sum: rs, i });
  }
  const visibleData = graphData.slice(0, step.i >= 0 ? step.i + 2 : 1);
  const minY = Math.min(...graphData.map(d => d.sum), 0) - 0.5;
  const maxY = Math.max(...graphData.map(d => d.sum), 0) + 0.5;

  return (
    <div style={{ minHeight: "calc(100vh - 44px)", background: "#080c14", color: "#c9d1e3", fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace", fontSize: 13 }}>
      <style>{`
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:#0d1117;}
        ::-webkit-scrollbar-thumb{background:#1e2740;border-radius:4px;}
        @keyframes dv-fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .dv-cel{transition:all .25s cubic-bezier(.4,0,.2,1);}
        .dv-btn{cursor:pointer;border:none;font-family:inherit;transition:all .15s;}
        .dv-btn:hover{filter:brightness(1.2);}
      `}</style>

      {/* Input bar */}
      <div style={{ background: "#0a0d14", borderBottom: "1px solid #1a2035", padding: "10px 20px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "#2d3f60", letterSpacing: 2 }}>ARRAY:</span>
        <input value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && (() => { const n = inputVal.split(/[\s,]+/).map(Number).filter(x=>x===0||x===1); if(n.length>=2) setArr(n); })()}
          placeholder="0, 1, 0, 1, ..."
          style={{ background: "#0d1117", border: "1px solid #1a2740", color: "#c9d1e3", padding: "5px 10px", borderRadius: 5, fontFamily: "inherit", fontSize: 12, width: 180 }} />
        <button className="dv-btn" onClick={() => { const n = inputVal.split(/[\s,]+/).map(Number).filter(x=>x===0||x===1); if(n.length>=2) setArr(n); }}
          style={{ background: "#1d4ed8", color: "#fff", padding: "5px 12px", borderRadius: 5, fontSize: 11 }}>Load</button>
        <button className="dv-btn" onClick={() => { const r = Array.from({length:10},()=>Math.round(Math.random())); setArr(r); setInputVal(r.join(", ")); }}
          style={{ background: "#131e30", color: "#6c7fa5", padding: "5px 10px", borderRadius: 5, border: "1px solid #1a2740", fontSize: 11 }}>Random</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "calc(100vh - 44px - 47px)" }}>

        {/* LEFT */}
        <div style={{ borderRight: "1px solid #1a2035", overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Array cells */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #1a2035" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#2d3f60", marginBottom: 10, textTransform: "uppercase" }}>Input Array</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {arr.map((v, i) => {
                const isActive = step.i === i;
                const inBest = step.bestStart >= 0 && i >= step.bestStart && i <= step.bestEnd;
                const inCand = step.candidate && i >= step.candidate.start && i <= step.candidate.end;
                let bc = "#1a2035", bg = "#0a0f1a";
                if (isActive) { bc = color; bg = "#121a2a"; }
                else if (inBest) { bc = "#10b981"; bg = "#071812"; }
                else if (inCand) { bc = "#fbbf24"; bg = "#181208"; }
                return (
                  <div key={i} className="dv-cel" style={{ width: 48, border: `2px solid ${bc}`, borderRadius: 8, background: bg, overflow: "hidden", boxShadow: isActive ? `0 0 14px ${color}33` : "none" }}>
                    <div style={{ fontSize: 8, color: "#2d3f60", textAlign: "center", paddingTop: 4 }}>i={i}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, textAlign: "center", color: v===1?"#60a5fa":"#fb923c", fontFamily: "'Syne',sans-serif", lineHeight: 1.1 }}>{v}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, textAlign: "center", paddingBottom: 4, color: v===1?"#3b82f6":"#f97316" }}>{v===1?"+1":"−1"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph */}
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #1a2035" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#2d3f60", marginBottom: 4, textTransform: "uppercase" }}>
              Prefix Sum Graph <span style={{ fontSize: 8, color: "#1a2740", letterSpacing: 1, marginLeft: 8 }}>← same Y = equal 0s & 1s between those points</span>
            </div>
            <ResponsiveContainer width="100%" height={165}>
              <AreaChart data={visibleData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="dv-g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#111828" />
                <XAxis dataKey="label" tick={{ fill: "#2d3f60", fontSize: 9 }} />
                <YAxis domain={[minY, maxY]} tick={{ fill: "#2d3f60", fontSize: 9 }} />
                <ReferenceLine y={0} stroke="#1e2e50" strokeDasharray="5 3" strokeWidth={1.5} />
                {step.bestStart >= 0 && <ReferenceLine x={String(step.bestStart)} stroke="#10b98155" strokeDasharray="4 2" />}
                {step.bestEnd >= 0 && <ReferenceLine x={String(step.bestEnd)} stroke="#10b98155" strokeDasharray="4 2" />}
                <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid #1a2035", borderRadius: 6, fontSize: 11 }} labelStyle={{ color: "#6c7fa5" }} formatter={(v) => [v, "sum"]} />
                <Area type="monotone" dataKey="sum" stroke="#6366f1" strokeWidth={2.5} fill="url(#dv-g1)"
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const isAct = payload.i === step.i;
                    const inB = step.bestStart >= 0 && payload.i !== undefined && payload.i >= step.bestStart - 1 && payload.i <= step.bestEnd;
                    const r = isAct ? 7 : inB ? 5 : 3;
                    const fill = isAct ? color : inB ? "#10b981" : "#6366f1";
                    return <circle key={payload.label} cx={cx} cy={cy} r={r} fill={fill} stroke="#080b14" strokeWidth={2} />;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hashmap */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a2035" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#2d3f60", marginBottom: 8, textTransform: "uppercase" }}>Hashmap · prefix_map</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {Object.entries(step.map).map(([k, v]) => {
                const isHit = Number(k) === step.sum && step.phase === "hit";
                return (
                  <div key={k} className="dv-cel" style={{ background: isHit?"#111e38":"#090d18", border:`1px solid ${isHit?"#6366f1":"#1a2035"}`, borderRadius: 5, padding: "4px 9px", boxShadow: isHit?"0 0 10px #6366f144":"none" }}>
                    <span style={{ color: "#818cf8" }}>{Number(k)>=0?`+${k}`:k}</span>
                    <span style={{ color: "#1a2740", margin: "0 4px" }}>→</span>
                    <span style={{ color: "#fbbf24" }}>{v}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best */}
          <div style={{ padding: "12px 16px", marginTop: "auto" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#2d3f60", marginBottom: 8, textTransform: "uppercase" }}>Best Answer</div>
            {step.bestStart >= 0 ? (
              <div style={{ background: "#050e0a", border: "1px solid #0d3024", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span>🏆</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#10b981", fontFamily: "'Syne',sans-serif" }}>Length {step.maxLen}</span>
                  <span style={{ fontSize: 10, color: "#065f46" }}>[{step.bestStart}..{step.bestEnd}]</span>
                </div>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 5 }}>
                  {arr.map((v, i) => {
                    const inB = step.bestStart <= i && i <= step.bestEnd;
                    return <div key={i} style={{ width: 24, height: 24, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, background: inB?(v===1?"#1d4ed8":"#c2410c"):"#0a0f1a", color: inB?"#fff":"#1a2740", border: inB?"none":"1px solid #1a2035" }}>{v}</div>;
                  })}
                </div>
                <div style={{ fontSize: 10, color: "#064e38" }}>
                  {arr.slice(step.bestStart,step.bestEnd+1).filter(x=>x===0).length} zeros · {arr.slice(step.bestStart,step.bestEnd+1).filter(x=>x===1).length} ones ✓
                </div>
              </div>
            ) : (
              <div style={{ color: "#1a2740", fontStyle: "italic", fontSize: 12 }}>No subarray found yet...</div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Code */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #1a2035" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#2d3f60", textTransform: "uppercase" }}>Python Code</div>
              <div style={{ display: "flex", gap: 5 }}>
                {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              </div>
            </div>
            <div style={{ background: "#060b14", border: "1px solid #111828", borderRadius: 8, overflow: "auto" }}>
              {PYTHON_CODE.map((item, li) => {
                const isLit = item.phase === step.codePhase;
                return (
                  <div key={li} style={{ display: "flex", alignItems: "stretch", borderLeft: `3px solid ${isLit?color:"transparent"}`, background: isLit?"#0e1828":"transparent", transition: "all 0.2s" }}>
                    <span style={{ width: 28, flexShrink: 0, textAlign: "right", paddingRight: 8, color: "#1e2e4a", userSelect: "none", fontSize: 10, paddingTop: 3 }}>{item.text?li+1:""}</span>
                    <pre style={{ margin: 0, padding: "2px 10px 2px 0", fontSize: 12, lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-all", flex: 1 }}>
                      <SyntaxLine text={item.text} lit={isLit} />
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>

             {/* Step info */}
          <div key={stepIdx} style={{ padding: "14px 16px", borderBottom: "1px solid #1a2035", animation: "dv-fadeUp 0.25s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ background:`${color}22`, color, border:`1px solid ${color}44`, borderRadius:4, padding:"2px 8px", fontSize:9, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase" }}>{step.phase}</div>
              <span style={{ fontSize: 10, color: "#2d3f60" }}>step {stepIdx+1}/{steps.length}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 6, fontFamily: "'Syne',sans-serif" }}>{step.title}</div>
            <div style={{ fontSize: 12, color: "#8899aa", lineHeight: 1.65, marginBottom: 6 }}>{step.desc}</div>
            <div style={{ fontSize: 11, color: "#2d5060", fontStyle: "italic", lineHeight: 1.5, borderLeft:`2px solid ${color}44`, paddingLeft: 10 }}>💡 {step.insight}</div>
          </div>

          {/* Concept cards */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a2035" }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: "#2d3f60", marginBottom: 8, textTransform: "uppercase" }}>Algorithm DNA</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {[
                { label: "Transform", desc: "0 → −1, 1 → +1", color: "#f97316" },
                { label: "Prefix Sum", desc: "Running balance", color: "#818cf8" },
                { label: "Repeat = Match", desc: "Same sum → equal segment", color: "#34d399" },
                { label: "First Seen", desc: "Store earliest index only", color: "#fbbf24" },
              ].map(c => (
                <div key={c.label} style={{ background: "#090d18", border:`1px solid ${c.color}22`, borderRadius: 6, padding: "7px 9px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: c.color, letterSpacing: 1, marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: "#4a5a70" }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div style={{ padding: "12px 16px", marginTop: "auto" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <button className="dv-btn" onClick={() => { setPlaying(false); setStepIdx(0); }} style={{ background:"#0d1321", color:"#6c7fa5", padding:"7px 10px", borderRadius:5, border:"1px solid #1a2035" }}>⏮</button>
              <button className="dv-btn" onClick={() => setStepIdx(s=>Math.max(0,s-1))} style={{ background:"#0d1321", color:"#6c7fa5", padding:"7px 10px", borderRadius:5, border:"1px solid #1a2035" }}>◀</button>
              <button className="dv-btn" onClick={() => setPlaying(p=>!p)} style={{ flex:1, background:playing?"#450a0a":"#1d4ed8", color:"#fff", padding:"7px 0", borderRadius:5, fontSize:11, fontWeight:600 }}>
                {playing?"⏸  Pause":"▶  Play"}
              </button>
              <button className="dv-btn" onClick={() => setStepIdx(s=>Math.min(steps.length-1,s+1))} style={{ background:"#0d1321", color:"#6c7fa5", padding:"7px 10px", borderRadius:5, border:"1px solid #1a2035" }}>▶</button>
              <button className="dv-btn" onClick={() => { setPlaying(false); setStepIdx(steps.length-1); }} style={{ background:"#0d1321", color:"#6c7fa5", padding:"7px 10px", borderRadius:5, border:"1px solid #1a2035" }}>⏭</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ fontSize: 9, color: "#2d3f60", width: 36 }}>SPEED</span>
              <input type="range" min={200} max={1500} step={100} value={speed} onChange={e=>setSpeed(+e.target.value)} style={{ flex:1, accentColor:color }} />
              <span style={{ fontSize: 9, color: "#2d3f60", width: 36, textAlign: "right" }}>{speed}ms</span>
            </div>
            <div style={{ height: 3, background: "#0d1321", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height:"100%", width:`${(stepIdx/(steps.length-1))*100}%`, background:`linear-gradient(90deg,${color},#6366f1)`, transition:"width 0.3s", borderRadius:2 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// --- ⚪️ MONOCHROME DISTORTION GRID ---
function GridBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      const spacing = 50;

      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath();
        for (let y = 0; y < canvas.height; y += 15) {
          const dist = Math.hypot(x - mouse.current.x, y - mouse.current.y);
          const force = Math.max(0, (200 - dist) / 200);
          ctx.lineTo(x + (x - mouse.current.x) * force * 0.25, y);
        }
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 15) {
          const dist = Math.hypot(x - mouse.current.x, y - mouse.current.y);
          const force = Math.max(0, (200 - dist) / 200);
          ctx.lineTo(x, y + (y - mouse.current.y) * force * 0.25);
        }
        ctx.stroke();
      }
      frame = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    window.addEventListener(
      "mousemove",
      (e) => (mouse.current = { x: e.clientX, y: e.clientY }),
    );
    resize();
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: -1, background: "#000000" }}
    />
  );
}

// --- 🛠️ COMPREHENSIVE C/C++ → JS TRANSPILER ---
function transpileCppToJs(cpp) {
  let code = cpp;

  // 1. Strip preprocessor directives and includes
  code = code.replace(/#include\s*[<"][^>"]*[>"]\s*/g, "");
  code = code.replace(/using\s+namespace\s+\w+;\s*/g, "");
  code = code.replace(/#\w+[^\n]*/g, "");

  // 2. Strip main() entirely
  code = code.replace(/int\s+main\s*\([^)]*\)\s*\{[\s\S]*?\n\}/m, "");

  // 3. Strip printf / scanf / cout / cin statements
  code = code.replace(/\b(printf|scanf|fprintf|cout|cin)\s*\([^;]*\)\s*;/g, "");
  code = code.replace(/\b(printf|scanf|fprintf|cout|cin)\b[^;]*;/g, "");

  // 4. Strip C-style comparator functions (const void* params)
  code = code.replace(/\w[\w\s]*\s+\w+\s*\(\s*const\s+void\s*\*[^)]*\)\s*\{[\s\S]*?\n\}/gm, "");

  // 5. Replace qsort with inline insertion sort
  code = code.replace(/\bqsort\s*\([^;]*\)\s*;/g,
    `for (let _i = 1; _i < arr.length; _i++) {
  let _j = _i;
  while (_j > 0 && arr[_j-1].value > arr[_j].value) {
    [arr[_j-1], arr[_j]] = [arr[_j], arr[_j-1]];
    _j--;
  }
}`
  );

  // 6. Strip sizeof
  code = code.replace(/sizeof\s*\([^)]*\)/g, "0");
  code = code.replace(/\bsizeof\b/g, "0");

  // 7. FIRST strip vector<...>& and vector<...> BEFORE stripping & generally
  //    This prevents <int> leaking into param lists
  code = code.replace(/\b(?:std::)?vector\s*<[^>]+>\s*[&*]?\s*/g, "");

  // 8. Strip const qualifier
  code = code.replace(/\bconst\s+/g, "");

  // 9. Strip C-style type casts
  code = code.replace(/\(\s*(?:unsigned\s+)?(?:int|float|double|char|void|long|short)\s*\*?\s*\)/g, "");

  // 10. Strip pointer dereference
  code = code.replace(/\*\s*\(([^)]+)\)/g, "$1");
  code = code.replace(/\*(\w+)/g, "$1");

  // 11. Strip address-of (but not &&)
  code = code.replace(/(?<![&])&(?![&])(\w+)/g, "$1");

  // 12. Convert typed function signatures => function name(params)
  code = code.replace(
    /\b(?:void|int|float|double|bool|auto|char|long|short|unsigned)\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
    (_, name, params) => {
      const paramNames = params
        .split(",")
        .map(p => p.trim()
          .replace(/\b(?:const|unsigned|signed|int|float|double|bool|char|long|short|void)\b/g, "")
          .replace(/[\[\]*&<>]/g, "")   // also strip any leftover <> fragments
          .trim()
        )
        .filter(p => p.length > 0 && p !== "void");
      return `function ${name}(${paramNames.join(", ")}) {`;
    }
  );

  // 13. Convert typed variable declarations to let
  code = code.replace(
    /\b(?:unsigned\s+|signed\s+)?(?:int|float|double|bool|size_t|char|long|short)\s+(\w+)\s*\[([^\]]*)\]\s*=\s*([^;]+);/g,
    "let $1 = $3;"
  );
  code = code.replace(
    /\b(?:unsigned\s+|signed\s+)?(?:int|float|double|bool|size_t|char|long|short)\s+(\w+)\s*\[([^\]]*)\]\s*;/g,
    "let $1 = new Array($2);"
  );
  code = code.replace(
    /\b(?:unsigned\s+|signed\s+)?(?:int|float|double|bool|size_t|char|long|short)\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
    "let $1;"
  );
  code = code.replace(
    /\b(?:unsigned\s+|signed\s+)?(?:int|float|double|bool|size_t|char|long|short)\s+([a-zA-Z_]\w*)\s*=/g,
    "let $1 ="
  );

  // 14. .size() => .length
  code = code.replace(/\.size\(\)/g, ".length");

  // 15. std::swap / swap(a, b) => [a, b] = [b, a]
  code = code.replace(
    /(?:std::)?swap\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)\s*;/g,
    "[$1, $2] = [$2, $1];"
  );

  // 16. NULL => null
  code = code.replace(/\bNULL\b/g, "null");

  // 17. Fix direct value comparisons on array elements:
  //     arr[i] > arr[j]  =>  arr[i].value > arr[j].value
  //     Covers: > < >= <= == !=
  code = code.replace(
    /(\w+\s*\[[^\]]+\])\s*(>|<|>=|<=|==|!=)\s*(\w+\s*\[[^\]]+\])/g,
    "$1.value $2 $3.value"
  );

  // 18. Find the main sort function and alias to "sort" for the sandbox
  const fnNames = [];
  const fnRegex = /function\s+(\w+)\s*\(/g;
  let m;
  while ((m = fnRegex.exec(code)) !== null) fnNames.push(m[1]);
  const sortFn = fnNames.find(n => !["compare", "cmp", "main"].includes(n));
  if (sortFn && sortFn !== "sort") {
    // Pass arr.length as second arg in case the function expects n
    code = code + `\nfunction sort(arr) { ${sortFn}(arr, arr.length); }`;
  }

  // 19. Clean up stray type keywords
  code = code.replace(/\b(int|float|double|bool|void|char|long|short)\b\s+(?=[a-zA-Z_])/g, "");

  // 20. Clean up excess blank lines
  code = code.replace(/\n{3,}/g, "\n\n");

  return code.trim();
}

export default function App() {
  const [array, setArray] = useState(() => generateInitialArray(12));
  const [isRunning, setIsRunning] = useState(false);
  const [isTranspiling, setIsTranspiling] = useState(false);
  const [active, setActive] = useState({ compare: [], swap: [] });
  const [speed, setSpeed] = useState(150);
  const [arraySize, setArraySize] = useState(12);
  const [arraySizeInput, setArraySizeInput] = useState("12");

  const [code, setCode] = useState(`#include <stdio.h>
#include <stdlib.h>

int cmp(const void *a, const void *b) {
    return (*(int*)a - *(int*)b);
}

void sort(int arr[], int n) {
    qsort(arr, n, sizeof(int), cmp);

    int result[n];
    int left = 0, right = n - 1;
    int i = 0, j = n - 1;

    while (i <= j) {
        if (i == j) { result[left] = arr[i]; break; }
        result[left++] = arr[i++];
        result[right--] = arr[j--];
    }

    for (int k = 0; k < n; k++) arr[k] = result[k];
}`);

  const animationRef = useRef(null);
  const indexRef = useRef(0);
  const lastAccess = useRef([]);
  const barContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const actionsListRef = useRef([]);

  // --- stats ---
  const [elapsedMs, setElapsedMs] = useState(0);
  const [complexity, setComplexity] = useState(null);
  const [opCounts, setOpCounts] = useState({ compares: 0, swaps: 0 });
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const pausedAtRef = useRef(0);

  // --- infer complexity from actual operation counts vs n ---
  function inferComplexity(compares, swaps, n) {
    const ops = compares;
    if (ops === 0 || n < 2) return { label: "—", color: "#666" };

    const nLogN = n * Math.log2(n);
    const n2    = n * n;

    const rN2    = ops / n2;
    const rNLogN = ops / nLogN;
    const rN     = ops / n;

    // Check O(n²) first — bubble/selection/insertion comparisons ≈ n²/2
    // so rN2 ≥ 0.45. Merge/quick sit in 0.20–0.44. Linear < 0.15.
    if (rN2 >= 0.45)                            return { label: "O(n²)",      color: "#ff3636" };
    if (rN2 >= 0.20 && rNLogN >= 0.7)          return { label: "O(n log n)", color: "#ebcb8b" };
    if (rN  >= 0.5  && rN     <= 2.5)           return { label: "O(n)",       color: "#3af853" };

    // Fallback: nearest class
    const candidates = [
      { label: "O(n)",       color: "#3af853", d: Math.abs(rN - 1)       },
      { label: "O(n log n)", color: "#ebcb8b", d: Math.abs(rNLogN - 1.2) },
      { label: "O(n²)",      color: "#ff3636", d: Math.abs(rN2 - 0.5)    },
    ];
    return candidates.sort((a, b) => a.d - b.d)[0];
  }

  function startTimer() {
    clearInterval(timerRef.current);
    startTimeRef.current = performance.now();
    pausedAtRef.current = 0;
    timerRef.current = setInterval(() => {
      setElapsedMs(Math.floor(performance.now() - startTimeRef.current));
    }, 50);
  }

  function pauseTimer() {
    clearInterval(timerRef.current);
    pausedAtRef.current = performance.now() - startTimeRef.current;
  }

  function resumeTimer() {
    startTimeRef.current = performance.now() - pausedAtRef.current;
    timerRef.current = setInterval(() => {
      setElapsedMs(Math.floor(performance.now() - startTimeRef.current));
    }, 50);
  }

  function stopTimer() {
    clearInterval(timerRef.current);
  }

  function generateInitialArray(size = 12) {
    return Array.from({ length: size }, (_, i) => ({
      id: `element-${i}-${Math.random()}`,
      value: Math.floor(Math.random() * 25) + 5,
    }));
  }

  function runCode() {
    if (isRunning) return;
    setIsRunning(true);
    setElapsedMs(0);
    setComplexity(null);
    setOpCounts({ compares: 0, swaps: 0 });
    indexRef.current = 0;
    lastAccess.current = [];
    startTimer();

    const jsCode = transpileCppToJs(code);
    let rawActions = [];

    const tracked = new Proxy([...array], {
      get(target, prop) {
        const idx = Number(prop);
        if (!isNaN(idx)) {
          lastAccess.current.push(idx);
          if (lastAccess.current.length > 2) lastAccess.current.shift();
          if (lastAccess.current.length === 2) {
            rawActions.push({
              type: "compare",
              indices: [...lastAccess.current],
            });
          }
        }
        return target[prop];
      },
      set(target, prop, value) {
        const idx = Number(prop);
        if (!isNaN(idx)) {
          target[prop] = value;
          rawActions.push({
            type: "write",
            idx,
            array: [...target].map((x) => ({ ...x })),
          });
          lastAccess.current = [];
        } else {
          target[prop] = value;
        }
        return true;
      },
    });

    // Helper functions exposed to user JS code:
    // compare(i, j) — highlights and returns true if arr[i] > arr[j]
    // swap(i, j)    — swaps arr[i] and arr[j] in place
    const compare = (i, j) => tracked[i].value > tracked[j].value;
    const swap = (i, j) => { [tracked[i], tracked[j]] = [tracked[j], tracked[i]]; };

    try {
      const fn = new Function("arr", "compare", "swap", `${jsCode}\n sort(arr, compare, swap);`);
      fn(tracked, compare, swap);

      // Merge consecutive write pairs into one swap action so both
      // bars receive their new x target in the same React update
      const tempActions = [];
      let i = 0;
      while (i < rawActions.length) {
        const a = rawActions[i];
        if (a.type === "write" && rawActions[i + 1]?.type === "write") {
          const b = rawActions[i + 1];
          tempActions.push({
            type: "swap",
            indices: [a.idx, b.idx],
            array: b.array,
          });
          i += 2;
        } else if (a.type === "write") {
          tempActions.push({ type: "swap", indices: [a.idx], array: a.array });
          i++;
        } else {
          tempActions.push(a);
          i++;
        }
      }

      actionsListRef.current = tempActions;

      // Count ops from final action list
      const totalCompares = tempActions.filter(a => a.type === "compare").length;
      const totalSwaps = tempActions.filter(a => a.type === "swap").length;
      const n = array.length;
      setOpCounts({ compares: totalCompares, swaps: totalSwaps });
      setComplexity(inferComplexity(totalCompares, totalSwaps, n));

      animate(tempActions);
    } catch (err) {
      alert("COMPILATION_ERROR: " + err.message);
      setIsRunning(false);
    }
  }

  function animate(actionsList) {
    if (indexRef.current >= actionsList.length) {
      stopTimer();
      setIsRunning(false);
      setIsPaused(false);
      isPausedRef.current = false;
      setActive({ compare: [], swap: [] });
      return;
    }

    if (isPausedRef.current) return;

    const action = actionsList[indexRef.current];

    if (action.type === "compare") {
      setActive({ compare: action.indices, swap: [] });
      indexRef.current++;
      animationRef.current = setTimeout(() => animate(actionsList), speed);
      return;
    }

    if (action.type === "swap") {
      setActive({ compare: [], swap: action.indices });
      setArray(action.array);
      indexRef.current++;
      animationRef.current = setTimeout(() => animate(actionsList), speed);
      return;
    }
  }

  function handlePause() {
    isPausedRef.current = true;
    setIsPaused(true);
    clearTimeout(animationRef.current);
    pauseTimer();
  }

  function handleResume() {
    isPausedRef.current = false;
    setIsPaused(false);
    resumeTimer();
    animate(actionsListRef.current);
  }

  return (
    <>
      <GridBackground />
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.cursor}>&gt;</span> ALGO_TYPEWRITER{" "}
            <span style={styles.version}>v3.0.mono</span>
          </div>

          <div style={styles.controls}>
            <div style={styles.speedControl}>
              <span style={styles.label}>DELAY_MS</span>
              <input
                type="range"
                min="20"
                max="500"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.speedControl}>
              <span style={styles.label}>ARRAY_SIZE <span style={{color:"#555"}}></span></span>
              <input
                type="text"
                inputMode="numeric"
                value={arraySizeInput}
                onChange={(e) => setArraySizeInput(e.target.value)}
                onBlur={() => {
                  const parsed = parseInt(arraySizeInput, 10);
                  const s = isNaN(parsed) ? arraySize : Math.min(100, Math.max(4, parsed));
                  setArraySizeInput(String(s));
                  setArraySize(s);
                  if (!isRunning && !isPaused) {
                    setArray(generateInitialArray(s));
                    setComplexity(null);
                    setOpCounts({ compares: 0, swaps: 0 });
                    setElapsedMs(0);
                  }
                }}
                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                style={styles.numberInput}
              />
            </div>

            <button
              style={styles.secondaryButton}
              onClick={() => {
                clearTimeout(animationRef.current);
                stopTimer();
                isPausedRef.current = false;
                setIsRunning(false);
                setIsPaused(false);
                setActive({ compare: [], swap: [] });
                setElapsedMs(0);
                setComplexity(null);
                setOpCounts({ compares: 0, swaps: 0 });
                setArray(generateInitialArray(arraySize));
                setArraySizeInput(String(arraySize));
              }}
            >
              RESET
            </button>

            {!isRunning && !isPaused && (
              <button
                style={{ ...styles.primaryButton, background: "#FFF", color: "#000" }}
                onClick={runCode}
              >
                RUN
              </button>
            )}

            {isRunning && !isPaused && (
              <button
                style={{ ...styles.primaryButton, background: "#FFF", color: "#000" }}
                onClick={handlePause}
              >
                ⏸ PAUSE
              </button>
            )}

            {isPaused && (
              <button
                style={{ ...styles.primaryButton, background: "#3af853", color: "#000" }}
                onClick={handleResume}
              >
                ▶ RESUME
              </button>
            )}
          </div>
        </header>

        <main style={styles.main}>
          <section style={styles.editorSection}>
            <div style={styles.label}>// SOURCE_CODE</div>
            <div style={styles.terminal}>
              <div style={styles.terminalHeader}>
                <div style={styles.dots}>
                  <div style={{ ...styles.dot, background: "#bf616a" }} />
                  <div style={{ ...styles.dot, background: "#ebcb8b" }} />
                  <div style={{ ...styles.dot, background: "#a3be8c" }} />
                </div>
                <span style={styles.fileName}>main.cpp</span>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={styles.textarea}
                spellCheck="false"
              />
            </div>
          </section>

          <section style={styles.visualizerSection}>
            <div style={styles.label}>// VISUALIZATION</div>

            <div style={styles.barContainer} ref={barContainerRef}>
              {(() => {
                const n = array.length;
                // Fit all bars inside the container. containerRef gives us
                // the real pixel width minus padding (40px each side = 80px).
                const availW = (barContainerRef.current?.clientWidth ?? 600) - 80;
                // Min bar width 4px, gap scales with bar
                const GAP = n > 40 ? 1 : n > 20 ? 2 : 4;
                const BAR_WIDTH = Math.max(4, Math.floor((availW - GAP * (n - 1)) / n));
                const SLOT = BAR_WIDTH + GAP;
                const containerWidth = n * SLOT - GAP;
                const showLabels = n <= 20;
                // Scale bar heights to fit — max value is 30, container is ~380px tall
                const maxVal = Math.max(...array.map(x => x.value));
                const maxBarH = (barContainerRef.current?.clientHeight ?? 400) - (showLabels ? 60 : 20);
                const scale = maxBarH / maxVal;

                return (
                  <div style={{ position: "relative", width: containerWidth, height: "100%" }}>
                    {array.map((item, index) => {
                      const isComp = active.compare.includes(index);
                      const isSwap = active.swap.includes(index);

                      let barColor = "#444";
                      if (isComp) barColor = "#3af853";
                      if (isSwap) barColor = "#ff3636";

                      const targetX = index * SLOT;

                      return (
                        <motion.div
                          key={item.id}
                          animate={{ x: targetX }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: BAR_WIDTH,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <motion.div
                            animate={{ backgroundColor: barColor }}
                            transition={{ duration: 0.15 }}
                            style={{
                              width: "100%",
                              height: Math.max(4, Math.round(item.value * scale)),
                              borderRadius: 0,
                            }}
                          />
                          {showLabels && (
                            <span style={styles.barValue}>{item.value}</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Stats panel */}
            <div style={styles.statsRow}>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>ELAPSED</div>
                <div style={styles.statValue}>
                  {elapsedMs >= 1000
                    ? `${(elapsedMs / 1000).toFixed(2)}s`
                    : `${elapsedMs}ms`}
                </div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>COMPARISONS</div>
                <div style={styles.statValue}>{opCounts.compares}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>SWAPS</div>
                <div style={styles.statValue}>{opCounts.swaps}</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>COMPLEXITY</div>
                <div style={{
                  ...styles.statValue,
                  color: complexity ? complexity.color : "#444",
                  fontSize: "16px",
                }}>
                  {complexity ? complexity.label : "—"}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

const styles = {
  container: {
    padding: "40px",
    color: "#FFF",
    fontFamily: "'Courier New', Courier, monospace",
    position: "relative",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  logo: { fontSize: "16px", fontWeight: "bold", letterSpacing: "1px" },
  cursor: { color: "#FFF", marginRight: "8px" },
  version: { fontSize: "10px", color: "#666", marginLeft: "10px" },
  controls: { display: "flex", alignItems: "center", gap: "25px" },
  speedControl: { display: "flex", flexDirection: "column", gap: "4px" },
  slider: {
    width: "100px",
    accentColor: "#FFF",
    cursor: "pointer",
    background: "#333",
  },
  numberInput: {
    width: "64px",
    background: "#111",
    border: "1px solid #444",
    color: "#FFF",
    fontFamily: "'Courier New', monospace",
    fontSize: "13px",
    padding: "4px 8px",
    outline: "none",
    textAlign: "center",
    appearance: "textfield",
  },
  primaryButton: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "0",
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "11px",
    transition: "0.2s",
  },
  secondaryButton: {
    padding: "10px 24px",
    background: "transparent",
    border: "1px solid #666",
    color: "#666",
    borderRadius: "0",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "11px",
  },
  main: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    height: "620px",
  },
  editorSection: { display: "flex", flexDirection: "column" },
  label: {
    fontSize: "11px",
    color: "#666",
    marginBottom: "12px",
    letterSpacing: "2px",
  },
  terminal: {
    flex: 1,
    backgroundColor: "#000",
    border: "1px solid #333",
    borderRadius: "0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  terminalHeader: {
    height: "36px",
    backgroundColor: "#111",
    borderBottom: "1px solid #333",
    display: "flex",
    alignItems: "center",
    padding: "0 15px",
    justifyContent: "space-between",
  },
  dots: { display: "flex", gap: "8px" },
  dot: { width: "10px", height: "10px", borderRadius: "50%", opacity: 0.8 },
  fileName: { fontSize: "10px", color: "#666" },
  textarea: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#FFF",
    padding: "20px",
    border: "none",
    fontSize: "14px",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    lineHeight: "1.6",
  },
  visualizerSection: { display: "flex", flexDirection: "column" },
  barContainer: {
    flex: 1,
    backgroundColor: "#000",
    border: "1px solid #333",
    borderRadius: "0",
    display: "flex",
    alignItems: "flex-end",
    padding: "20px 40px",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  barWrapper: {
    width: "32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  bar: { width: "100%", borderRadius: "0", position: "relative" },
  barValue: {
    marginTop: "12px",
    fontSize: "10px",
    color: "#666",
    fontWeight: "bold",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1px",
    backgroundColor: "#333",
    border: "1px solid #333",
    marginTop: "12px",
  },
  statBox: {
    backgroundColor: "#000",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statLabel: {
    fontSize: "9px",
    color: "#555",
    letterSpacing: "2px",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#FFF",
    fontFamily: "'Courier New', monospace",
  },
};
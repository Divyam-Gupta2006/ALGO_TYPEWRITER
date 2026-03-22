# ALGO_TYPEWRITER

ALGO_TYPEWRITER is a browser-based sorting algorithm visualizer that accepts real C/C++ code and animates it step by step.

What it does
You paste C or C++ sorting code into the editor, hit RUN, and watch the algorithm execute live on a randomly generated array of bars. Each comparison lights up green, each swap slides the two bars to their new positions simultaneously. You can pause mid-sort, resume, adjust speed, and change array size up to 100 elements. After sorting, a stats panel shows total elapsed time, comparison count, swap count, and inferred time complexity.

How it works
The pipeline has three stages. First, a regex-based transpiler converts your C/C++ into runnable JavaScript — stripping includes, pointers, type annotations, qsort, printf, and main(), then rewriting typed declarations and function signatures into valid JS. Second, the transpiled function runs against a JS Proxy wrapping the array, which intercepts every element read and write and records a timestamped log of compare and swap operations without the algorithm knowing. Third, the recorded action log is replayed frame by frame using setTimeout loops, driving Framer Motion spring animations that slide bars by their x position — so heights never change and swaps always look clean. Complexity is inferred empirically by computing the ratio of actual comparison counts against n, n log n, and n², then picking the best fit.

Strengths

Accepts real C/C++ — not a toy DSL. Bubble sort, insertion sort, selection sort, quicksort, merge sort, and qsort-based variants all work.
The proxy-based recording is completely invisible to the algorithm — the code runs exactly as written, no instrumentation needed in the source.
Swap animation is visually accurate — bars physically exchange positions rather than changing height, so the visual exactly matches what the algorithm is doing.
Complexity inference is empirical, not hardcoded — it measures actual operations against the array size rather than pattern-matching the code.
Pause/resume, speed control, and array size (4–100) are all live controls.


Limitations

The transpiler is regex-based, not a real parser. It handles the common patterns well but will fail on unusual C++ — templates, lambdas, STL containers other than vector, auto type deduction, operator overloading, or anything involving dynamic memory (malloc, new).
qsort is silently replaced with an inline insertion sort, so if the correctness of the algorithm depends on qsort's specific behavior (e.g. unstable sort order) the visualization may not perfectly reflect what the C code would produce.
Complexity inference only distinguishes O(n), O(n log n), and O(n²). It won't detect O(n log² n), O(n^1.5), or sub-linear algorithms.
At n=100, quadratic algorithms do ~5000 operations. At the default 150ms delay that's 750 seconds of animation — you need to crank the speed down significantly for large arrays.
The visualizer only works for in-place integer sorting. Algorithms that sort strings, structs, or produce a new array as output won't render correctly.

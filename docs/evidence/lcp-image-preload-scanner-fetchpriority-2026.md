# Evidence — LCP image discovery / fetchpriority / render-blocking (2026-07-14)

Tool: Chrome DevTools MCP `performance_start_trace` (reload=true), CPU 1x, no network throttling.
Local origin: threaded Python HTTP server, `Cache-Control: no-store`, style.css delayed 1000ms (render-blocking).
Hero: real 1200x600 PNG, 117,183 bytes.

## LCP breakdown (ms), measured

| Config | TTFB | Load delay (discovery) | Load duration | Render delay | LCP |
|---|---|---|---|---|---|
| 1. hero via CSS background-image | 8 | 1184 | 5 | 51 | 1247 |
| 2. img fetchpriority=high + preload (CSS still blocking) | 3 | 37 | 2 | 1185 | 1226 |
| 3. #2 + inline critical CSS (stylesheet non-blocking) | 5 | 43 | 1 | 60 | 109 |

Key observations:
- Config 1: Load delay dominates (1184ms) — background-image URL is invisible to the preload scanner, so discovery waits for the render-blocking stylesheet.
- Config 2: fetchpriority+preload collapses Load delay 1184 -> 37ms, but LCP barely moves because the bottleneck SHIFTS to Render delay (1185ms) — the render-blocking CSS caps first paint.
- Config 3: removing render-blocking (inline critical CSS + media=print onload) finally drops LCP to 109ms (~91% vs config 1).

DevTools flagged "LCPDiscovery" insight on config 1 and 3 only (not 2), and "RenderBlocking" throughout.

# Sandbox Evidence: Deno 2 vs Bun Node.js Runtime Comparison

**Date**: 2026-06-04  
**Environment**: macOS aarch64 (Apple Silicon), sandbox at /tmp/claude-501/jangwook-blog-lab.CZpoiE

## Versions Tested

- **Bun**: 1.3.14
- **Deno**: 2.8.2 (stable, release, aarch64-apple-darwin), V8 14.9.207.2, TypeScript 6.0.3

## Startup Time (TypeScript, hello.ts: 100k array sum)

```
Bun (cold):  0.243s  (first run, includes JIT compilation)
Bun (warm):  0.013s  (subsequent runs)
Deno (cold): 0.067s
Deno (warm): 0.026s
```

## HTTP Throughput (Apache Bench, n=3000, c=30, 127.0.0.1)

```
Bun Serve API:   23,794.98 RPS  (time: 0.126s, 0 failed)
Deno.serve API:  22,594.27 RPS  (time: 0.133s, 0 failed)
```

## Package Installation

```
Bun (bun add zod):       91ms  (creates node_modules, package.json)
Deno (npm: specifier):   0ms additional install  
  - First download included in deno run: ~62ms total
  - Second run (cached): no network
```

## Node.js API Compatibility

Both pass node:fs, node:crypto, node:events with full compatibility.

## Security Model

```
Deno (no flags) reading /etc/hosts: DENIED
Deno (--allow-read=/etc/hosts) reading /etc/hosts: SUCCESS

Bun reading /etc/hosts: SUCCESS (no flags needed)
```

## TypeScript Support

```
Bun: Transpiles TypeScript without type checking (fast)
Deno: TypeScript 6.0.3, supports --check flag for type validation
```

import { availableParallelism } from 'node:os';

// Set these before loading Vite: its config loader already starts esbuild.
// GOMEMLIMIT is a soft Go runtime budget, not a process memory hard limit.
// Preserve explicit developer overrides and leave production builds untouched.
process.env.GOMEMLIMIT ??= '768MiB';
process.env.GOMAXPROCS ??= String(Math.max(1, Math.min(4, availableParallelism() - 1)));

// Keep Vite's CLI argument handling and shutdown behavior.
await import(new URL('./bin/vite.js', import.meta.resolve('vite/package.json')).href);

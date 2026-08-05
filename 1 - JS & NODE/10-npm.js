// ============================================================
// TOPIC 10: npm, package.json, semver
// ============================================================

// -------------------------------------------
// npm = Node Package Manager
// -------------------------------------------
// Instead of writing every piece of code yourself, npm lets you
// download code other people already wrote (called "packages").
//
// Command you already ran:
//   npm install express
//
// This does TWO things:
// 1. Downloads express into a folder called node_modules
// 2. Writes "express" into package.json so anyone else knows to
//    install it too


// -------------------------------------------
// package.json = your project's ID card
// -------------------------------------------
// A JSON file describing your project. Created with:
//   npm init          (asks you questions)
//   npm init -y        (skips questions, uses defaults)
//
// EXAMPLE of what's inside (this is what YOU already generated):
//
// {
//   "name": "node-practice",
//   "version": "1.0.0",
//   "main": "index.js",
//   "scripts": {
//     "start": "node index.js"
//   },
//   "dependencies": {
//     "express": "^5.2.1"
//   }
// }
//
// - "scripts"       -> shortcuts. `npm run start` runs "node index.js"
//                      instead of you typing the full command
// - "dependencies"  -> packages your app NEEDS to run
// - "devDependencies" (not shown above) -> packages only needed
//                      while developing (like nodemon), not in production


// -------------------------------------------
// semver = Semantic Versioning
// -------------------------------------------
// A RULE for what version numbers mean. Format: MAJOR.MINOR.PATCH
//
//   4  .  18  .  2
//   |     |      |
//   |     |      PATCH -> bug fixes only, safe to auto-update
//   |     MINOR  -> new features added, nothing breaks (safe-ish)
//   MAJOR -> breaking changes, code might stop working
//
// So express going 4.18.2 -> 4.19.0 = safe, new feature added
//    express going 4.18.2 -> 5.0.0  = NOT safe, expect breakage

// In package.json you'll see symbols in front of version numbers:
//
//   "^4.18.2"  -> allow MINOR/PATCH updates, but NEVER jump to 5.0.0
//                 (this is the default you'll see almost everywhere)
//   "~4.18.2"  -> allow ONLY patch updates (4.18.x)
//   "4.18.2"   -> exact version only, nothing else allowed
//
// WHY THIS MATTERS: when you run `npm install`, it respects these
// rules automatically. That's the whole point of semver — a CONTRACT
// so your app doesn't randomly break just because you updated packages.


// -------------------------------------------
// package-lock.json — the piece that goes further than semver
// -------------------------------------------
// package.json says "I need express in the ^5.2.1 RANGE" — not exact.
// package-lock.json records the EXACT version of every single package
// that actually got installed (including packages express itself needs).
//
// This guarantees: if a teammate clones your project and runs
// `npm install`, they get the EXACT same versions you have —
// not just "something in that range."
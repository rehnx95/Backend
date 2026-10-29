// ============================================================
// BUFFERS — raw bytes, not text
// ============================================================
// PROBLEM: not everything is text. Images, videos, network data —
// none of that is "characters." Node needs a way to hold RAW DATA
// before deciding whether it's text or something else.
// That raw data type is called a Buffer.

// Buffer.from(someString) -> takes a string and converts it into
// raw bytes (a Buffer object).
const buf = Buffer.from("Hello");

console.log(buf);
// prints: <Buffer 48 65 6c 6c 6f>
// These are NOT random numbers. Each pair is ONE LETTER of "Hello",
// written in hexadecimal (base 16), using that character's byte value:
//   48 = H
//   65 = e
//   6c = l
//   6c = l
//   6f = o
// A Buffer is Node's HONEST view of data — just bytes, nothing decoded.

console.log(buf.toString());
// prints: Hello
// .toString() takes those raw bytes and DECODES them back into
// readable text. This is the translation step.

console.log(buf.length);
// prints: 5
// length = number of bytes. For simple English text, 1 byte = 1 letter.


// ------------------------------------------------------------
// WHY THIS MATTERS FOR REAL FILES
// ------------------------------------------------------------
const fs = require("fs");

fs.writeFileSync("sample.txt", "Node buffers are just bytes");

// No encoding given -> Node has NO IDEA if this file is text, an
// image, or anything else. So it hands you the RAW Buffer.
const raw = fs.readFileSync("sample.txt");

// Encoding given ('utf8') -> "trust me, decode this as text."
// Node does the translation FOR you and gives back a readable string.
const decoded = fs.readFileSync("sample.txt", "utf8");

console.log("raw (Buffer):", raw);
console.log("decoded (string):", decoded);
// SAME FILE. Two different results, because one told Node to decode
// and the other didn't.


// ============================================================
// STREAMS — reading/writing data in small PIECES, not all at once
// ============================================================
// PROBLEM: fs.readFileSync loads the ENTIRE file into memory at once.
// Fine for a small text file. For a 2GB video, your app would try to
// hold the whole thing in RAM at once and crash.
//
// STREAMS fix this: instead of "wait for the whole file, get it all,"
// you get the file in small CHUNKS, one piece at a time, as they
// become available — like a video buffering instead of a full download.

// Make a bigger file first, so we can actually see it split into chunks
fs.writeFileSync("bigfile.txt", "Hello streams! ".repeat(50000));

// fs.createReadStream(path, options) -> does NOT read the file yet.
// It sets up a STREAM — a thing that will emit small pieces of the
// file over time. { encoding: 'utf8' } means "give me text chunks,
// not raw Buffer chunks."
const readStream = fs.createReadStream("bigfile.txt", { encoding: "utf8" });

let chunkCount = 0;

// .on(eventName, callback) — THIS SYNTAX IS EVENTEMITTER.
// Streams are built ON TOP OF EventEmitter (your next topic).
// It means: "whenever this stream FIRES the 'data' event
// (meaning: a new chunk just arrived), run this function."
// Same shape as addEventListener('click', handler) from the browser —
// except here the "event" is "a chunk of file just arrived."
readStream.on("data", (chunk) => {
  chunkCount++;
  console.log(`Received chunk ${chunkCount}, size: ${chunk.length} characters`);
});

// 'end' event fires ONCE, after the LAST chunk has been sent.
readStream.on("end", () => {
  console.log(`Done. Total chunks: ${chunkCount}`);
});

// WHAT ACTUALLY HAPPENS WHEN YOU RUN THIS:
// A 750,000 character file does NOT arrive as one giant string.
// It arrives in ~12 pieces, each capped at 65536 characters (64KB) —
// this 64KB number is Node's DEFAULT chunk size for read streams.
// Memory usage stays flat and small, no matter how huge the real
// file is — a 750MB file would just mean ~12,000 chunks instead of 12,
// never one giant blob sitting in RAM at once.


// ------------------------------------------------------------
// PIPE — the pattern you'll actually use in real code
// ------------------------------------------------------------
// Manually counting chunks with .on('data') is for UNDERSTANDING.
// In real code, you almost always use .pipe() instead, which
// automatically does "read a chunk -> write a chunk -> repeat" for you.

const readStream2 = fs.createReadStream("bigfile.txt");
const writeStream = fs.createWriteStream("bigfile-copy.txt");

// .pipe(destination) -> takes everything coming OUT of readStream2
// and sends it straight INTO writeStream, chunk by chunk, automatically.
readStream2.pipe(writeStream);

// 'finish' event fires once ALL chunks have been written to the
// destination file.
writeStream.on("finish", () => {
  console.log("Copy complete");
});

// RESULT: bigfile.txt and bigfile-copy.txt end up IDENTICAL in size,
// but you never touched a single chunk yourself this time — pipe()
// handled the whole loop internally.
// THIS is the pattern you'll actually use later — e.g. streaming a
// file straight into an HTTP response in Express.
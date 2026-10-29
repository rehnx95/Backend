/*
=====================================================================
 VIDEO 7 — Serialization and Deserialization (Summary)
=====================================================================

1. THE PROBLEM
   - Client and server can be built in completely different
     languages (e.g. JavaScript frontend, Rust backend).
   - Each language has its own data types — a JS object and a Rust
     struct are NOT the same thing.
   - So how does data sent from one reach and make sense to the other?


2. THE SOLUTION — A COMMON STANDARD
   - Both sides agree on one shared format to send/receive data in.
   - Client converts its own data INTO that format before sending
     (this is SERIALIZATION).
   - Server converts that format BACK INTO its own data types after
     receiving (this is DESERIALIZATION).
   - Same happens in reverse for the response.
   Example: JS object -> JSON (serialize) -> sent over network ->
            Rust struct (deserialize) -> server uses it
            Rust struct -> JSON (serialize) -> sent back ->
            JS object (deserialize) -> client uses it


3. YOU DON'T NEED TO WORRY ABOUT THE NETWORK LAYERS IN BETWEEN
   - Data technically passes through OSI layers (data frames, IP
     packets, raw bits) during transmission.
   - As a backend engineer, none of that is your concern.
   - Mental model: JSON in -> [network, ignore it] -> JSON out.


4. SERIALIZATION STANDARDS — TWO CATEGORIES
   - Text-based: JSON, XML, YAML (human-readable)
   - Binary format: Protobuf and others (not human-readable, faster)
   - This playlist focuses on JSON — used in ~80% of real HTTP
     client-server communication.


5. WHAT JSON IS
   - Stands for JavaScript Object Notation.
   - Looks like a JS object, but used across ALL languages, not
     just JavaScript.
   - Used for: HTTP request/response bodies, config files, log files.


6. JSON RULES
   - Starts with { and ends with }
   - Keys must be in double quotes, and must be strings
   - Values can be: string, number, boolean, array, or another
     nested object
   - Nested objects follow the exact same rules inside them
   Example:
     {
       "name": "Rehan",
       "age": 20,
       "isStudent": true,
       "address": {
         "country": "India",
         "phoneNumber": 123456
       }
     }


7. THE FULL REQUEST/RESPONSE FLOW
   - Client serializes its data into JSON, sends it in the request
     body.
   - Server deserializes that JSON into its own native data types,
     processes it (business logic, database, etc.).
   - Server serializes its result back into JSON, sends it in the
     response body.
   - Client deserializes that JSON back into its own data types,
     uses it (e.g. renders UI).
   Example: your own POST /api/books demo — you sent
     { "id": 1, "title": "...", "author": "..." }
   server responded with a JSON array of book objects, and the
   client (browser) rendered it — that whole loop IS serialization
   and deserialization.

=====================================================================
*/
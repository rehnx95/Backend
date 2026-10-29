/*
=====================================================================
 POSTGRES / RELATIONAL DATABASES — TOPIC-WISE NOTES
 Source: Video 12, "Mastering Databases with Postgres"
 Reorganized by topic (not by video order). Nothing from the
 original summary has been cut — only regrouped, with a few
 clarifying additions marked [ADDED NOTE].
=====================================================================
*/


/* =====================================================================
   TOPIC 1 — WHY DATABASES EXIST AT ALL
===================================================================== */

// Core purpose: PERSISTENCE — storing data so it survives after the
// program that created it stops running.
//
// Without persistence, every app restart wipes all progress — like a
// to-do list losing every task the moment you close the app.

// [ADDED NOTE] Persistence is the reason a database is treated as a
// separate concern from "just holding data in a variable" — a
// JS array in memory technically stores data too, but it dies with
// the process. A database's whole job is to outlive the process.


/* =====================================================================
   TOPIC 2 — WHAT "DATABASE" MEANS (BROAD VS. BACKEND-SPECIFIC)
===================================================================== */

// Broadest sense: ANY structured storage counts — a phone contact
// list, browser localStorage, even a plain text file.
//
// Backend/server-specific sense: DISK-based storage (HDD/SSD), NOT RAM.
//
// Why disk, not RAM:
// - RAM is fast but expensive and limited (most systems: 8-128GB).
// - Disk is slow but cheap and abundant (500GB-2TB+ common).
// - Databases need lots of space, so they trade speed for capacity
//   by living on disk.
//
// This exact trade-off is ALSO why caching layers like Redis exist
// separately — Redis stores hot/frequently-needed data in RAM
// specifically to buy back the speed a disk-based DB gives up.


/* =====================================================================
   TOPIC 3 — DBMS (DATABASE MANAGEMENT SYSTEM)
===================================================================== */

// Software whose job is to store data AND provide efficient CRUD
// operations on it at scale.
//
// Four core responsibilities:
//   1. Data organization — structuring data for efficient access
//   2. Access — providing create/read/update/delete operations
//   3. Integrity — ensuring data is accurate and valid
//      (e.g. rejecting a string in a number field)
//   4. Security — controlling who can access what


/* =====================================================================
   TOPIC 4 — WHY NOT JUST USE TEXT FILES
===================================================================== */

// Three real problems a DBMS solves that plain text files don't:
//
//   1. PARSING — slow, error-prone, requires custom code to find
//      any single data point.
//   2. NO STRUCTURE — can't enforce that a field must be a number,
//      etc. Nothing stops garbage data from being written.
//   3. CONCURRENCY — if two people modify the same value at once,
//      whoever saves last silently overwrites the other. No
//      consistency guarantee at all.


/* =====================================================================
   TOPIC 5 — RELATIONAL VS. NON-RELATIONAL DATABASES
===================================================================== */

// --- Relational (Postgres, MySQL, SQL Server) -------------------------
// - Data lives in tables / rows / columns.
// - Relationships expressed via foreign keys.
// - Requires a strict, predefined schema BEFORE inserting data.
// - Trade-off: less flexible, but strong data integrity — you always
//   know the exact shape of your data.

// --- Non-relational (MongoDB) ------------------------------------------
// - Tables are called "collections," rows are called "documents."
// - No enforced schema — different documents in the SAME collection
//   can have completely different fields.
// - Flexible, fast to prototype with, but integrity has to be
//   manually enforced in application code instead of the database —
//   more error-prone.

// --- Use-case examples given ---------------------------------------------
// - CRM (customer data, sales relationships) -> suits RELATIONAL,
//   because it needs strict integrity and complex relationship
//   queries.
// - CMS (blog content of varying, unpredictable shape — text,
//   images, embeds) -> suits NON-RELATIONAL, because content
//   structure isn't fixed in advance.


/* =====================================================================
   TOPIC 6 — WHY POSTGRES SPECIFICALLY
===================================================================== */

// - Open source and free.
// - Strictly follows the SQL standard -> migrating to other SQL
//   databases later is relatively painless.
// - Extensible — huge feature set (~1400 pages of docs), strong
//   extension ecosystem.
// - Known for reliability and scalability.
// - Excellent native JSON support (including a jsonb type) — this
//   alone removes most reasons people reach for MongoDB just for
//   flexible/dynamic data, since Postgres can store and efficiently
//   query JSON too.


/* =====================================================================
   TOPIC 7 — POSTGRES DATA TYPES (HIGH-LEVEL TOUR)
===================================================================== */

// --- Numbers ------------------------------------------------------------
// - serial / bigserial — auto-incrementing integers, commonly used
//   for primary keys (bigserial preferred in production for higher
//   capacity).
// - smallint / integer / bigint — different integer capacities.
// - decimal / numeric  vs.  real / double precision (floating point):
//     decimal is EXACT — use it whenever accuracy matters (e.g. prices).
//     floating point is faster but can have small representation
//     discrepancies — fine for things like measurements where tiny
//     inaccuracy doesn't matter.

// --- Text ------------------------------------------------------------------
// - char(n) — pads with extra spaces to fixed length. Mostly obsolete,
//   avoid.
// - varchar(n) — enforces a max length.
// - text — no enforced length.
// RECOMMENDATION: default to text. Postgres's own docs say there's no
// real performance difference vs. varchar, and arbitrary limits like
// varchar(255) are a MySQL-era convention that mean nothing in
// Postgres — they just risk a painful migration later if the limit
// needs raising. Enforce length constraints in application code
// instead.

// --- Date / time -------------------------------------------------------------
// - boolean, date, time, timestamp, timestamp with time zone, interval.

// --- Identifiers -------------------------------------------------------------
// - uuid — popular for primary keys: URL-friendly, and unique
//   without needing coordination (unlike auto-increment across
//   distributed systems).

// --- JSON -----------------------------------------------------------------------
// - json — stores as plain text.
// - jsonb ("JSON binary") — Postgres's optimized internal format,
//   faster for querying.
// PREFER jsonb unless there's a specific reason not to.

// --- Other -----------------------------------------------------------------------
// - Arrays of any type.
// - Rarely-used extras: network/MAC addresses, geometric points, XML.


/* =====================================================================
   TOPIC 8 — MIGRATIONS
===================================================================== */

// Migrations are sequentially-ordered SQL files (e.g. 1.sql, 2.sql —
// tracked via numbers or timestamps), stored in a migrations folder,
// applied via a CLI tool (e.g. dbmate, golang-migrate).
//
// Each migration typically has:
//   - UP migration   — the actual change (create table, add index, etc.)
//   - DOWN migration — the exact reverse, for rolling back if
//                       something breaks.
//
// The migration tool tracks the database's current version in a
// special schema_migrations table, so it knows which migrations have
// already been applied and never re-runs them.
//
// WHY MIGRATIONS MATTER:
//   - Give you a committed, version-controlled history of every
//     database change over time, alongside your code in Git.
//   - Give you a safe rollback mechanism if a change causes problems.
//   - Relational databases enforce strict schemas, so you can't just
//     insert arbitrary structural changes — every schema change has
//     to go through this controlled migration process.


/* =====================================================================
   TOPIC 9 — DESIGNING A REAL SCHEMA
   (worked example: a project management platform)
===================================================================== */

// Tables built: users, user_profiles, projects, tasks, project_members

// --- ENUM types ------------------------------------------------------------
// Custom types with a fixed set of allowed values
// (e.g. project_status: active / completed / archived).
// Two benefits:
//   1. Data integrity enforced at the DATABASE level, not just in
//      application code.
//   2. Documentation — anyone reading the schema later immediately
//      sees the allowed values, without digging through app code.

// --- Naming conventions ------------------------------------------------------
// - Table names PLURAL (users, not user).
// - Everything lowercase.
// - Multi-word fields in snake_case, not camelCase — because
//   Postgres is case-insensitive by default and treats unquoted
//   camelCase as all-lowercase anyway. Sticking to snake_case avoids
//   needing to wrap identifiers in quotes everywhere.

// --- Standard fields on most tables ------------------------------------------
// - id (primary key, often uuid with a default random-generation)
// - created_at, updated_at (both timestamp with time zone)

// --- Primary key -------------------------------------------------------------
// Implicitly enforces TWO constraints at once: NOT NULL and UNIQUE.
// This is what makes it usable to reliably identify one exact row.


/* =====================================================================
   TOPIC 10 — RELATIONSHIP TYPES AND HOW EACH IS IMPLEMENTED
===================================================================== */

// --- One-to-one (users <-> user_profiles) --------------------------------
// The second table's primary key IS the foreign key —
// e.g. user_profiles.user_id is BOTH primary key and foreign key,
// referencing users.id.
// Used here because profile data (bio, avatar, etc.) changes
// independently and can grow over time without bloating the core
// users table.

// --- One-to-many (projects -> tasks) --------------------------------------
// The "many" side holds a foreign key column referencing the "one"
// side's primary key (tasks.project_id -> projects.id), but does
// NOT make that foreign key its own primary key.

// --- Many-to-many (projects <-> users via project_members) -----------------
// Requires a separate LINKING TABLE holding foreign keys to both
// sides, with a COMPOSITE PRIMARY KEY made of both foreign keys
// together (project_id + user_id). This combination must be unique,
// preventing a user from being added to the same project twice.

// --- Foreign key / referential integrity constraints -------------------------
// (what happens when a REFERENCED row is deleted)
//   - ON DELETE RESTRICT    — blocks the deletion entirely if related
//                             rows exist elsewhere (e.g. can't delete
//                             a user who still owns projects).
//   - ON DELETE CASCADE     — deletes related rows automatically
//                             (e.g. deleting a project deletes all
//                             its tasks).
//   - ON DELETE SET NULL    — sets the referencing field to null
//                             instead of deleting (e.g. deleting a
//                             user unassigns them from tasks rather
//                             than deleting the tasks).
//   - ON DELETE SET DEFAULT — resets the field to its defined
//                             default value.


/* =====================================================================
   TOPIC 11 — OTHER CONSTRAINTS
===================================================================== */

// - UNIQUE — e.g. no duplicate emails.
// - NOT NULL — recommended default for MOST fields; over 70% of
//   fields should have this, since allowing null invites silent bugs.
// - CHECK — custom conditions, e.g. priority must be between 1 and 5.


/* =====================================================================
   TOPIC 12 — SEEDING
===================================================================== */

// Separate migration files used purely to insert realistic TEST data
// into a development database (never real user data) — done via
// ordinary INSERT statements, often using CTEs (Common Table
// Expressions, WITH ... AS) to insert into one table and immediately
// reference the generated IDs when inserting into a related table,
// all in the same statement.


/* =====================================================================
   TOPIC 13 — WRITING REAL QUERIES FOR APIS
===================================================================== */

// --- GET all users -------------------------------------------------------
// SELECT with a LEFT JOIN to user_profiles.
// LEFT JOIN chosen (not INNER JOIN) because a user might not have a
// profile row yet — INNER JOIN would wrongly exclude them.
// Uses to_jsonb(profile_alias.*) to embed the joined profile data as
// a nested JSON field in ONE query, instead of requiring two
// separate API calls.
// Sorted with ORDER BY created_at DESC by default, since raw query
// results have no guaranteed order otherwise.

// --- GET single user -------------------------------------------------------
// Same query plus a WHERE clause using a PARAMETERIZED query (a
// placeholder slot filled in separately from the query text itself).

// --- Parameterized queries — critical security mechanism ---------------------
// Any value inserted through a parameter slot is always treated as a
// plain string, never as executable SQL. This is what PREVENTS SQL
// INJECTION — e.g. someone passing "DELETE FROM users" as an ID
// value can't cause it to actually execute.
// [ADDED NOTE] This is the SQL-layer equivalent of the identity/trust
// boundary lesson from the auth work: never let raw client input be
// interpreted as something more privileged than "a value" — whether
// that's a userID pretending to be an identity, or a string
// pretending to be executable SQL.

// --- Dynamic sorting/filtering on list endpoints -------------------------------
// - Filtering via ILIKE (case-insensitive pattern match,
//   e.g. 'J%' matches anything starting with J).
// - Sortable/orderable fields built CONDITIONALLY based on what the
//   client actually requested, with defaults applied when the client
//   sends nothing.
// - Pagination via LIMIT / OFFSET — note the API's "page 1"
//   corresponds to database OFFSET 0.

// --- POST create -----------------------------------------------------------------
// INSERT INTO ... VALUES (parameterized values) RETURNING *
// Returns the full created row (including server-generated fields
// like id) in ONE round trip.

// --- PATCH update -----------------------------------------------------------------
// Dynamically constructed:
//   UPDATE ... SET field = value [, field2 = value2 ...]
//   WHERE id = param
//   RETURNING *
// Only the fields the client actually SENT get included in the SET
// clause — untouched fields are left alone entirely.


/* =====================================================================
   TOPIC 14 — TRIGGERS
===================================================================== */

// Used to automate keeping updated_at current without manually
// setting it in every update query.
//
// How: a custom Postgres FUNCTION is defined that sets
// NEW.updated_at = now(), then a TRIGGER is attached to each table to
// run that function automatically BEFORE every UPDATE.
//
// Confirmed working live: updated a row and observed the timestamp
// change without the application code touching it directly.


/* =====================================================================
   TOPIC 15 — INDEXES
===================================================================== */

// --- The core idea (book-index analogy) -----------------------------------------
// Without an index, finding a specific row means a slow SEQUENTIAL
// SCAN — checking every single row one by one across the disk until
// a match is found.
// An INDEX is a separate, fast lookup table mapping a specific
// field's value directly to its row's physical location, letting the
// database jump straight to the right place instead of scanning
// everything.

// --- Two properties of an index -------------------------------------------------
//   1. Which field it covers.
//   2. Its sort order (ascending/descending) — matching the sort
//      order to how you actually query speeds up ORDER BY
//      operations specifically.

// --- Automatic vs. manual indexing -----------------------------------------------
// - PRIMARY KEYS are automatically indexed by Postgres — no manual
//   step needed.
// - FOREIGN KEYS are NOT automatically indexed, and often need one
//   added manually if used frequently.

// --- Rule of thumb for when to add an index --------------------------------------
// A field is a strong candidate if it's used in:
//   - a JOIN condition,
//   - a WHERE clause, or
//   - a sort / ORDER BY,
// AND the query using it runs frequently enough to justify the cost.
//
// Indexes are NOT free: every INSERT/UPDATE also has to update every
// index on that table, adding overhead. This is a genuine trade-off
// to evaluate, not something to apply blindly everywhere.

// --- Indexes actually created in the example --------------------------------------
// - users.email
// - users.created_at DESC
// - tasks.project_id
// - tasks.assigned_to
// - tasks.created_at DESC
// - tasks.status
// - plus indexes on the project_members linking table
//
// Each one justified by a specific query (a join, a filter, or a
// default sort) that the schema needs to support efficiently.
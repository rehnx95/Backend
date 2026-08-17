// Video 12 — Mastering Databases with Postgres (Full Summary)
// Why databases exist

// A database's core purpose is persistence — storing data so it survives after the program that created it stops running. Without persistence, every app restart would wipe all progress (like a to-do list losing all your tasks every time you close it).

// What "database" means, broadly vs. in backend context

// In the broadest sense, any structured storage counts as a database — a phone contact list, browser localStorage, even a plain text file. But in backend/server contexts, "database" specifically means disk-based storage (HDD/SSD), not RAM. Why: RAM is fast but expensive and limited (most systems have 8-128GB); disk is slow but cheap and abundant (500GB-2TB+ common). Databases need lots of space, so they trade speed for capacity by living on disk — this is also exactly why caching layers like Redis exist separately, storing hot data in RAM for speed.

// DBMS (Database Management System)

// Software whose job is to store data AND provide efficient CRUD operations on it at scale. Four core responsibilities:

// Data organization — structuring data for efficient access
// Access — providing create/read/update/delete operations
// Integrity — ensuring data is accurate and valid (e.g., rejecting a string in a number field)
// Security — controlling who can access what
// Why not just use text files

// Three real problems: parsing (slow, error-prone, requires custom code to find any data point), no structure (can't enforce that a field must be a number, etc.), concurrency (if two people modify the same value at once, whoever saves last silently overwrites the other — no consistency guarantee).

// Relational vs. Non-relational
// Relational (Postgres, MySQL, SQL Server): data in tables/rows/columns, relationships via foreign keys, requires a strict predefined schema before inserting data. Trade-off: less flexible, but strong data integrity — you always know the exact shape of your data.
// Non-relational (MongoDB): tables are called "collections," rows are called "documents," no enforced schema — different documents in the same collection can have completely different fields. Flexible, fast to prototype with, but integrity has to be manually enforced in application code instead of the database, making it more error-prone.
// Use-case examples given: a CRM (customer data, sales relationships) suits relational because of its need for strict integrity and complex relationship queries; a CMS (blog content of varying, unpredictable shape — text, images, embeds) suits non-relational because content structure isn't fixed in advance.
// Why Postgres specifically
// Open source and free
// Strictly follows the SQL standard, making migration to other SQL databases relatively painless
// Extensible — huge feature set (~1400 pages of docs), strong extension ecosystem
// Known for reliability and scalability
// Excellent native JSON support (including a jsonb type) — this alone removes most reasons people reach for MongoDB just for flexible/dynamic data, since Postgres can store and efficiently query JSON too
// Postgres data types (high-level tour)
// serial / bigserial — auto-incrementing integers, commonly used for primary keys (bigserial preferred in production for higher capacity)
// smallint / integer / bigint — different integer capacities
// decimal/numeric vs real/double precision (floating point) — decimal is exact, use it whenever accuracy matters (e.g., prices); floating point is faster but can have small representation discrepancies, fine for things like measurements where tiny inaccuracy doesn't matter
// char vs varchar vs text — char(n) pads with extra spaces to fixed length (avoid, mostly obsolete); varchar(n) enforces a max length; text has no enforced length. Recommendation: default to text — Postgres's own docs say there's no real performance difference vs. varchar, and arbitrary limits like varchar(255) (a MySQL-era convention) mean nothing in Postgres and just risk needing a painful migration later if you need to raise the limit. Enforce length constraints in application code instead.
// boolean, date, time, timestamp, timestamp with time zone, interval
// uuid — popular for primary keys due to URL-friendliness and uniqueness without coordination
// json vs jsonb — json stores as plain text; jsonb ("JSON binary") is Postgres's optimized internal format, faster for querying. Prefer jsonb unless you have a specific reason not to.
// Arrays of any type
// Rarely-used extras: network/MAC addresses, geometric points, XML
// Migrations

// Migrations are sequentially-ordered SQL files (e.g., 1.sql, 2.sql, tracked via numbers or timestamps) stored in a migrations folder, applied via a CLI tool (e.g., dbmate, golang-migrate). Each migration typically has:

// Up migration — the actual change (create table, add index, etc.)
// Down migration — the exact reverse, for rolling back if something breaks

// The migration tool tracks the database's current version in a special schema_migrations table, so it knows which migrations have already been applied and never re-runs them. Why migrations matter: they give you a committed, version-controlled history of every database change over time (alongside your code in Git), and a safe rollback mechanism if a change causes problems. Relational databases enforce strict schemas, so you can't just insert arbitrary structural changes — every schema change has to go through this controlled migration process.

// Designing a real schema (project management platform example)

// Tables built: users, user_profiles, projects, tasks, project_members

// ENUM types — custom types with a fixed set of allowed values (e.g., project_status: active/completed/archived). Two benefits: (1) data integrity enforced at the database level instead of relying on application code, (2) documentation — anyone reading the schema later immediately sees the allowed values, without having to dig through application code to figure it out.

// Naming conventions: table names plural (users, not user), everything lowercase, multi-word fields in snake_case (not camelCase) — because Postgres is case-insensitive by default and treats unquoted camelCase as all-lowercase anyway, so sticking to snake_case avoids needing to wrap identifiers in quotes everywhere.

// Standard fields on most tables: id (primary key, often uuid with a default random-generation), created_at, updated_at (both timestamp with time zone).

// Primary key implicitly enforces two constraints: NOT NULL and UNIQUE — this is what makes it usable to reliably identify one exact row.

// Relationship types and how each is implemented:

// One-to-one (users ↔ user_profiles): the second table's primary key IS the foreign key — e.g., user_profiles.user_id is both primary key and foreign key referencing users.id. Used here because profile data (bio, avatar, etc.) changes independently and can grow over time without bloating the core users table.
// One-to-many (projects → tasks): the "many" side holds a foreign key column referencing the "one" side's primary key (tasks.project_id → projects.id), but does NOT make it its own primary key.
// Many-to-many (projects ↔ users via project_members): requires a separate linking table holding foreign keys to both sides, with a composite primary key made of both foreign keys together (project_id + user_id) — this combination must be unique, preventing a user from being added to the same project twice.

// Foreign key / referential integrity constraints (what happens when a referenced row is deleted):

// ON DELETE RESTRICT — blocks the deletion entirely if related rows exist elsewhere (e.g., can't delete a user who still owns projects)
// ON DELETE CASCADE — deletes related rows automatically (e.g., deleting a project deletes all its tasks)
// ON DELETE SET NULL — sets the referencing field to null instead of deleting (e.g., deleting a user unassigns them from tasks rather than deleting the tasks)
// ON DELETE SET DEFAULT — resets the field to its defined default value

// Other constraints seen: UNIQUE (e.g., no duplicate emails), NOT NULL (recommended default for most fields — over 70% of fields should have this, since allowing null invites silent bugs), CHECK (custom conditions, e.g., priority must be between 1 and 5).

// Seeding

// Separate migration files used purely to insert realistic test data into a development database (not real user data) — done via ordinary INSERT statements, often using CTEs (Common Table Expressions, WITH ... AS) to insert into one table and immediately reference the generated IDs when inserting into a related table in the same statement.

// Writing real queries for APIs
// GET all users: SELECT with a LEFT JOIN to user_profiles (LEFT JOIN chosen because a user might not have a profile row yet — INNER JOIN would wrongly exclude them), using to_jsonb(profile_alias.*) to embed the joined profile data as a nested JSON field in one query instead of requiring two separate API calls. Sorted with ORDER BY created_at DESC by default, since raw query results have no guaranteed order otherwise.
// GET single user: same query plus a WHERE clause using a parameterized query (a placeholder slot filled in separately from the query text itself).
// Parameterized queries — critical security mechanism. Any value inserted through a parameter slot is always treated as a plain string, never as executable SQL, which is what prevents SQL injection (e.g., someone passing DELETE FROM users as an ID value can't cause it to actually execute).
// Dynamic sorting/filtering on list endpoints: filtering via ILIKE (case-insensitive pattern match, e.g. 'J%' matches anything starting with J), sortable/orderable fields built conditionally based on what the client actually requested (with defaults applied when the client sends nothing), and pagination via LIMIT/OFFSET — note the API's "page 1" corresponds to database OFFSET 0.
// POST create: INSERT INTO ... VALUES (parameterized values) RETURNING * — returns the full created row (including server-generated fields like id) in one round trip.
// PATCH update: dynamically constructed UPDATE ... SET field = value [, field2 = value2...] WHERE id = param RETURNING * — only the fields the client actually sent get included in the SET clause; untouched fields are left alone entirely.
// Triggers

// Used to automate keeping updated_at current without manually setting it in every update query. A custom Postgres function is defined that sets NEW.updated_at = now(), then a trigger is attached to each table to run that function automatically before every UPDATE. Confirmed working live by updating a row and observing the timestamp change without the application code touching it.

// Indexes

// The core idea, via a book-index analogy: without an index, finding a specific row means a slow sequential scan — checking every single row one by one across the disk until a match is found. An index is a separate, fast lookup table mapping a specific field's value directly to its row's physical location, letting the database jump straight to the right place instead of scanning everything.

// Two properties of an index: which field it covers, and its sort order (ascending/descending) — matching the sort order to how you actually query speeds up ORDER BY operations specifically.

// Primary keys are automatically indexed by Postgres — no manual step needed. Foreign keys are not automatically indexed and often need one added manually if used frequently.

// Rule of thumb for when to add an index: a field is a strong candidate if it's used in a JOIN condition, a WHERE clause, or a sort/ORDER BY — and the query using it runs frequently enough to justify the cost. Indexes aren't free: every INSERT/UPDATE has to also update every index on that table, adding overhead. This is a genuine trade-off to evaluate, not something to apply blindly everywhere.

// Indexes actually created in the example: users.email, users.created_at DESC, tasks.project_id, tasks.assigned_to, tasks.created_at DESC, tasks.status, plus indexes on the project_members linking table — each justified by a specific query (a join, a filter, or a default sort) that the schema needs to support efficiently.
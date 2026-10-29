/*
================================================================================
# Postgres Complete Reference (JS Edition) — ORDERED BY USAGE FREQUENCY
# Tier 1 = things you write almost every session. Tier 10 = things you touch
# rarely (admin/tooling, one-time setup).
#
# 🎥 = from the original video reference (untouched, nothing cut)
# 🔮 = added here — either extending an existing pattern to your users/tasks
#      case, or filling a genuine gap (syntax the video never covered but
#      that comes up constantly in real backend work)
================================================================================
*/


// =============================================================================
// TIER 1 — CORE CRUD (written constantly, every single day)
// =============================================================================

// --- 1.1 Reading data — SELECT --------------------------------------------------
const READ_DATA = {
  // 🎥 Every column
  selectAll: `SELECT * FROM person;`,

  // 🎥 Specific columns
  selectColumns: `SELECT first_name, last_name FROM person;`,

  // 🎥 Single column
  selectSingle: `SELECT email FROM person;`
};

// --- 1.2 Filtering — WHERE --------------------------------------------------------
// Comparison operators (🎥 usable standalone e.g. SELECT 1 = 1; or inside WHERE):
// 1 = 1   (equals -> true)
// 1 <> 2  (not equals -> true, also written !=)
// 1 < 2   (less than -> true)
// 1 <= 1  (less or equal -> true)
// 1 > 2   (greater than -> false)
// 1 >= 1  (greater or equal -> true)

const FILTERING = {
  // 🎥 Single condition
  singleCondition: `SELECT * FROM person WHERE gender = 'female';`,

  // 🎥 AND — both conditions must be true
  andCondition: `SELECT * FROM person WHERE gender = 'female' AND country_of_birth = 'China';`,

  // 🎥 OR — either condition true
  orCondition: `SELECT * FROM person WHERE country_of_birth = 'Poland' OR country_of_birth = 'China';`,

  // 🎥 IN — shorthand for many ORs (equivalent to chaining 5 ORs on country_of_birth)
  inOperator: `
    SELECT * FROM person
    WHERE country_of_birth IN ('China', 'Brazil', 'France', 'Mexico', 'Portugal');
  `,

  // 🔮 NOT IN — the inverse (careful: NOT IN with a NULL in the list matches nothing at all)
  notInOperator: `SELECT * FROM person WHERE country_of_birth NOT IN ('China', 'Brazil');`,

  // 🎥 BETWEEN — inclusive range (everyone born from 2000-01-01 through 2015-01-01 inclusive)
  betweenOperator: `
    SELECT * FROM person
    WHERE date_of_birth BETWEEN DATE '2000-01-01' AND DATE '2015-01-01';
  `,

  // 🎥 LIKE / ILIKE — pattern matching
  // % = any number of any characters. Case-sensitive.
  likeCom: `SELECT * FROM person WHERE email LIKE '%.com';`,
  likeDomain: `SELECT * FROM person WHERE email LIKE '%@bloomberg.com';`,
  likeTld: `SELECT * FROM person WHERE email LIKE '%@google.%';`,  // any Google TLD

  // _ = exactly one character (8 chars before the @)
  likeExactLength: `SELECT * FROM person WHERE email LIKE '________@%';`,

  // ILIKE = case-insensitive LIKE (matches 'Poland', 'poland', etc.)
  ilikeCaseInsensitive: `SELECT * FROM person WHERE country_of_birth ILIKE 'p%';`,

  // 🔮 IS NULL / IS NOT NULL — the only correct way to test for null.
  // `= NULL` silently matches nothing, since NULL isn't equal to anything, even itself.
  isNull: `SELECT * FROM person WHERE email IS NULL;`,
  isNotNull: `SELECT * FROM person WHERE email IS NOT NULL;`
};

// --- 1.3 Inserting data — INSERT --------------------------------------------------
// 🎥 Bulk loading via generated .sql file workflow:
// Use a data-generator site (e.g. Mockaroo) -> export as SQL with CREATE TABLE
// included -> edit the file (add NOT NULL, size columns correctly) -> run with \i filepath

const INSERT_DATA = {
  // 🎥 Explicit column list, matching VALUES order — omit auto-managed columns like id
  basicInsert: `
    INSERT INTO person (first_name, last_name, gender, date_of_birth)
    VALUES ('Anne', 'Smith', 'female', DATE '1988-01-09');
  `,

  // 🎥 Including a nullable column
  insertNullable: `
    INSERT INTO person (first_name, last_name, gender, date_of_birth, email)
    VALUES ('Jake', 'Jones', 'male', DATE '1990-01-31', 'jake@gmail.com');
  `,

  // 🔮 RETURNING — get the created row (including server-generated fields like id)
  // back in the same round trip, instead of a second SELECT. Used constantly in
  // API POST handlers (this is the RETURNING * pattern from your tasks/users API work).
  insertWithReturning: `
    INSERT INTO person (first_name, last_name, gender, date_of_birth)
    VALUES ('Anne', 'Smith', 'female', DATE '1988-01-09')
    RETURNING *;
  `,

  // 🔮 Multi-row insert — one INSERT, several VALUES tuples. Cheaper than N
  // separate INSERT statements for bulk writes.
  multiRowInsert: `
    INSERT INTO person (first_name, last_name, gender, date_of_birth)
    VALUES
      ('Anne', 'Smith', 'female', DATE '1988-01-09'),
      ('Jake', 'Jones', 'male', DATE '1990-01-31');
  `
};

// --- 1.4 Updating records — UPDATE --------------------------------------------------
// 🎥 Always use WHERE, or you update every row in the table!
const UPDATE_DATA = {
  // 🎥 Updating a single column
  updateSingleColumn: `UPDATE person SET email = 'omar@gmail.com' WHERE id = 2011;`,

  // 🎥 Updating multiple columns
  updateMultipleColumns: `
    UPDATE person
    SET first_name = 'Omar', last_name = 'Montana', email = 'omar.montana@hotmail.com'
    WHERE id = 2011;
  `,

  // 🔮 RETURNING on UPDATE — the PATCH-endpoint pattern: get the updated row back
  // without a follow-up SELECT.
  updateWithReturning: `
    UPDATE person SET email = 'omar@gmail.com' WHERE id = 2011
    RETURNING *;
  `
};

// --- 1.5 Deleting records — DELETE --------------------------------------------------
// 🎥 Always use WHERE, or you delete every row in the table!
const DELETE_DATA = {
  // 🎥 Deleting rows
  deleteSingle: `DELETE FROM person WHERE id = 1011;`,
  deleteMultiCondition: `DELETE FROM person WHERE gender = 'female' AND country_of_birth = 'Nigeria';`,

  // 🔮 RETURNING on DELETE — useful for confirming exactly what was removed,
  // or for a "soft delete + return it" API response.
  deleteWithReturning: `DELETE FROM person WHERE id = 1011 RETURNING *;`
};

// --- 1.6 Sorting — ORDER BY --------------------------------------------------
const SORTING = {
  // 🎥 Default is ascending
  defaultSort: `SELECT * FROM person ORDER BY country_of_birth;`,

  // 🎥 Explicit ascending (same as above)
  explicitAsc: `SELECT * FROM person ORDER BY country_of_birth ASC;`,

  // 🎥 Descending
  descending: `SELECT * FROM person ORDER BY country_of_birth DESC;`,

  // 🎥 Multi-column sort — sorts by id first, ties broken by email
  multiColumn: `SELECT * FROM person ORDER BY id, email;`
};

// --- 1.7 Limiting results / pagination --------------------------------------------------
const LIMITING = {
  // 🎥 First 10 rows
  limitTen: `SELECT * FROM person LIMIT 10;`,

  // 🎥 Skip the first 5, then take the next 5 (rows 6–10)
  offsetAndLimit: `SELECT * FROM person OFFSET 5 LIMIT 5;`,

  // 🎥 SQL-standard equivalent of LIMIT (LIMIT is not standard SQL, FETCH is)
  fetchStandard: `SELECT * FROM person OFFSET 5 FETCH FIRST 5 ROW ONLY;`
};


// =============================================================================
// TIER 2 — RELATIONSHIPS & JOINS (needed in almost every real, multi-table query)
// =============================================================================

const FOREIGN_KEYS_AND_JOINS = {
  // 🎥 2.1 Defining a foreign key at table-creation time
  // car must be created first, since person references it
  createCarTable: `
    CREATE TABLE car (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        price NUMERIC(19, 2) NOT NULL
    );
  `,

  createPersonWithFk: `
    CREATE TABLE person (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        gender VARCHAR(7) NOT NULL,
        date_of_birth DATE NOT NULL,
        email VARCHAR(150),
        car_id BIGINT REFERENCES car (id) UNIQUE   -- FK: nullable (not everyone has a car),
                                                    -- UNIQUE = one car belongs to only one person
    );
  `,

  // 🔮 For your users/tasks case, the pattern is the same but inverted in
  // cardinality — many tasks can belong to one user, so the FK column on tasks
  // is *not* unique:
  createUsersTable: `
    CREATE TABLE users (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `,

  createTasksTable: `
    CREATE TABLE tasks (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        is_done BOOLEAN NOT NULL DEFAULT false,
        user_id BIGINT NOT NULL REFERENCES users (id)   -- NOT NULL + no UNIQUE:
                                                          -- every task must have an owner,
                                                          -- and a user can own many tasks
    );
  `,

  // 🎥 2.2 Assigning a foreign key value via UPDATE
  assignFkValue: `UPDATE person SET car_id = 2 WHERE id = 1;`,

  // 🎥 2.3 Deleting a row that's still referenced
  // This FAILS with "violates foreign key constraint" if some person.car_id still points here:
  deleteFkFails: `DELETE FROM car WHERE id = 13;`,

  // Fix: remove the reference first (delete or null out referencing row), then delete:
  deleteFkSuccess: `
    DELETE FROM person WHERE id = 9000;
    DELETE FROM car WHERE id = 13;    -- now succeeds
  `,

  // 🔮 Options worth knowing when defining the FK on delete:
  // - user_id BIGINT REFERENCES users (id) ON DELETE CASCADE  (auto delete dependent rows)
  // - user_id BIGINT REFERENCES users (id) ON DELETE RESTRICT (block delete if dependent rows exist)
  // - car_id BIGINT REFERENCES car (id) ON DELETE SET NULL    (set FK column to NULL on dependent rows)

  // 🎥 2.4 INNER JOIN — only matching rows (only people who have a car)
  innerJoinAll: `
    SELECT *
    FROM person
    JOIN car ON person.car_id = car.id;
  `,

  innerJoinSpecific: `
    SELECT person.first_name, car.make, car.model, car.price
    FROM person
    JOIN car ON person.car_id = car.id;
  `,

  // 🔮 For users/tasks:
  innerJoinUsersTasks: `
    SELECT tasks.title, tasks.is_done, users.email
    FROM tasks
    JOIN users ON tasks.user_id = users.id;
  `,

  // 🎥 2.5 LEFT JOIN — all rows from the left table, matched or not (includes people without a car)
  leftJoinAll: `
    SELECT *
    FROM person
    LEFT JOIN car ON car.id = person.car_id;
  `,

  // Find only the rows with no match (classic "find orphans" pattern):
  leftJoinOrphans: `
    SELECT * FROM person LEFT JOIN car ON car.id = person.car_id
    WHERE car.id IS NULL;
  `,

  // Equivalent shortcut when you don't need any car columns in output:
  leftJoinOrphansShortcut: `SELECT * FROM person WHERE car_id IS NULL;`,

  // 🔮 For users/tasks — e.g. list every user even those with zero tasks:
  leftJoinUsersTasks: `
    SELECT users.email, tasks.title
    FROM users
    LEFT JOIN tasks ON tasks.user_id = users.id;
  `,

  // 🔮 RIGHT JOIN — the mirror of LEFT JOIN: all rows from the right table,
  // matched or not. Rare in practice — almost anything written with RIGHT JOIN
  // can be rewritten as a LEFT JOIN by swapping table order, and most teams
  // standardize on LEFT JOIN for readability. Included for completeness:
  rightJoinExample: `
    SELECT users.email, tasks.title
    FROM tasks
    RIGHT JOIN users ON tasks.user_id = users.id;
  `,

  // 🔮 FULL OUTER JOIN — all rows from both sides, matched or not, with NULLs
  // filling the gaps on whichever side has no match. Used for reconciliation-
  // style queries (e.g. "which users have no tasks AND which tasks have no
  // valid user").
  fullOuterJoinExample: `
    SELECT users.email, tasks.title
    FROM users
    FULL OUTER JOIN tasks ON tasks.user_id = users.id;
  `,

  // 🔮 Self join — joining a table to itself, e.g. an employees table where
  // each row has a manager_id referencing another row in the same table.
  selfJoinExample: `
    SELECT employee.first_name AS employee_name, manager.first_name AS manager_name
    FROM employee
    JOIN employee AS manager ON employee.manager_id = manager.id;
  `,

  // 🎥 2.6 JOIN ... USING — shorthand when column names match on both sides
  joinUsingShorthand: `SELECT * FROM person JOIN car USING (car_uid);`
};


// =============================================================================
// TIER 3 — AGGREGATION & GROUPING (frequent — reporting, dashboards, counts)
// =============================================================================

const AGGREGATION = {
  // 🎥 GROUP BY + COUNT(*) — Count people per country
  groupByCountry: `
    SELECT country_of_birth, COUNT(*)
    FROM person
    GROUP BY country_of_birth
    ORDER BY country_of_birth;
  `,

  // 🎥 HAVING — filter after aggregation (only countries with 5 or more people).
  // WHERE would run before grouping and can't reference COUNT(*); HAVING runs after and can.
  havingFilter: `
    SELECT country_of_birth, COUNT(*)
    FROM person
    GROUP BY country_of_birth
    HAVING COUNT(*) >= 5
    ORDER BY country_of_birth;
  `,

  // 🎥 Single-value aggregates over the whole table (ROUND cleans up decimal noise)
  maxPrice: `SELECT MAX(price) FROM car;`,
  minPrice: `SELECT MIN(price) FROM car;`,
  avgPriceRounded: `SELECT ROUND(AVG(price)) FROM car;`,

  // 🎥 Aggregates grouped by column
  minPriceByMake: `SELECT make, MIN(price) FROM car GROUP BY make;`,
  avgPriceByMake: `SELECT make, ROUND(AVG(price)) FROM car GROUP BY make;`,

  // 🎥 SUM — total across all rows, or grouped
  sumPriceTotal: `SELECT SUM(price) FROM car;`,
  sumPriceByMake: `SELECT make, SUM(price) FROM car GROUP BY make;`,

  // 🔮 COUNT(DISTINCT ...) — count unique values of a column, not total rows.
  countDistinctMakes: `SELECT COUNT(DISTINCT make) FROM car;`,

  // 🎥 10.4 Subqueries (nested queries)
  // A subquery is a SELECT statement nested inside an outer query.
  // The inner query runs first and passes its result to the outer query.

  // 🎥 Scalar subquery (returns a single value — find cars costing more than average)
  scalarSubquery: `
    SELECT * 
    FROM car 
    WHERE price > (SELECT AVG(price) FROM car);
  `,

  // 🎥 List subquery with IN (returns a column of values — tasks owned by recent users)
  listSubquery: `
    SELECT * 
    FROM tasks 
    WHERE user_id IN (
        SELECT id 
        FROM users 
        WHERE created_at >= '2026-01-01'
    );
  `,

  // 🎥 Subqueries with EXISTS (checks for matching rows — users with completed tasks)
  existsSubquery: `
    SELECT email 
    FROM users 
    WHERE EXISTS (
        SELECT 1 
        FROM tasks 
        WHERE tasks.user_id = users.id 
          AND tasks.is_done = true
    );
  `,

  // 🔮 CTE (Common Table Expression / WITH clause) — names a subquery so it can
  // be referenced like a temporary table, run once, and reused. Makes multi-step
  // queries far more readable than nesting subqueries inside subqueries. This is
  // the same WITH ... AS pattern used for seeding (Tier 4), just applied to reads.
  cteExample: `
    WITH user_task_counts AS (
        SELECT user_id, COUNT(*) AS task_count
        FROM tasks
        GROUP BY user_id
    )
    SELECT users.email, user_task_counts.task_count
    FROM users
    JOIN user_task_counts ON user_task_counts.user_id = users.id
    WHERE user_task_counts.task_count > 5;
  `
};


// =============================================================================
// TIER 4 — SCHEMA DEFINITION & CONSTRAINTS (frequent whenever you're designing
// or evolving tables — less constant than querying, but still routine)
// =============================================================================

// --- 4.1 Creating tables --------------------------------------------------
// Common data types reference:
// - INT / INTEGER: 4-byte whole number (🎥 plain numeric column)
// - BIGINT: 8-byte whole number (🎥 large numbers)
// - SERIAL: auto-incrementing 4-byte int backed by sequence (🎥 small-table PKs)
// - BIGSERIAL: auto-incrementing 8-byte int backed by sequence (🎥 typical PK choice)
// - VARCHAR(n): variable-length string, max n chars (🎥 names, emails)
// - TEXT: variable-length string, no max length (🎥 long free text)
// - DATE: year, month, day only (🎥 date_of_birth)
// - TIMESTAMP: date + time + milliseconds (🎥 created_at)
// - TIMESTAMP WITH TIME ZONE: timestamp + timezone offset (🎥 mentioned in docs walkthrough)
// - TIME: time only (🎥 mentioned in docs walkthrough)
// - BOOLEAN: true/false (🎥 mentioned in docs walkthrough)
// - NUMERIC(precision, scale): exact decimal no rounding error (🎥 price NUMERIC(19,2))
// - MONEY: currency-formatted number (🎥 mentioned in docs walkthrough)
// - JSON / JSONB: raw JSON text vs. optimized binary JSON (🎥 JSON mentioned in docs walkthrough;
//   🔮 JSONB added — see Video 12 notes: prefer jsonb for anything you'll actually query)
// - UUID: universally unique identifier (🎥 alt. PK type, see Tier 9)
// - XML: XML data (🎥 mentioned in docs walkthrough)

const CREATE_TABLES = {
  // 🎥 Basic CREATE TABLE (no constraints)
  basicPerson: `
    CREATE TABLE person (
        id INT,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        gender VARCHAR(7),
        date_of_birth DATE
    );
  `,

  // 🎥 CREATE TABLE with constraints (the version you actually want)
  constrainedPerson: `
    CREATE TABLE person (
        id BIGSERIAL NOT NULL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        gender VARCHAR(7) NOT NULL,
        date_of_birth DATE NOT NULL,
        email VARCHAR(150)          -- nullable: not everyone has an email
    );
  `,

  // 🎥 IRREVERSIBLE, drops the table and all its data
  dropTable: `DROP TABLE person;`
};

// --- 4.2 Constraints --------------------------------------------------
const CONSTRAINTS = {
  // 🎥 Primary key set at creation time — see 4.1

  // 🎥 Drop an existing constraint by name (find the name via \d tablename)
  dropPkConstraint: `ALTER TABLE person DROP CONSTRAINT person_pkey;`,

  // 🎥 Add a primary key after the fact — fails if any duplicate values already exist
  addPkConstraint: `ALTER TABLE person ADD PRIMARY KEY (id);`,

  // 🎥 Add unique, giving the constraint an explicit name
  addUniqueNamed: `ALTER TABLE person ADD CONSTRAINT unique_email_address UNIQUE (email);`,

  // 🎥 Add unique, letting Postgres auto-name the constraint
  addUniqueAuto: `ALTER TABLE person ADD UNIQUE (email);`,

  // 🎥 Drop constraint by name
  dropUniqueConstraint: `ALTER TABLE person DROP CONSTRAINT unique_email_address;`,

  // 🎥 Check constraint — enforces a boolean rule on every row (fails if existing rows violate it)
  addCheckConstraint: `
    ALTER TABLE person
    ADD CONSTRAINT gender_constraint
    CHECK (gender = 'female' OR gender = 'male');
  `
};

// --- 4.3 Altering tables (columns) --------------------------------------------------
// 🔮 Entire section added — the video covered constraints via ALTER TABLE but
// never column-level changes, which come up constantly once a schema is live.
const ALTER_TABLE_COLUMNS = {
  // 🔮 Add a new column (nullable by default — adding NOT NULL to a table with
  // existing rows fails unless you also provide a DEFAULT)
  addColumn: `ALTER TABLE person ADD COLUMN phone_number VARCHAR(20);`,

  // 🔮 Add a column with a default so existing rows aren't left NULL
  addColumnWithDefault: `ALTER TABLE tasks ADD COLUMN is_done BOOLEAN NOT NULL DEFAULT false;`,

  // 🔮 Drop a column entirely — irreversible, drops the data in it too
  dropColumn: `ALTER TABLE person DROP COLUMN phone_number;`,

  // 🔮 Rename a column
  renameColumn: `ALTER TABLE person RENAME COLUMN gender TO sex;`,

  // 🔮 Rename a table
  renameTable: `ALTER TABLE person RENAME TO people;`,

  // 🔮 Change a column's type (Postgres can auto-cast simple conversions;
  // complex ones may need USING to specify how to convert existing data)
  alterColumnType: `ALTER TABLE person ALTER COLUMN email TYPE TEXT;`,

  // 🔮 Set / drop NOT NULL after the fact
  setNotNull: `ALTER TABLE person ALTER COLUMN email SET NOT NULL;`,
  dropNotNull: `ALTER TABLE person ALTER COLUMN email DROP NOT NULL;`
};

// --- 4.4 Indexes --------------------------------------------------
// 🔮 Entire section added — the Video 12 notes explained the *concept* of
// indexes in depth but never gave the actual CREATE INDEX syntax.
const INDEXES = {
  // 🔮 Basic index on a single column (speeds up WHERE / JOIN / ORDER BY on that field)
  createIndex: `CREATE INDEX idx_person_email ON person (email);`,

  // 🔮 Unique index — same as a UNIQUE constraint, expressed as an index directly
  createUniqueIndex: `CREATE UNIQUE INDEX idx_person_email_unique ON person (email);`,

  // 🔮 Index matching a specific sort direction, for queries that always ORDER BY DESC
  createDescIndex: `CREATE INDEX idx_tasks_created_at ON tasks (created_at DESC);`,

  // 🔮 Composite index — covers queries that filter/sort on both columns together
  createCompositeIndex: `CREATE INDEX idx_tasks_user_status ON tasks (user_id, status);`,

  // 🔮 Drop an index
  dropIndex: `DROP INDEX idx_person_email;`,

  // 🔮 List all indexes on a table via psql meta-command: \d person
};


// =============================================================================
// TIER 5 — DATA INTEGRITY / SPECIAL VALUES (used often once queries get past
// the trivial stage — nulls, conditional logic, conflict handling)
// =============================================================================

// --- 5.1 Handling NULLs --------------------------------------------------
const NULL_HANDLING = {
  // 🎥 COALESCE returns the first non-null value in the list — good for default values
  coalesceEmail: `SELECT COALESCE(email, 'email not provided') FROM person;`,

  // 🎥 NULLIF returns NULL if two arguments are equal, otherwise returns the first —
  // classic use: prevent division-by-zero errors
  nullIfPreventZero: `SELECT 10 / NULLIF(0, 0);`,              // returns NULL instead of throwing
  nullIfWithFallback: `SELECT COALESCE(10 / NULLIF(0, 0), 0);`  // returns 0 as final fallback
};

// --- 5.2 Conditional logic — CASE WHEN --------------------------------------------------
// 🔮 Entire section added — CASE WHEN is one of the most commonly used pieces of
// SQL in real apps (turning raw values into labels/buckets) and wasn't in the
// original reference at all.
const CASE_WHEN = {
  // 🔮 Basic CASE — label rows based on a condition
  labelByPrice: `
    SELECT make, model, price,
           CASE
               WHEN price < 10000 THEN 'budget'
               WHEN price BETWEEN 10000 AND 30000 THEN 'mid-range'
               ELSE 'premium'
           END AS price_tier
    FROM car;
  `,

  // 🔮 CASE inside an aggregate — a very common "conditional count" pattern
  // (count tasks that are done vs. not, in one query instead of two)
  conditionalCount: `
    SELECT
        COUNT(*) FILTER (WHERE is_done = true)  AS done_count,
        COUNT(*) FILTER (WHERE is_done = false) AS pending_count
    FROM tasks;
  `
};

// --- 5.3 Conflict handling (upsert) --------------------------------------------------
const UPSERT = {
  // 🎥 Silently skip the insert if it would violate a unique/PK constraint
  onConflictDoNothing: `
    INSERT INTO person (id, first_name, last_name, gender, email, date_of_birth, country_of_birth)
    VALUES (2017, 'Russ', 'Cassidy', 'male', 'russ@example.com', DATE '1952-09-25', 'Norway')
    ON CONFLICT (id) DO NOTHING;
  `,

  // 🎥 Upsert: on conflict, update instead of failing.
  // EXCLUDED refers to the row that was *about to be* inserted.
  onConflictDoUpdate: `
    INSERT INTO person (id, first_name, last_name, gender, email, date_of_birth, country_of_birth)
    VALUES (2017, 'Russ', 'Cassidy', 'male', 'russ.new@example.com', DATE '1952-09-25', 'Norway')
    ON CONFLICT (id)
    DO UPDATE SET
        email      = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name  = EXCLUDED.last_name;
  `
};

// --- 5.4 Removing duplicates — DISTINCT --------------------------------------------------
const DISTINCT_DATA = {
  // 🎥 Unique country values only
  uniqueCountries: `SELECT DISTINCT country_of_birth FROM person ORDER BY country_of_birth;`
};


// =============================================================================
// TIER 6 — DATES, STRINGS, ARITHMETIC (moderate — formatting/computing values,
// not the shape of the query itself)
// =============================================================================

// --- 6.1 Dates & timestamps --------------------------------------------------
const DATES_AND_TIMESTAMPS = {
  // 🎥 Current timestamp
  now: `SELECT NOW();`,

  // 🎥 Cast a timestamp down to just date or just time
  castToDate: `SELECT NOW()::date;`,
  castToTime: `SELECT NOW()::time;`,

  // 🎥 Date arithmetic with INTERVAL
  subOneYear: `SELECT NOW() - INTERVAL '1 year';`,
  subTenYears: `SELECT NOW() - INTERVAL '10 years';`,
  subTenMonths: `SELECT NOW() - INTERVAL '10 months';`,
  subTenDays: `SELECT NOW() - INTERVAL '10 days';`,
  addTenDays: `SELECT NOW() + INTERVAL '10 days';`,
  subOneYearCastDate: `SELECT (NOW() - INTERVAL '1 year')::date;`,   // cast whole expression to date only

  // 🎥 EXTRACT — pull a single field out of a timestamp
  extractYear: `SELECT EXTRACT(YEAR FROM NOW());`,
  extractMonth: `SELECT EXTRACT(MONTH FROM NOW());`,
  extractDay: `SELECT EXTRACT(DAY FROM NOW());`,
  extractDow: `SELECT EXTRACT(DOW FROM NOW());`,       // day of week, Sunday = 0
  extractCentury: `SELECT EXTRACT(CENTURY FROM NOW());`,

  // 🎥 AGE — the actual age between two timestamps/dates
  ageCalc: `
    SELECT first_name, last_name, date_of_birth,
           AGE(NOW(), date_of_birth) AS age
    FROM person;
  `
};

// --- 6.2 Arithmetic operators & Aliasing --------------------------------------------------
const ARITHMETIC = {
  // 🎥 Standard arithmetic — usable standalone or on table columns
  add: `SELECT 10 + 2;`,   // 12
  sub: `SELECT 10 - 2;`,   // 8
  mul: `SELECT 10 * 2;`,   // 20
  div: `SELECT 10 / 2;`,   // 5
  pow: `SELECT 10 ^ 2;`,   // 100 (power)
  fac: `SELECT 5 !;`,      // 120 (factorial)
  mod: `SELECT 10 % 3;`,   // 1  (modulus / remainder)

  // 🎥 Applied to a column, with rounding and aliasing
  calcColumns: `
    SELECT id, make, model, price,
           ROUND(price * 0.10, 2) AS ten_percent_value,
           ROUND(price - (price * 0.10), 2) AS discounted_price
    FROM car;
  `,

  // 🎥 AS — column aliasing (without AS, Postgres names the column after the function e.g. "round")
  aliasing: `SELECT ROUND(AVG(price), 2) AS average_price FROM car;`
};

// --- 6.3 String functions --------------------------------------------------
// 🔮 Entire section added — string manipulation is extremely common (cleaning
// input, building display names, case-insensitive comparisons) but wasn't
// covered anywhere in the original reference.
const STRING_FUNCTIONS = {
  // 🔮 Concatenation — || operator or CONCAT()
  concatOperator: `SELECT first_name || ' ' || last_name AS full_name FROM person;`,
  concatFunction: `SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM person;`,

  // 🔮 Case conversion
  upper: `SELECT UPPER(email) FROM person;`,
  lower: `SELECT LOWER(email) FROM person;`,

  // 🔮 Trimming whitespace (common when cleaning up user-submitted input)
  trim: `SELECT TRIM(email) FROM person;`,

  // 🔮 Length of a string
  length: `SELECT LENGTH(email) FROM person;`,

  // 🔮 Substring extraction
  substring: `SELECT SUBSTRING(email FROM 1 FOR 5) FROM person;`,

  // 🔮 Replace occurrences of a substring
  replace: `SELECT REPLACE(email, '@gmail.com', '@company.com') FROM person;`
};


// =============================================================================
// TIER 7 — TRANSACTIONS & PERFORMANCE INSPECTION (important, but touched less
// often than day-to-day queries — usually only for multi-step writes or when
// diagnosing a slow query)
// =============================================================================

// --- 7.1 Transactions --------------------------------------------------
// 🔮 Entire section added — the original reference had no transaction syntax
// at all, despite it being essential any time more than one write needs to
// succeed or fail together (e.g. creating a user AND their profile row).
const TRANSACTIONS = {
  // 🔮 Wrap multiple statements so they all succeed or all roll back together
  basicTransaction: `
    BEGIN;
    INSERT INTO users (email, password_hash) VALUES ('a@example.com', '...');
    INSERT INTO user_profiles (user_id, bio) VALUES (currval('users_id_seq'), 'Hello!');
    COMMIT;
  `,

  // 🔮 Roll back manually if something goes wrong mid-transaction
  rollbackExample: `
    BEGIN;
    UPDATE person SET email = 'broken' WHERE id = 1;
    ROLLBACK;   -- undoes the UPDATE above; nothing is persisted
  `,

  // 🔮 SAVEPOINT — a rollback point *within* a transaction, so you can undo
  // part of it without discarding the whole thing
  savepointExample: `
    BEGIN;
    INSERT INTO person (first_name) VALUES ('Anne');
    SAVEPOINT before_risky_update;
    UPDATE person SET email = 'maybe-bad' WHERE first_name = 'Anne';
    ROLLBACK TO SAVEPOINT before_risky_update;
    COMMIT;
  `
};

// --- 7.2 Query performance inspection --------------------------------------------------
// 🔮 Entire section added — directly relevant to the indexing concepts already
// learned (Video 12 notes / Roadmap item 40), but no actual command was given.
const QUERY_PERFORMANCE = {
  // 🔮 See the query plan Postgres WOULD use, without running it
  explain: `EXPLAIN SELECT * FROM person WHERE email = 'jake@gmail.com';`,

  // 🔮 Actually run the query and show real timing + row counts alongside the plan
  explainAnalyze: `EXPLAIN ANALYZE SELECT * FROM person WHERE email = 'jake@gmail.com';`
};


// =============================================================================
// TIER 8 — SET OPERATIONS & ADVANCED QUERIES (occasional — reporting, dedup
// across queries, ranking within groups)
// =============================================================================

// 🔮 Entire section added.
const SET_OPERATIONS_AND_WINDOW_FUNCTIONS = {
  // 🔮 UNION — combine results of two queries, removing duplicates
  union: `
    SELECT email FROM users
    UNION
    SELECT email FROM newsletter_subscribers;
  `,

  // 🔮 UNION ALL — same, but keeps duplicates (cheaper, since no dedup pass is needed)
  unionAll: `
    SELECT email FROM users
    UNION ALL
    SELECT email FROM newsletter_subscribers;
  `,

  // 🔮 Window function — ROW_NUMBER: number rows within groups without
  // collapsing them the way GROUP BY would (e.g. rank each user's tasks by
  // creation date, without losing individual task rows)
  rowNumberExample: `
    SELECT
        title,
        user_id,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS task_number
    FROM tasks;
  `,

  // 🔮 Window function — RANK: like ROW_NUMBER but ties share the same rank
  rankExample: `
    SELECT make, price,
           RANK() OVER (ORDER BY price DESC) AS price_rank
    FROM car;
  `
};


// =============================================================================
// TIER 9 — IDENTIFIER STRATEGIES (one-time decisions per table, not everyday syntax)
// =============================================================================

// --- 9.1 Sequences (the mechanism behind SERIAL/BIGSERIAL) --------------------------------------------------
const SEQUENCES = {
  // 🎥 Inspect the sequence backing a table's id column
  inspectSeq: `SELECT * FROM person_id_seq;`,

  // 🎥 Manually advance the sequence (rarely needed directly)
  advanceSeq: `SELECT NEXTVAL('person_id_seq');`,

  // 🎥 Reset the sequence to start counting from a given value
  resetSeq: `ALTER SEQUENCE person_id_seq RESTART WITH 10;`
};

// --- 9.2 UUID as an alternative primary key --------------------------------------------------
// Why UUIDs, per the video: unguessable (an attacker can't enumerate /users/1, /users/2)
// and globally unique, so merging data from two databases never collides on id.
// Tradeoff not mentioned in video: UUIDs are larger (16 bytes vs 8) and don't sort
// chronologically the way BIGSERIAL does, which matters for index performance at scale.

const UUID_OPERATIONS = {
  // 🎥 Enable the extension once per database (idempotent — safe to re-run)
  enableExtension: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,

  // 🎥 List available functions after enabling, to confirm it worked (\df in psql shell)

  // 🎥 Generate a random (v4) UUID
  generateUuid: `SELECT uuid_generate_v4();`,

  // 🎥 Use UUID as a primary key instead of BIGSERIAL
  createCarUuidTable: `
    CREATE TABLE car (
        car_uid UUID NOT NULL PRIMARY KEY,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        price NUMERIC(19, 2) NOT NULL
    );
  `,

  createPersonUuidTable: `
    CREATE TABLE person (
        person_uid UUID NOT NULL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        gender VARCHAR(7) NOT NULL,
        date_of_birth DATE NOT NULL,
        email VARCHAR(150),
        car_uid UUID REFERENCES car (car_uid) UNIQUE
    );
  `,

  // 🎥 Inserting with a generated UUID
  insertWithUuid: `
    INSERT INTO car (car_uid, make, model, price)
    VALUES (uuid_generate_v4(), 'Ford', 'Focus', 18000.00);
  `
};


// =============================================================================
// TIER 10 — ADMIN / TOOLING (rare — done once per setup, or when exploring/
// exporting, not part of normal app-code queries)
// =============================================================================

// --- 10.1 Connecting & navigating (psql meta-commands) --------------------------------------------------
// Everything here is run inside the psql shell, not as SQL — that's why none of these
// end in a semicolon.
//
// 🎥 psql                                                 -- Connect using defaults (host/port/user/db all default to your OS user)
// 🎥 psql -h localhost -p 5432 -U amigoscode test        -- Connect with explicit connection options
// 🎥 psql --help                                         -- Show all connection flags
// 🎥 \?                                                  -- Show all psql meta-commands
// 🎥 \q                                                  -- Quit psql
// 🎥 \l                                                  -- List all databases
// 🎥 \c test                                             -- Connect to a different database
// 🎥 \d                                                  -- List all relations (tables + sequences)
// 🎥 \dt                                                 -- List tables only (no sequences)
// 🎥 \d person                                           -- Describe a table: columns, types, constraints, indexes
// 🎥 \i /Users/amigoscode/downloads/person.sql          -- Execute a .sql file as a batch
// 🎥 \x                                                  -- Toggle expanded display (one column per line — good for wide rows)
// 🎥 Ctrl+L                                              -- Clear the terminal screen

// --- 10.2 Database-level commands --------------------------------------------------
const DATABASE_COMMANDS = {
  // 🎥 Create a database
  createDb: `CREATE DATABASE test;`,

  // 🎥 Delete a database — IRREVERSIBLE, never run on production
  dropDb: `DROP DATABASE test;`
};

// --- 10.3 Exporting query results to CSV --------------------------------------------------
// 🎥 \copy runs on the client side (no server file-permission issues)
const EXPORT_CSV = {
  copyToCsv: `\\copy (SELECT * FROM person LEFT JOIN car ON car.id = person.car_id) TO '/Users/amigoscode/desktop/results.csv' DELIMITER ',' CSV HEADER;`
};

// --- 10.4 Discovery commands for exploring Postgres itself --------------------------------------------------
const DISCOVERY = {
  // 🎥 List all installable extensions
  listExtensions: `SELECT * FROM pg_available_extensions;`
  // 🎥 psql meta-command to list functions currently available: \df
};


// =============================================================================
// Quick-reference: statement order in a full SELECT
// =============================================================================
// 🎥 Logical order Postgres expects clauses in:
//
// SELECT columns
// FROM table
// JOIN other_table ON condition
// WHERE row_filter
// GROUP BY columns
// HAVING group_filter
// ORDER BY columns
// LIMIT n OFFSET m;
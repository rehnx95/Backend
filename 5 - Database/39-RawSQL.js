/* 
================================================================================
# Postgres Complete Reference (JS Edition)
*/

// =============================================================================
// 1. Connecting & navigating (psql meta-commands)
// =============================================================================
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

// =============================================================================
// 2. Database-level commands
// =============================================================================
const DATABASE_COMMANDS = {
  // 🎥 Create a database
  createDb: `CREATE DATABASE test;`,

  // 🎥 Delete a database — IRREVERSIBLE, never run on production
  dropDb: `DROP DATABASE test;`
};

// =============================================================================
// 3. Creating tables
// =============================================================================
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
// - JSON: raw JSON text (🎥 mentioned in docs walkthrough)
// - UUID: universally unique identifier (🎥 alt. PK type, see Section 20)
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

// =============================================================================
// 4. Inserting data
// =============================================================================
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
  `
};

// =============================================================================
// 5. Reading data — SELECT
// =============================================================================
const READ_DATA = {
  // 🎥 Every column
  selectAll: `SELECT * FROM person;`,

  // 🎥 Specific columns
  selectColumns: `SELECT first_name, last_name FROM person;`,

  // 🎥 Single column
  selectSingle: `SELECT email FROM person;`
};

// =============================================================================
// 6. Sorting — ORDER BY
// =============================================================================
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

// =============================================================================
// 7. Removing duplicates — DISTINCT
// =============================================================================
const DISTINCT_DATA = {
  // 🎥 Unique country values only
  uniqueCountries: `SELECT DISTINCT country_of_birth FROM person ORDER BY country_of_birth;`
};

// =============================================================================
// 8. Filtering — WHERE
// =============================================================================
// Comparison operators (🎥 can be used standalone e.g. SELECT 1 = 1; or inside WHERE):
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
  ilikeCaseInsensitive: `SELECT * FROM person WHERE country_of_birth ILIKE 'p%';`
};

// =============================================================================
// 9. Limiting results
// =============================================================================
const LIMITING = {
  // 🎥 First 10 rows
  limitTen: `SELECT * FROM person LIMIT 10;`,

  // 🎥 Skip the first 5, then take the next 5 (rows 6–10)
  offsetAndLimit: `SELECT * FROM person OFFSET 5 LIMIT 5;`,

  // 🎥 SQL-standard equivalent of LIMIT (LIMIT is not standard SQL, FETCH is)
  fetchStandard: `SELECT * FROM person OFFSET 5 FETCH FIRST 5 ROW ONLY;`
};

// =============================================================================
// 10. Aggregation
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

  // 🔮 10.4 Subqueries (nested queries)
  // A subquery is a SELECT statement nested inside an outer query.
  // The inner query runs first and passes its result to the outer query.

  // 🔮 10.4.1 Scalar subquery (returns a single value — find cars costing more than average)
  scalarSubquery: `
    SELECT * 
    FROM car 
    WHERE price > (SELECT AVG(price) FROM car);
  `,

  // 🔮 10.4.2 List subquery with IN (returns a column of values — tasks owned by recent users)
  listSubquery: `
    SELECT * 
    FROM tasks 
    WHERE user_id IN (
        SELECT id 
        FROM users 
        WHERE created_at >= '2026-01-01'
    );
  `,

  // 🔮 10.4.3 Subqueries with EXISTS (checks for matching rows — users with completed tasks)
  existsSubquery: `
    SELECT email 
    FROM users 
    WHERE EXISTS (
        SELECT 1 
        FROM tasks 
        WHERE tasks.user_id = users.id 
          AND tasks.is_done = true
    );
  `
};

// =============================================================================
// 11. Arithmetic operators & Aliasing
// =============================================================================
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

// =============================================================================
// 12. Handling NULLs
// =============================================================================
const NULL_HANDLING = {
  // 🎥 COALESCE returns the first non-null value in the list — good for default values
  coalesceEmail: `SELECT COALESCE(email, 'email not provided') FROM person;`,

  // 🎥 NULLIF returns NULL if two arguments are equal, otherwise returns the first —
  // classic use: prevent division-by-zero errors
  nullIfPreventZero: `SELECT 10 / NULLIF(0, 0);`,              // returns NULL instead of throwing
  nullIfWithFallback: `SELECT COALESCE(10 / NULLIF(0, 0), 0);`  // returns 0 as final fallback
};

// =============================================================================
// 13. Dates & timestamps
// =============================================================================
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

// =============================================================================
// 14. Constraints
// =============================================================================
const CONSTRAINTS = {
  // 🎥 Primary key set at creation time — see Section 3

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

// =============================================================================
// 15. Deleting & updating records
// =============================================================================
// 🎥 Always use WHERE, or you delete/update every row in the table!

const MUTATIONS = {
  // 🎥 Deleting rows
  deleteSingle: `DELETE FROM person WHERE id = 1011;`,
  deleteMultiCondition: `DELETE FROM person WHERE gender = 'female' AND country_of_birth = 'Nigeria';`,

  // 🎥 Updating rows
  updateSingleColumn: `UPDATE person SET email = 'omar@gmail.com' WHERE id = 2011;`,
  updateMultipleColumns: `
    UPDATE person
    SET first_name = 'Omar', last_name = 'Montana', email = 'omar.montana@hotmail.com'
    WHERE id = 2011;
  `
};

// =============================================================================
// 16. Conflict handling (upsert)
// =============================================================================
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

// =============================================================================
// 17. Foreign keys & relationships — ★ the part you need for users -> tasks
// =============================================================================
const FOREIGN_KEYS_AND_JOINS = {
  // 🎥 17.1 Defining a foreign key at table-creation time
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

  // 🎥 17.2 Assigning a foreign key value via UPDATE
  assignFkValue: `UPDATE person SET car_id = 2 WHERE id = 1;`,

  // 🎥 17.3 Deleting a row that's still referenced
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

  // 🎥 17.4 INNER JOIN — only matching rows (only people who have a car)
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

  // 🎥 17.5 LEFT JOIN — all rows from the left table, matched or not (includes people without a car)
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

  // 🎥 17.6 JOIN ... USING — shorthand when column names match on both sides
  joinUsingShorthand: `SELECT * FROM person JOIN car USING (car_uid);`
};

// =============================================================================
// 18. Exporting query results to CSV
// =============================================================================
// 🎥 \copy runs on the client side (no server file-permission issues)
const EXPORT_CSV = {
  copyToCsv: `\\copy (SELECT * FROM person LEFT JOIN car ON car.id = person.car_id) TO '/Users/amigoscode/desktop/results.csv' DELIMITER ',' CSV HEADER;`
};

// =============================================================================
// 19. Sequences (the mechanism behind SERIAL/BIGSERIAL)
// =============================================================================
const SEQUENCES = {
  // 🎥 Inspect the sequence backing a table's id column
  inspectSeq: `SELECT * FROM person_id_seq;`,

  // 🎥 Manually advance the sequence (rarely needed directly)
  advanceSeq: `SELECT NEXTVAL('person_id_seq');`,

  // 🎥 Reset the sequence to start counting from a given value
  resetSeq: `ALTER SEQUENCE person_id_seq RESTART WITH 10;`
};

// =============================================================================
// 20. UUID as an alternative primary key
// =============================================================================
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
// 21. Discovery commands for exploring Postgres itself
// =============================================================================
const DISCOVERY = {
  // 🎥 List all installable extensions
  listExtensions: `SELECT * FROM pg_available_extensions;`
  // 🎥 psql meta-command to list functions currently available: \df
};

// =============================================================================
// Quick-reference: statement order in a full SELECT
// =============================================================================
// 🔮 Logical order Postgres expects clauses in:
//
// SELECT columns
// FROM table
// JOIN other_table ON condition
// WHERE row_filter
// GROUP BY columns
// HAVING group_filter
// ORDER BY columns
// LIMIT n OFFSET m;


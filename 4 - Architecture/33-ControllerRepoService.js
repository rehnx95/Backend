/*
=====================================================================
 VIDEO 10 — Handlers/Controllers, Services, Repositories,
 Middleware, Request Context (Full Reference Summary)
=====================================================================

These three topics are covered together because they're tightly
connected: the layered architecture pattern, middleware, and
request context.


1. THE REQUEST LIFE CYCLE, TOP TO BOTTOM
---------------------------------------------------------------
When a request hits your server:

  entry point → routing (matches URL to a handler) → handler/
  controller → service → repository → back up through service →
  controller → response sent to client


2. HANDLER / CONTROLLER LAYER
---------------------------------------------------------------
The first thing that touches a matched request. Responsibilities:

- Extract data from the request — query params (GET), body
  (POST/PUT/PATCH/DELETE), path params — whatever the request
  type needs.
- Deserialize the incoming JSON into your language's native
  format. In Node/Express this mostly happens automatically via
  express.json() middleware, so you don't do it by hand — in Go
  or Python you would.
- Validate and transform the data (this is Video 9's content,
  applied here specifically — right after deserializing, before
  calling the service layer).
- Call the service layer, passing the cleaned data plus any
  relevant context (like the authenticated user's ID/role).
- Send the response — the controller decides the status code
  (200-series for success, 400 for client error, 500 for server
  error) and formats the final response to the client.

Key principle: the controller owns everything HTTP-related —
status codes, request/response shape. It should not contain
business logic itself.


3. SERVICE LAYER
---------------------------------------------------------------
Pure business logic, no HTTP awareness at all — a good service
function should be impossible to tell "this is used in a web API"
just by reading it. It receives already-validated data from the
controller and:

- Calls one or more repository methods for database work
- Can orchestrate multiple repository calls together, merge
  results, call external APIs, send emails/notifications
- Returns processed data back to the controller — no status
  codes, no response formatting, none of that is its job


4. REPOSITORY LAYER
---------------------------------------------------------------
The only layer that talks to the database. Single responsibility
per method: one method = one kind of database operation, returning
one kind of result.

Example given: don't make one method that conditionally returns
either "all books" or "a single book" depending on an optional
parameter — split those into two separate repository methods.
Repository methods take data, build a query, execute it, return
the result. Nothing more.


5. WHY SPLIT INTO THREE LAYERS AT ALL
---------------------------------------------------------------
Not a hard requirement — you could put everything in one function
— but this separation makes a codebase more scalable, maintainable,
easier to debug, and easier to extend.


6. MIDDLEWARE
---------------------------------------------------------------
A function that sits between the major boundaries of the request
life cycle — before routing, between routing and the handler, or
after the handler but before the response is sent.

Middleware receives three things: req, res, and next() — calling
next() passes execution forward to whatever comes next (another
middleware, routing, or the handler). Middleware is entirely
optional and can be skipped — a request could theoretically go
straight from routing to the handler with zero middleware in
between.

Why middleware exists: to avoid duplicating the same logic across
every single handler.


7. COMMON MIDDLEWARE EXAMPLES
---------------------------------------------------------------
- CORS — checks the request's origin, adds the appropriate headers
  if allowed, placed early so disallowed requests get stopped
  immediately.
- Security headers — adds headers like CSP to every response.
- Authentication — extracts and verifies a token; on failure,
  sends 401 immediately and stops the request right there without
  reaching the handler; on success, attaches user info (ID, role)
  to the request context and calls next().
- Rate limiting — tracks requests per client (often by IP)
  against a threshold; sends 429 Too Many Requests if exceeded.
- Logging/monitoring — records details of each request (path,
  method, params) for debugging and auditing.
- Global error handling — placed last in the middleware chain,
  catches any error from anywhere in the request lifecycle
  (handler, service, other middleware) and formats a consistent
  error response. It must be last, because middleware order is
  one-directional — an error handler placed earlier in the chain
  has no way to catch errors that happen later.
- Compression — compresses large responses (e.g. with gzip)
  before sending.


8. MIDDLEWARE ORDERING
---------------------------------------------------------------
Ordering matters a lot — middleware executes in the order it's
registered, and that order should reflect priority: CORS and
security checks early (so bad requests get rejected before wasting
resources), logging/auth in the middle, error handling always
last.


9. REQUEST CONTEXT
---------------------------------------------------------------
A storage/state object scoped to a single request, accessible
across all the middleware and handler functions processing that
request, without those functions needing to be tightly coupled or
pass values around manually as parameters.

Typical use case: the authentication middleware verifies a token,
extracts the user's ID and role, and stores that in the request
context. Later, deep in the handler, that same ID can be read back
out — critically, this means the handler uses the authenticated
user ID from the context, not a user ID the client might have sent
in the request body, which prevents a malicious client from
claiming to be a different user.

Other uses: generating a unique request ID early in the chain
(e.g. a UUID) and storing it in context so it can be logged
consistently across every step of that request's lifecycle —
useful for tracing a single request's path through a microservice
architecture. Also used for passing cancellation signals, abort
signals, or deadlines down to whatever the request eventually
calls.
=====================================================================
*/
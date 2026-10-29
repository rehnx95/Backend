/*
=====================================================================
 VIDEO 11 — Complete REST API Design (Full Reference Summary)
=====================================================================

1. WHY STANDARDS EXIST
---------------------------------------------------------------
Backend engineers constantly face the same small decisions —
plural or singular URLs, PATCH or PUT, which status code fits
which case. Without a shared standard, every engineer answers
these differently, and integrating with an API becomes guesswork.
REST isn't new rules invented for this video — it's an established
convention, extracted here into practical guidelines so these
decisions stop being re-litigated on every project.


2. HISTORICAL CONTEXT
---------------------------------------------------------------
Tim Berners-Lee started the World Wide Web project in 1990,
inventing URIs, HTTP, HTML, the first web server, browser, and
HTML editor within about a year. As usage grew exponentially, the
web hit a scalability crisis it wasn't designed for. Around 1993,
Roy Fielding (co-founder of the Apache HTTP server project)
proposed six architectural constraints to address this:

1. Client-server — separates UI concerns (client) from data/business
   logic (server), letting each evolve independently.
2. Uniform interface — a standardized way components communicate,
   covering resource identification, resource manipulation through
   representations, self-descriptive messages, and hypermedia as
   the engine of application state.
3. Layered system — architecture built in hierarchical layers, each
   only interacting with the layer directly below it, enabling
   things like load balancers and proxies without disrupting core
   functionality.
4. Cacheable — responses must be explicitly labeled cacheable or
   not, letting clients reduce server load and improve speed.
5. Stateless — every request must carry all information needed to
   process it; the server retains no memory between requests. This
   is what lets any server in a load-balanced cluster handle any
   request.
6. Code on demand (optional) — servers can send executable code to
   extend client functionality; rarely used compared to the other
   five.

Fielding later worked with Berners-Lee to standardize HTTP 1.1, and
in 2000 described this architectural style in his PhD dissertation,
naming it REST (Representational State Transfer).


3. WHAT "REST" MEANS, BROKEN INTO ITS THREE WORDS
---------------------------------------------------------------
- Representational — the same resource can be represented in
  different formats depending on context: JSON for APIs/server-to-
  server, HTML for browser-rendered pages, sometimes XML.
- State — the current condition/attributes of a resource that get
  transferred between client and server.
- Transfer — the actual movement of these representations between
  client and server, via HTTP methods.


4. URL ANATOMY
---------------------------------------------------------------
General URLs break into: scheme → authority/domain → resource path
(hierarchical, separated by /) → query parameters → fragment.

A typical API URL: https://api.example.com/v1/resource — secure
scheme, api. subdomain by convention, a version segment, then the
resource path.

Resource naming rules:
- Always plural, even for single-item routes (/books/123, never
  /book/123) — the plural refers to the collection, not the count
  returned.
- Always lowercase — URLs travel across different servers, clients,
  and operating systems that may handle case inconsistently.
- No spaces or underscores; human-readable identifiers become slugs
  (lowercase, spaces replaced with hyphens).
- Each / represents a hierarchical relationship between resources.


5. IDEMPOTENCY
---------------------------------------------------------------
A method is idempotent if repeating the same request produces the
same server state as calling it once.

- GET — idempotent; fetching never changes anything.
- PUT — idempotent; full replacement with the same payload yields
  the same end state every time.
- PATCH — idempotent for the same reason, when applying the same
  partial update repeatedly.
- DELETE — idempotent; the first call has the real effect, every
  call after just fails against an already-deleted resource with
  no further state change.
- POST — NOT idempotent; a typical "create" POST generates a new
  resource with a new ID on every call, even with an identical
  payload.

PUT vs PATCH: PUT replaces a resource entirely (client sends every
field); PATCH updates only the fields provided. Modern JSON APIs
favor PATCH since clients usually want to change one or two fields,
not resend a whole object — though many teams use the two
interchangeably in practice, sticking to the semantic distinction
matters most for external/public APIs.

POST as the catch-all for custom actions: operations that don't fit
clean CRUD — like archiving an organization, which might cascade
into deleting related records or sending notifications rather than
just flipping a field — use POST, with the action named as the
final path segment (/organizations/5/archive). The response status
still reflects what actually happened server-side (archiving
returns 200 since nothing new was created; cloning returns 201
since a new resource was).


6. THE ACTUAL DESIGN WORKFLOW
---------------------------------------------------------------
1. Start from UI wireframes or direct requirements — this shows how
   end users will interact with data, the right altitude to begin
   API design from.
2. Extract nouns from those requirements — these become your
   resources (e.g., a project-management tool yields organizations,
   projects, tasks).
3. Design the database schema around those resources, including
   each resource's fields.
4. For each resource, enumerate needed actions — the CRUD set
   (create, list, get-one, update, delete) plus any custom actions.
5. Design the API interface itself — using a tool like Insomnia or
   Postman to define routes before writing any implementation code.


7. DESIGNING EACH CRUD OPERATION
---------------------------------------------------------------
Design Create (POST) first
  Method: POST
  URL: just the plural resource, no ID — /organizations
  Body: every field the client is allowed to set — exclude anything
        server-generated (ID, createdAt, updatedAt)
  Response on success: 201, plus the full created object (including
        the server-generated fields, so the client immediately
        knows the new ID)

Design List (GET) second
  Method: GET
  URL: same plural resource, same as create — /organizations
       (server tells them apart by HTTP method, not URL)
  Body: none — GET requests don't carry one
  Query params to design: page, limit for pagination; sortBy,
        sortOrder for sorting; any field name you want filterable
        (e.g. status)
  Response on success: 200, shaped as { data, total, page,
        totalPages } — even when data is empty

Design Get-single (GET with ID) third
  Method: GET
  URL: plural resource + the ID as a path segment — /organizations/5
  Body: none
  Response: 200 + the single object if found, 404 if that specific
        ID doesn't exist

Design Update (PATCH) fourth
  Method: PATCH (partial update — send only the fields changing)
  URL: same shape as get-single — /organizations/5
  Body: only the fields being changed, not the whole object
  Response: 200 + the updated object

Design Delete fifth
  Method: DELETE
  URL: same shape again — /organizations/5
  Body: none
  Response: 204, empty body

The pattern worth noticing: get-single, update, and delete all
share the exact same URL shape (/resource/:id) — only the HTTP
method changes between them. Create and list also share a URL
(/resource, no ID) and are distinguished the same way. That's why
the video kept saying "copy the previous route" — once you've
designed one pair, the rest follow the same shape by rule, not by
re-deciding each time.

Summary of the five:
- Create → POST to the plural resource URL (no ID); body contains
  client-settable fields only (excluding server-generated ones like
  ID/timestamps); response is 201 plus the full created object.
- List → GET to the same plural URL (method distinguishes it from
  create); no body; supports pagination/sorting/filtering via query
  params; response is 200.
- Get single → GET to the resource URL plus an ID path segment; no
  body; 200 if found, 404 if that specific resource doesn't exist.
- Update → PATCH to the same ID-based URL as get-single; body
  contains only the changing fields; response is 200 plus the
  updated object.
- Delete → DELETE to the same ID-based URL; no body; response is
  204 with an empty body.

Get-single, update, and delete all share the identical URL shape
(/resource/:id); only the method changes. Create and list share the
identical URL shape (/resource, no ID); only the method changes
between them.


8. LIST-ENDPOINT TECHNIQUES
---------------------------------------------------------------
- Pagination — page and limit query parameters; the server must
  never return an entire dataset in one response. Response shape:
  { data, total, page, totalPages }, where total is the full
  matching count independent of pagination, and totalPages derives
  from dividing total by limit. If the client sends neither
  parameter, the server applies sensible defaults rather than
  requiring them.
- Sorting — sortBy (which field) and sortOrder (ascending/
  descending) query parameters. Even with no client input, the
  server should apply a default sort (commonly createdAt,
  descending) so results stay consistent between identical calls,
  since databases don't guarantee row order otherwise.
- Filtering — a query parameter matching a field name narrows the
  list to matching records; multiple filters can be combined.


9. STATUS CODE CONVENTIONS
---------------------------------------------------------------
- 200 — general success: GET (single or list), successful
  PATCH/PUT, custom POST actions that don't create anything new.
- 201 — a POST that created a new resource.
- 204 — success with no content to return, standard for DELETE.
- 404 — reserved specifically for requests targeting one specific
  resource that doesn't exist. A list endpoint returning zero
  matching results is still 200 with an empty array — never a 404,
  since the client isn't requesting one specific entity.


10. CONSISTENCY PRINCIPLES
---------------------------------------------------------------
- Once a field name is chosen, use that exact name across every
  resource and endpoint — never abbreviate it differently
  elsewhere. A client who's integrated one endpoint reasonably
  assumes the same naming applies elsewhere.
- JSON payloads consistently use camelCase field names.
- The same URL pattern (plural resource, ID as a path segment for
  single-resource operations) applies identically across every
  resource in the system, so a consumer familiar with one endpoint
  can predict the shape of another.
- Provide sensible defaults wherever possible — for pagination,
  sorting, and even POST payload fields (e.g., a new organization's
  status defaulting to "active" if unspecified) — minimizing what a
  client must send.
- Avoid abbreviations in field names, since the person integrating
  an API lacks the context the designer has.
- Maintain interactive documentation (Swagger/OpenAPI) from early
  in development, both as a personal testing tool and as
  self-service documentation for integrators.


11. CLOSING FRAMING
---------------------------------------------------------------
API design is treated as a distinct phase, separate from and prior
to implementation, regardless of the eventual programming language
or framework. The recommendation is to dedicate real, separate time
to designing the interface — using a tool like Insomnia, Postman,
or an OpenAPI/Swagger spec — purely from the consumer's
perspective, before writing any implementation code.
=====================================================================

*/

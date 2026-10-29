/*
=====================================================================
 VIDEO 6 — What is Routing in Backend (Summary)
=====================================================================

1. HTTP METHOD vs ROUTE
   - The HTTP method (GET/POST/etc.) is the WHAT — your intent.
   - The route (URL path) is the WHERE — which resource.
   - Server combines method + route as a key mapped to one handler.
   Example: GET /api/books and POST /api/books are two DIFFERENT
   handlers, even though the route text is identical — the method
   makes them unique.


2. STATIC ROUTES
   - A fixed route string that never changes, e.g. /api/books
   - Always returns the same TYPE of response.


3. DYNAMIC ROUTES / PATH PARAMETERS
   - A route with a variable part, written with a colon:
       /api/users/:id
   - Whatever value comes in that slot gets extracted by the server.
   - Even numbers arrive as a string in a path parameter.
   - Used for semantic identity — "get me THIS specific user."
   Example: GET /api/users/123 -> server reads "123" as the id
   and fetches that one user.


4. QUERY PARAMETERS
   - Extra key-value data added after a ? in the URL.
   - Mostly used with GET (which has no request body).
   - Used for filtering, sorting, and pagination.
   Example: GET /api/books?page=2&limit=20
   -> fetches page 2 of results, 20 per page.

   DIFFERENCE FROM PATH PARAMETERS:
   - Path parameter = WHICH resource (e.g. /users/123 = user 123)
   - Query parameter = HOW to shape the response (e.g. ?sort=asc)


5. NESTED ROUTES
   - Not a separate type — just a practice of stacking path
     parameters to express deeper meaning.
   Example: /api/users/123/posts/456
   -> "the post with id 456, belonging to the user with id 123"
   Each level down (users -> users/123 -> users/123/posts) can
   still be its own valid, meaningful route on its own.


6. ROUTE VERSIONING
   - Prefixing routes with a version, e.g. /api/v1/products vs
     /api/v2/products.
   - Used when the response shape needs to change (e.g. a new
     mobile app needs different fields) without breaking existing
     clients still using the old version.
   - Lets you deprecate the old version on a timeline instead of
     breaking everyone at once.
   Example: /api/v1/products returns { id, name, price }
            /api/v2/products returns { id, title, price }
   Old clients keep working on v1 while new clients move to v2.


7. CATCH-ALL ROUTE
   - A final route (often written as /*) placed after all real
     routes are checked.
   - Catches any request that didn't match anything above.
   - Sends a friendly "not found" message instead of a silent
     null/empty response.

=====================================================================
*/
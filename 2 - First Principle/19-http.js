/*
=====================================================================
 VIDEO 5 — Understanding HTTP for Backend Engineers (Summary)
=====================================================================

1. HTTP IS STATELESS
   - Server remembers nothing between requests.
   - Every request must carry everything it needs (tokens, cookies).
   Example: you must send your login token on EVERY request, not
   just the first one.


2. CLIENT-SERVER MODEL
   - Client always starts the conversation, server only responds.


3. HTTP RUNS ON TCP
   - Reliable, connection-based transport.


4. HTTP VERSIONS
   - 1.0: new connection for every request (slow)
   - 1.1: persistent connections by default (keep-alive) — most used
   - 2.0: multiplexing, binary framing, header compression
   - 3.0: built on UDP/QUIC, faster, better with packet loss


5. MESSAGE STRUCTURE
   REQUEST:  method + URL + version + headers + blank line + body
   RESPONSE: version + status code + headers + blank line + body


6. HEADERS
   Key-value metadata sent with request/response. 4 types:
   - Request headers: user-agent, authorization, accept
   - General headers: date, cache-control, connection
   - Representation headers: content-type, content-length
   - Security headers: HSTS, CSP, X-Frame-Options
   Example: res.setHeader("Content-Type", "text/html")


7. HTTP METHODS
   - GET: fetch data
   - POST: create data
   - PUT: fully replace data
   - PATCH: partially update data
   - DELETE: remove data

   IDEMPOTENT (same result every time you call it): GET, PUT, DELETE
   NOT IDEMPOTENT (different result each call): POST
   Example: calling POST /notes twice creates 2 notes.
            calling PUT /notes/1 twice still leaves 1 note updated.


8. CORS (Cross-Origin Resource Sharing)
   - Browsers block requests to a different origin by default.
   - Simple requests (GET/POST/HEAD): server needs to send
     Access-Control-Allow-Origin header.
   - Complex requests (PUT/DELETE, custom headers, JSON body):
     browser sends an OPTIONS "preflight" request first, asking
     permission before sending the real request.
   Example: your own test — calling localhost:3000 from
   example.com got blocked with "No Access-Control-Allow-Origin
   header is present", even though your server responded 200 OK.
   CORS blocks the BROWSER from reading the response, not the
   server from sending it.


9. STATUS CODES
   2xx success: 200 OK, 201 Created, 204 No Content
   3xx redirect: 301 Permanent, 302 Temporary, 304 Not Modified
   4xx client error: 400 Bad Request, 401 Unauthorized,
                      403 Forbidden, 404 Not Found, 409 Conflict,
                      429 Too Many Requests
   5xx server error: 500 Internal, 502 Bad Gateway,
                      503 Unavailable, 504 Gateway Timeout


10. CACHING
    - Cache-Control (max-age), ETag (a fingerprint of the response),
      Last-Modified.
    - Client sends If-None-Match on repeat requests.
    - Server replies 304 (use your cached copy) or 200 (here's new
      data).
    Example: you added
       res.setHeader("Cache-Control", "max-age=10")
       res.setHeader("ETag", '"fake-etag-123"')
    and saw both appear in DevTools Network tab.


11. CONTENT NEGOTIATION
    - Accept: client's preferred format (Json, XML, HTML)
    - Accept-Language: preferred language
    - Accept-Encoding: supported compression (gzip, deflate, br)
    Example: your own headers dump showed
       accept-encoding: 'gzip, deflate, br, zstd'
       accept-language: 'en-GB,en-US;q=0.9,en;q=0.8'


12. COMPRESSION
    - gzip/deflate shrinks large responses.
    - Video's demo: 26MB file became 3.8MB compressed.


13. PERSISTENT CONNECTIONS
    - HTTP 1.1 reuses one TCP connection for multiple requests via
      keep-alive, instead of opening a new one every time.


14. LARGE PAYLOADS
    - multipart/form-data: used for file uploads, data sent in parts
    - chunked transfer / text-event-stream: server streams a large
      response to the client bit by bit instead of all at once


15. TLS / HTTPS
    - TLS encrypts traffic between client and server.
    - HTTPS = HTTP running over TLS.

=====================================================================
*/
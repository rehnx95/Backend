/* 
Video 8 — Authentication and Authorization (Summary)

Core definitions
Authentication = "who are you?" — establishing identity.
Authorization = "what can you do?" — establishing permissions.
Historical path (brief context)

Trust-based recognition (village elders vouching for people) → physical tokens (wax seals, prone to forgery) → shared secrets (telegraph passphrases — "something you know") → 1961 MIT's CTSS introduced computer passwords (stored in plaintext, leading to the first known password leak) → hashing emerged to store passwords irreversibly → 1970s asymmetric cryptography (Diffie-Hellman) became the backbone of modern auth protocols → 1990s MFA combined "something you know / have / are" → today's OAuth, JWT, zero trust, and passwordless systems.

Three core building blocks

Sessions — HTTP is stateless by design (no memory between requests), which was fine for static websites but broke down once apps needed to remember logged-in users or shopping carts. A session solves this: server generates a unique session ID at login, stores user data server-side (in a database or fast in-memory store like Redis), and sends just the ID to the browser as a cookie. Every future request includes that cookie, letting the server look up who the user is. Sessions evolved from file-based storage → database-backed → distributed in-memory stores (Redis/Memcached) as scale grew.

JWT (JSON Web Token) — emerged because storing/synchronizing session data across many distributed servers got expensive and introduced latency. A JWT is a self-contained, stateless token with three parts: a header (signing algorithm metadata), a payload (user ID, issued-at time, optional fields like name/role), and a signature (verifies the token hasn't been tampered with, using a secret key only the server holds). Advantages: no server-side storage needed, scales easily across many servers, and is portable (URL-safe, works in headers or cookies). Disadvantages: a stolen JWT can impersonate the user until it expires, and there's no clean way to revoke one early (short of changing the server's secret, which logs out everyone). A common fix is a hybrid approach — still using JWTs, but also checking a blacklist store for revoked tokens.

Cookies — a browser feature letting a server store a small piece of data (like a session ID or JWT) on the client, which the browser then automatically resends with every future request to that same server. This is the mechanism that makes sessions and some JWT flows work without the user manually resending a token each time.

Types of authentication

Stateful (session-based): server keeps a persistent record (often Redis) of who's logged in. Pros: centralized control, real-time visibility into active sessions, easy to revoke access. Cons: harder to scale across distributed servers, added latency in multi-region setups. Generally recommended default for most applications.

Stateless (JWT-based): all needed info lives inside the signed token itself, no server-side lookup required. Pros: scales easily, ideal for distributed systems and mobile apps. Cons: can't easily revoke access before expiry.

API key–based: a generated key tied to specific permissions, used for machine-to-machine communication (e.g., a server calling another company's API programmatically) rather than human/browser login flows.

OAuth 2.0 / OpenID Connect: solves the "delegation problem" — one platform needing limited access to another platform's resources (e.g., a travel app reading your Gmail) without ever sharing your password. OAuth handles authorization (issuing scoped, revocable tokens instead of full account access); OpenID Connect was added on top specifically to solve authentication (via a JWT-based ID token), which is what powers "Sign in with Google/Facebook" flows. OAuth 1.0 (2007) used complex cryptographic signatures; OAuth 2.0 (2010) simplified this with bearer tokens and different flows depending on the app type (authorization code flow for servers, client credentials flow for machine-to-machine, device code flow for limited-input devices like smart TVs).

Practical guidance given in the video: implement your own auth to understand it while learning, but for real production systems, using an established auth provider (Auth0, Clerk, etc.) is generally recommended over building it all yourself.

Authorization: RBAC (Role-Based Access Control)

Different users get different roles (user, admin, moderator), and each role has a defined set of permissions on specific resources. The server determines a user's role at authentication time (from the session or JWT) and attaches it to the request, so later logic can check "does this role have permission?" before allowing an action. A user without the right role gets a 403 Forbidden response.

Two important security practices

Generic error messages — never say "user not found" vs "incorrect password" separately; always return one generic "authentication failed" message. Specific messages leak information that helps attackers narrow down valid usernames or passwords.

Timing attacks — if checking a nonexistent username fails fast, but checking a wrong password fails slower (because it involves hashing), attackers can measure that time difference to figure out which case occurred. Defenses: constant-time comparison functions, or deliberately simulating a fixed delay so both failure paths take the same time.

*/

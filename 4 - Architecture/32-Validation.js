/*
Video 9 — Validations and Transformations (Summary)

Where it fits in the architecture: you already know the three layers (controller → service → repository). Validation happens at the very start — right after a route matches, before the controller calls the service layer, before any business logic runs at all. It's the gatekeeper for anything coming from the client: request body, query params, path params, even headers.

Why it exists: without it, bad data can travel all the way down to your database before anything catches it. Example from the video: if an API expects a string but gets a number, and there's no validation, that bad value reaches the repository layer, the database rejects the insert (because the column type doesn't match), and the client gets a generic 500 Internal Server Error — a poor experience that also reveals nothing useful. With validation at the entry point, the same bad input gets caught immediately and returned as a 400 Bad Request with a specific, useful error message.

Three types of validation

1. Syntactic — does the data follow the right structure? Is a string shaped like an email (name@domain.tld)? Is a phone number the right digit pattern? Is a date in the expected format? This is about pattern-matching the shape of the data, not whether the value makes sense.

2. Semantic — does the data make logical sense? A date of birth can't be in the future. An age of 365 is structurally a valid number but semantically nonsensical. This is checking meaning, not just format.

3. Type validation — does the data match the expected type? Is it actually a string, a number, a boolean, an array? If an array is expected, does every element inside it also match its expected type (e.g., an array of strings, not an array of numbers)?

Complex/combined validation — validation rules can also be conditional or relational across multiple fields: password and confirm-password must match; if married is true, a partner field becomes required. These aren't a separate "type," just validation logic that spans more than one field at once.

Transformation

Transformation is different from validation — it's changing the data into the format your service layer expects, either before or after validation runs. Classic example: query parameters arrive as strings always, even if the value is "20" meant to represent the number 20. If your validation rule says "must be a number greater than 0," it'll fail immediately on a raw string — so the string first needs to be cast into a number before that check can even run. Other transformation examples from the video: lowercasing an email regardless of how the user typed it, or reformatting a phone number to add a country code prefix. Validation and transformation are typically combined into a single pipeline so all the "what does this data need to look like" logic lives in one place.

Critical rule: frontend validation ≠ backend validation

Frontend validation exists purely for user experience — instant feedback so the user doesn't have to wait for a round trip to the server to find out they made a typo. It is not a security measure. Backend validation exists for security and data integrity, and it's mandatory — because not every client goes through your frontend. Someone can hit your API directly with Postman/Insomnia, with no frontend involved at all, bypassing any frontend checks entirely. If your backend trusts the frontend to have already validated the data, your server breaks (or worse, becomes exploitable) the moment any client skips that frontend. Server-side validation must be strict and complete on its own, regardless of what any particular client does.
*/

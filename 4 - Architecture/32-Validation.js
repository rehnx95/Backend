/*
=====================================================================
 VIDEO 9 — Validations and Transformations (Full Reference Summary)
=====================================================================

1. WHERE IT FITS IN THE ARCHITECTURE
---------------------------------------------------------------
You already know the three layers (controller → service →
repository). Validation happens at the very start — right after a
route matches, before the controller calls the service layer,
before any business logic runs at all. It's the gatekeeper for
anything coming from the client: request body, query params, path
params, even headers.


2. WHY IT EXISTS
---------------------------------------------------------------
Without it, bad data can travel all the way down to your database
before anything catches it. Example from the video: if an API
expects a string but gets a number, and there's no validation, that
bad value reaches the repository layer, the database rejects the
insert (because the column type doesn't match), and the client gets
a generic 500 Internal Server Error — a poor experience that also
reveals nothing useful. With validation at the entry point, the
same bad input gets caught immediately and returned as a 400 Bad
Request with a specific, useful error message.


3. THREE TYPES OF VALIDATION
---------------------------------------------------------------
1. Syntactic — does the data follow the right structure? Is a
   string shaped like an email (name@domain.tld)? Is a phone
   number the right digit pattern? Is a date in the expected
   format? This is about pattern-matching the shape of the data,
   not whether the value makes sense.

2. Semantic — does the data make logical sense? A date of birth
   can't be in the future. An age of 365 is structurally a valid
   number but semantically nonsensical. This is checking meaning,
   not just format.

3. Type validation — does the data match the expected type? Is it
   actually a string, a number, a boolean, an array? If an array
   is expected, does every element inside it also match its
   expected type (e.g., an array of strings, not an array of
   numbers)?


4. COMPLEX / COMBINED VALIDATION
---------------------------------------------------------------
Validation rules can also be conditional or relational across
multiple fields: password and confirm-password must match; if
married is true, a partner field becomes required. These aren't a
separate "type," just validation logic that spans more than one
field at once.


5. TRANSFORMATION
---------------------------------------------------------------
Transformation is different from validation — it's changing the
data into the format your service layer expects, either before or
after validation runs.

Classic example: query parameters arrive as strings always, even
if the value is "20" meant to represent the number 20. If your
validation rule says "must be a number greater than 0," it'll fail
immediately on a raw string — so the string first needs to be cast
into a number before that check can even run.

Other transformation examples from the video: lowercasing an email
regardless of how the user typed it, or reformatting a phone number
to add a country code prefix.

Validation and transformation are typically combined into a single
pipeline so all the "what does this data need to look like" logic
lives in one place.


6. CRITICAL RULE: FRONTEND VALIDATION ≠ BACKEND VALIDATION
---------------------------------------------------------------
Frontend validation exists purely for user experience — instant
feedback so the user doesn't have to wait for a round trip to the
server to find out they made a typo. It is not a security measure.

Backend validation exists for security and data integrity, and
it's mandatory — because not every client goes through your
frontend. Someone can hit your API directly with Postman/Insomnia,
with no frontend involved at all, bypassing any frontend checks
entirely. If your backend trusts the frontend to have already
validated the data, your server breaks (or worse, becomes
exploitable) the moment any client skips that frontend.

Server-side validation must be strict and complete on its own,
regardless of what any particular client does.
=====================================================================
*/

// ===== ZOD SYNTAX REFERENCE =====

const { z } = require("zod");

// ===== 1. BASIC TYPES =====
z.string();
z.number();
z.boolean();
z.date();
z.array(z.string());          // array of strings
z.object({ key: z.string() }); // nested object


// ===== 2. STRING VALIDATIONS =====
z.string().email();                    // must look like an email
z.string().min(6);                     // minimum length
z.string().max(100);                   // maximum length
z.string().length(10);                 // exact length
z.string().url();                      // must be a valid URL
z.string().uuid();                     // must be a valid UUID
z.string().regex(/^[0-9]+$/);          // must match a pattern
z.string().startsWith("prefix");
z.string().endsWith("suffix");
z.string().trim();                     // trims whitespace (transform)
z.string().toLowerCase();              // lowercases (transform)
z.string().toUpperCase();              // uppercases (transform)


// ===== 3. NUMBER VALIDATIONS =====
z.number().min(0);
z.number().max(120);
z.number().int();                      // must be an integer
z.number().positive();
z.number().nonnegative();              // >= 0


// ===== 4. OPTIONAL / DEFAULT / NULLABLE =====
z.string().optional();                 // field can be undefined
z.string().nullable();                 // field can be null
z.string().default("fallback value");  // uses this if not provided


// ===== 5. OBJECTS =====
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().optional(),
});

// nested object
const orgSchema = z.object({
  name: z.string(),
  owner: z.object({
    email: z.string().email(),
  }),
});


// ===== 6. ARRAYS =====
z.array(z.string());                   // array of strings
z.array(z.string()).min(1);            // at least 1 item
z.array(z.object({ id: z.number() })); // array of objects


// ===== 7. VALIDATING DATA =====

// .parse() — throws an error if invalid
try {
  const data = userSchema.parse(req.body);
} catch (err) {
  console.log(err.issues);
}

// .safeParse() — never throws, returns a result object (used so far)
const result = userSchema.safeParse(req.body);
if (!result.success) {
  console.log(result.error.issues); // array of validation errors
} else {
  console.log(result.data); // the validated (and transformed) data
}


// ===== 8. READING ERRORS =====
// result.error.issues is an array, each item looks like:
// {
//   code: 'too_small' | 'invalid_format' | ...,
//   path: ['fieldName'],
//   message: 'human-readable message'
// }


// ===== 9. CROSS-FIELD / CONDITIONAL VALIDATION (.refine) =====

// single custom rule
const signupSchema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // which field the error attaches to
});

// conditional requirement (e.g. married -> partner required)
const profileSchema = z.object({
  married: z.boolean(),
  partner: z.string().optional(),
}).refine((data) => !data.married || !!data.partner, {
  message: "Partner name is required when married is true",
  path: ["partner"],
});


// ===== 10. TRANSFORMATION (.transform) =====
z.string().transform((val) => val.trim());
z.string().email().toLowerCase();       // shorthand transform (used already)
z.string().transform((val) => Number(val)); // cast string -> number


// ===== 11. USING IN EXPRESS (the pattern you already use) =====
const schema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
});

async function signup(req, res) {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error.issues);
  }
  const { email, password } = result.data; // use .data, not req.body
  // ...
}
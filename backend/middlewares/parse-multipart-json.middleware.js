// middlewares/parse-multipart-json.middleware.js
/**
 * Parses known JSON-string fields from multipart/form-data into real objects
 * BEFORE validators run.
 *
 * Why: multipart form-data sends complex fields as JSON strings
 * (e.g. title='{"ar":"Test","fr":"Test"}'), but express-validator's dot-notation
 * checks (e.g. body("title.ar")) require title to be an object.
 *
 * Also handles array fields like `tags` and `removeImages` which arrive as
 * JSON strings like '["a","b"]' and must become real arrays.
 */
const FIELDS_TO_PARSE = [
  "title",
  "description",
  "seo",
  "variants",
  "tags",
  "removeImages",
];

const parseMultipartJSON = (req, res, next) => {
  if (!req.body) return next();

  for (const field of FIELDS_TO_PARSE) {
    const value = req.body[field];
    if (typeof value !== "string" || value.length === 0) continue;

    const trimmed = value.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) continue;

    try {
      req.body[field] = JSON.parse(trimmed);
    } catch {
      // Leave as-is — the controller will throw a proper ApiError
      // if this field was truly expected to be JSON.
    }
  }

  next();
};

export default parseMultipartJSON;

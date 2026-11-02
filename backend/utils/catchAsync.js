// utils/catchAsync.js
/**
 * Wraps an async controller so its rejections are forwarded to next().
 * Without this, Express 4 does not catch async throws and they become
 * "Unhandled rejection" warnings with no response sent to the client.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;

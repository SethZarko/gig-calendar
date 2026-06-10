/**
 * Wraps an asynchronous route to resolve route or catch errors and pass them to the global error middleware.
 * @param {Function} fn - The asynchronous route
 * @returns {Function} Express middleware handler
 */
export const asyncWrapper = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
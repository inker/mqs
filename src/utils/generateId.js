/**
 * Generates random string id
 */
export default () =>
  Math.random().toString(36).slice(2)

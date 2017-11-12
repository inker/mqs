export default (arr) =>
  [...arr].sort((a, b) => a.t.localeCompare(b.t))

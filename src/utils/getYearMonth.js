export default (str) =>
  str.split(/\D+/).slice(0, 2).map(s => s.padStart(2, '0')).join('-')

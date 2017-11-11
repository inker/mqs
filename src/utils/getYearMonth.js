export default (str) =>
  str.split(/\D*/).slice(0, 2).join('-')

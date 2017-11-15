const encoder = new TextEncoder('utf-8')

export default (o) => {
  const str = JSON.stringify(o)
  const arr = encoder.encode(str)
  return arr.buffer
}

const encoder = new TextEncoder('utf-8')
const decoder = new TextDecoder('utf-8')

export function toTransferable(o) {
  const str = JSON.stringify(o)
  const arr = encoder.encode(str)
  return arr.buffer
}

export function fromTransferable(buffer) {
  const str = decoder.decode(buffer)
  return JSON.parse(str)
}

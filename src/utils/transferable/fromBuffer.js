const decoder = new TextDecoder('utf-8')

export default (buffer) => {
  const str = decoder.decode(buffer)
  return JSON.parse(str)
}

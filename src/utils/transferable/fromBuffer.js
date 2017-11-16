const decoder = new TextDecoder('utf-8')

/**
 * ArrayBuffer -> object
 * @param {ArrayBuffer} buffer
 * @returns {object}
 */
export default (buffer) => {
  const str = decoder.decode(buffer)
  return JSON.parse(str)
}

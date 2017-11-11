const isObjectLike = (o) =>
  typeof o === 'object' && o !== null

export default function objectsAreEqual(o1, o2) {
  if (!isObjectLike(o1) || !isObjectLike(o2)) {
    return false
  }
  const keys1 = Object.keys(o1)
  const keys2 = Object.keys(o2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (const key of keys1) {
    if (!(key in o2)) {
      return false
    }
    const v1 = o1[key]
    const v2 = o2[key]
    if (isObjectLike(v1)) {
      if (!isObjectLike(v2) || !objectsAreEqual(v1, v2)) {
        return false
      }
    } else if (isObjectLike(v2) || v1 !== v2) {
      return false
    }
  }
  return true
}

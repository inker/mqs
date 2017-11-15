import { dbName } from './config.json'

let db

export default new Promise((resolve) => {
  if (db) {
    resolve(db)
  }

  const request = indexedDB.open(dbName, 2)

  request.onerror = () => {
    alert('could not connect to the database')
  }

  let promises

  request.onupgradeneeded = e => {
    console.log('upgrade needed', e)
    const upgradedDb = e.target.result

    promises = ['temperature', 'precipitation'].map(storeName => new Promise(res => {
      if (upgradedDb.objectStoreNames.contains(storeName)) {
        res()
      }
      const s = upgradedDb.createObjectStore(storeName, { keyPath: 'yearMonth' })
      s.transaction.oncomplete = () => {
        const store = upgradedDb.transaction(storeName, 'readwrite').objectStore(storeName)
        res(store)
      }
    }))
  }

  request.onsuccess = async e => {
    db = e.target.result

    if (!(db instanceof IDBDatabase)) {
      throw new Error('db is not IDBDatabase')
    }

    try {
      if (promises) {
        await Promise.all(promises)
      }
    } catch (err) {
      console.error('promises failed')
      throw err
    }
    console.log('db created', db)
    resolve(db)
  }
})

export const getFromStore = (storeName, key) =>
  new Promise(resolve => {
    db
      .transaction(storeName)
      .objectStore(storeName)
      .get(key)
      .onsuccess = e => resolve(e.target.result)
  })

export const getAll = (storeName) =>
  new Promise(resolve => {
    db
      .transaction(storeName)
      .objectStore(storeName)
      .getAll()
      .onsuccess = resolve
  })

export const putToStore = (storeName, o) =>
  new Promise((resolve, reject) => {
    const req = db
      .transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .put(o)
    req.onerror = reject
    req.onsuccess = resolve
  })

export const putMany = (storeName, arr) =>
  new Promise((resolve, reject) => {
    const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
    let i = 0
    function putNext() {
      const req = store.put(arr[i])
      req.onsuccess = ++i < arr.length ? putNext : resolve
      req.onerror = reject
    }
    putNext()
  })

export const clearStore = (storeName) =>
  new Promise((resolve, reject) => {
    const req = db
      .transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .clear()
    req.onerror = reject
    req.onsuccess = resolve
  })

export function clearAllStores() {
  const promises = Array.prototype.map.call(db.objectStoreNames, clearStore)
  return Promise.all(promises)
}

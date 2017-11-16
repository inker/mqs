import { dbName, weatherVariables } from './config.json'

const storeNames = weatherVariables.map(i => i.key)

let db
let dbPromise

const makeConnection = () => new Promise((resolve, reject) => {
  if (db) {
    resolve(db)
  }

  const request = indexedDB.open(dbName, 2)

  request.onerror = (e) => {
    reject(e)
    alert('could not connect to the database')
  }

  let createStorePromises

  request.onupgradeneeded = e => {
    const upgradedDb = e.target.result

    createStorePromises = storeNames.map(storeName => new Promise(res => {
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
      if (createStorePromises) {
        await Promise.all(createStorePromises)
      }
    } catch (err) {
      console.error('promises failed')
      throw err
    }

    db.onclose = () => {
      dbPromise = makeConnection()
      console.error('connection lost, restarting')
    }

    console.log('connection established', db)
    resolve(db)
  }
})

dbPromise = makeConnection()

export const ensureConnection = () => dbPromise || makeConnection()

export const getFromStore = (storeName, key) =>
  new Promise((resolve, reject) => {
    const req = db
      .transaction(storeName)
      .objectStore(storeName)
      .get(key)
    req.onerror = reject
    req.onsuccess = e => resolve(e.target.result)
  })

export const getMany = (storeName, keyRange) =>
  new Promise((resolve, reject) => {
    const req = db
      .transaction(storeName)
      .objectStore(storeName)
      .getAll(keyRange)
    req.onerror = reject
    req.onsuccess = e => resolve(e.target.result)
  })

export const putToStore = (storeName, o) =>
  new Promise((resolve, reject) => {
    const req = db
      .transaction(storeName, 'readwrite')
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
      req.onerror = reject
      req.onsuccess = ++i < arr.length ? putNext : resolve
    }
    putNext()
  })

export const clearStore = (storeName) =>
  new Promise((resolve, reject) => {
    const req = db
      .transaction(storeName, 'readwrite')
      .objectStore(storeName)
      .clear()
    req.onerror = reject
    req.onsuccess = resolve
  })

export function clearAllStores() {
  const promises = Array.prototype.map.call(db.objectStoreNames, clearStore)
  return Promise.all(promises)
}

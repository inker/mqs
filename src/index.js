import { weatherVariables, yearRange } from './config.json'
import dbPromise, { clearAllStores } from './db'

import fetchData from './fetchData'
import fromPairs from './utils/fromPairs'

import createMenu from './menu'
import createRange from './range'
import Graph from './Graph'

import './global.css'

const optionStore = {
  variable: weatherVariables[0].key,
  range: yearRange,
}

const graph = new Graph(
  document.getElementById('graph'),
  fromPairs(weatherVariables.map(i => [i.key, i.strokeColor])),
)

async function getDataAndRender(newOptions) {
  Object.assign(optionStore, newOptions)
  const data = await fetchData(optionStore.variable, optionStore.range)
  graph.render(data, optionStore)
}

createMenu(document.getElementById('menu'), weatherVariables, variable => {
  getDataAndRender({ variable })
})

createRange(document.getElementById('range'), optionStore.range, range => {
  getDataAndRender({ range })
})

document.getElementById('clear-idb').addEventListener('click', () => {
  dbPromise.then(clearAllStores)
    .then(() => alert('IDB successfully cleared'))
    .catch(console.error)
})

getDataAndRender(optionStore)

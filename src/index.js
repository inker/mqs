import dbPromise, { clearAllStores } from './db'

import getData from './utils/getData'
import fromPairs from './utils/fromPairs'

import createMenu from './menu'
import createRange from './range'
import Graph from './Graph'

import './global.css'

const weatherVariables = [
  {
    key: 'temperature',
    name: 'Температура',
    strokeColor: 'red',
  },
  {
    key: 'precipitation',
    name: 'Осадки',
    strokeColor: 'blue',
  },
]

const optionStore = {
  variable: 'temperature',
  range: [1881, 2006],
}

const graph = new Graph(
  document.getElementById('graph'),
  fromPairs(weatherVariables.map(i => [i.key, i.strokeColor])),
)

async function getDataAndRender(newOptions) {
  Object.assign(optionStore, newOptions)
  const data = await getData(optionStore.variable, optionStore.range)
  graph.render(data, optionStore)
}

createMenu(document.getElementById('menu'), weatherVariables, variable => {
  getDataAndRender({ variable })
})

createRange(document.getElementById('range'), optionStore.range, range => {
  getDataAndRender({ range })
})

document.getElementById('clear-localstorage').addEventListener('click', () => {
  dbPromise.then(clearAllStores).catch(console.error)
})

getDataAndRender(optionStore)

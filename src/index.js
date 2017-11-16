import { weatherVariables, yearRange } from '../config.json'
import { ensureConnection, clearAllStores } from './db'

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
  console.time('total time')
  Object.assign(optionStore, newOptions)
  try {
    const data = await fetchData(optionStore.variable, optionStore.range)
    graph.render(data, optionStore)
  } catch (err) {
    alert(err.message)
  }
  console.timeEnd('total time')
}

createMenu(document.getElementById('menu'), weatherVariables, variable => {
  getDataAndRender({ variable })
})

createRange(document.getElementById('range'), optionStore.range, range => {
  getDataAndRender({ range })
})

getDataAndRender(optionStore)

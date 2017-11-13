import getData from './utils/getData'
import fromPairs from './utils/fromPairs'

import createMenu from './menu'
import createRange from './range'
import Graph from './Graph'

import './global.css'

const weatherFactors = [
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
  factor: 'temperature',
  range: [1881, 2006],
}

const graph = new Graph(
  document.getElementById('graph'),
  fromPairs(weatherFactors.map(i => [i.key, i.strokeColor])),
)

async function getDataAndRender(newOptions) {
  Object.assign(optionStore, newOptions)
  const data = await getData(optionStore.factor, optionStore.range)
  graph.render(data, optionStore)
}

createMenu(document.getElementById('menu'), weatherFactors, factor => {
  getDataAndRender({ factor })
})

createRange(document.getElementById('range'), optionStore.range, range => {
  getDataAndRender({ range })
})

getDataAndRender(optionStore)

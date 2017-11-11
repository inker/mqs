import getData from './utils/getData'

import createMenu from './menu'
import createRange from './range'
import Graph from './Graph'

const menuItems = [
  {
    key: 'temperature',
    name: 'Температура',
  },
  {
    key: 'precipitation',
    name: 'Осадки',
  },
]

const optionStore = {
  factor: 'temperature',
  range: [1881, 2006],
}

const graph = new Graph(document.getElementById('graph'))

async function getDataAndRender(newOptions) {
  Object.assign(optionStore, newOptions)
  const data = await getData(optionStore.factor, optionStore.range)
  graph.render(data, optionStore)
}

createMenu(document.getElementById('menu'), menuItems, factor => {
  getDataAndRender({ factor })
})

createRange(document.getElementById('range'), optionStore.range, range => {
  getDataAndRender({ range })
})

import scaleData from '../utils/scaleData'
import normalizeData from '../utils/normalizeData'
import invertData from '../utils/invertData'
import translateData from '../utils/translateData'

// import objectsAreEqual from '../utils/objectsAreEqual'
import drawLine from '../utils/canvas/drawLine'

import styles from './styles.css'

const PADDING = 50

export default class Graph {
  /**
   * @constructor
   * @param {HTMLCanvasElement} canvas - canvas.
   * @param {object} strokeColors
   */
  constructor(canvas, strokeColors) {
    canvas.classList.add(styles.graph)
    this.canvas = canvas
    this.strokeColors = strokeColors
  }

  render(data, options) {
    // if (objectsAreEqual(this.options, options) && objectsAreEqual(this.data, data)) {
    //   return
    // }
    this.options = {
      ...options,
    }
    this.data = {
      ...data,
    }
    //
    const { canvas, strokeColors } = this
    const graphHeight = canvas.height >> 2
    const graphWidth = canvas.width

    console.time('data transformation')
    let vals = data.map(item => item.v)
    let dx = 1
    if (vals.length < graphWidth) {
      dx = graphWidth / vals.length
    } else {
      vals = scaleData(vals, graphWidth)
    }
    vals = normalizeData(vals, graphHeight)
    vals = invertData(vals, graphHeight)
    vals = translateData(vals, PADDING)
    console.timeEnd('data transformation')

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const lineWidth = 0.5
    for (let i = 1; i < vals.length; ++i) {
      const prevI = i - 1
      const a = {
        x: prevI * dx,
        y: vals[prevI],
      }
      const b = {
        x: i * dx,
        y: vals[i],
      }
      drawLine(ctx, a, b, strokeColors[options.variable], lineWidth)
    }
  }
}

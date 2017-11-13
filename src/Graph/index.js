import scaleData from '../utils/scaleData'

// import objectsAreEqual from '../utils/objectsAreEqual'
import drawLine from '../utils/canvas/drawLine'

import styles from './styles.css'

const PADDING_X = 50.5
const PADDING_Y = 20.5

function makeTransformFunc(arr, height) {
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const multiplier = height / (max - min)
  return {
    min,
    max,
    transform: item => {
      const normalized = (item - min) * multiplier
      const inverted = height - normalized
      return inverted + PADDING_Y
    },
  }
}

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
    const graphHeight = canvas.height - PADDING_Y * 2
    const graphWidth = canvas.width - PADDING_X * 2

    console.time('data transformation')
    let vals = data.map(item => item.v)
    let dx = 1
    if (vals.length < graphWidth) {
      dx = graphWidth / vals.length
    } else {
      vals = scaleData(vals, graphWidth)
    }
    const { min, max, transform } = makeTransformFunc(vals, graphHeight)
    vals = vals.map(transform)
    console.timeEnd('data transformation')

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = '15px sans-serif'
    ctx.textAlign = 'right'

    const lineWidth = 0.5
    for (let i = 1; i < vals.length; ++i) {
      const prevI = i - 1
      const a = {
        x: prevI * dx + PADDING_X,
        y: vals[prevI],
      }
      const b = {
        x: i * dx + PADDING_X,
        y: vals[i],
      }
      drawLine(ctx, a, b, strokeColors[options.variable], lineWidth)
    }

    drawLine(ctx, {
      x: PADDING_X,
      y: transform(min),
    }, {
      x: PADDING_X,
      y: transform(max),
    }, 'black', 1)
    ctx.fillText(min.toPrecision(3), PADDING_X - 5, transform(min))
    ctx.fillText(max.toPrecision(3), PADDING_X - 5, transform(max))
    if (min * max < 0) {
      const zeroY = transform(0)
      // has zero
      drawLine(ctx, {
        x: PADDING_X,
        y: zeroY,
      }, {
        x: PADDING_X + graphWidth,
        y: zeroY,
      }, 'black', 1)
      ctx.fillText(0, PADDING_X - 5, zeroY)
    }
  }
}

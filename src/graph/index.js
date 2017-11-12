import objectsAreEqual from '../utils/objectsAreEqual'
import scaleData from '../utils/scaleData'
import normalizeData from '../utils/normalizeData'

import styles from './styles.css'

const PADDING = 50

export default class Graph {
  /**
   * @constructor
   * @param {HTMLCanvasElement} canvas - canvas.
   */
  constructor(canvas) {
    canvas.classList.add(styles.graph)
    this.canvas = canvas
  }

  render(data, options) {
    if (objectsAreEqual(this.options, options) && objectsAreEqual(this.data, data)) {
      return
    }
    this.options = {
      ...options,
    }
    this.data = {
      ...data,
    }
    //
    const { canvas } = this
    let vals = data.map(item => item.v)
    vals = scaleData(vals, canvas.width - PADDING)
    vals = normalizeData(vals, canvas.height - PADDING)

    const ctx = canvas.getContext('2d')
  }
}

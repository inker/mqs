import objectsAreEqual from '../utils/objectsAreEqual'

import styles from './styles.css'

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
  }
}

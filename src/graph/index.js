import styles from './styles'

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
    this.options = {
      ...this.options,
      ...options,
    }
    
  }
}

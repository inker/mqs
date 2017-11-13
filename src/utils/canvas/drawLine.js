export default (ctx, p1, p2, strokeStyle, lineWidth = 1) => {
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

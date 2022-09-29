let touchTarget = null
let touchX
let touchY

function distance (x, y, b) {
  if (x > b.left && x < b.right && y > b.top && y < b.bottom) {
    return Math.max(b.left - x, x - b.right, b.top - y, y - b.bottom)
  } else {
    return Math.min(Math.abs(b.left - x), Math.abs(x - b.right), Math.abs(b.top - y), Math.abs(y - b.bottom))
  }
}

addEventListener('touchend', (ev) => {
  touchTarget = ev.target
  touchX = ev.pageX - scrollX
  touchY = ev.pageY - scrollY
}, true)

addEventListener('click', (ev) => {
  if (ev.target !== touchTarget) {
    const touchDist = distance(touchX, touchY, touchTarget.getBoundingClientRect())
    //const clickDist = distance(ev.clientX, ev.clientY, ev.target.getBoundingClientRect())
    const clickDist = distance(touchX, touchY, ev.target.getBoundingClientRect())

    console.log('click-fix',
      touchTarget, touchDist,
      ev.target, clickDist,
      touchDist >= 1 || clickDist <= -1
    )

    if (touchDist >= 1 || clickDist <= -1) {
      ev.stopPropagation()
    }
  }
}, true)

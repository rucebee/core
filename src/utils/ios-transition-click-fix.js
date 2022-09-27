let clickTarget = 0

addEventListener('touchstart', (ev) => {
  clickTarget = ev.target
}, true)

addEventListener('click', (ev) => {
  if (clickTarget !== ev.target) {
    ev.stopPropagation()
  }
}, true)

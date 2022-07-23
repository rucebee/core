// iOS:
// document.documentElement.clientHeight and innerHeight doesn't reflect
// top/bottom toolbar and keyboards

let vpDeltaY = innerHeight - visualViewport.height

function updateViewportDeltaY (ev) {
  let delta = innerHeight - visualViewport.height
  if (vpDeltaY !== delta) {
    vpDeltaY = delta
    document.documentElement.style.setProperty('--vp-delta-y', vpDeltaY + 'px')
    //console.log('vpDeltaY', vpDeltaY, ev)
  }
}

if (visualViewport) {
  document.documentElement.style.setProperty('--vp-delta-y', vpDeltaY + 'px')
  visualViewport.addEventListener('resize', updateViewportDeltaY)
  addEventListener('scroll', (ev) => {
    updateViewportDeltaY(ev)
    setTimeout(() => {
      updateViewportDeltaY()
    }, 100)
  })
}
